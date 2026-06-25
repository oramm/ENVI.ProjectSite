import React, { useEffect, useRef, useState } from "react";
import MainSetup from "../../../React/MainSetupReact";
import {
    CitySelector,
    ContractTypeSelector,
    EntitySelector,
    PersonSelectorPreloaded,
} from "../../../View/Modals/CommonFormComponents/BussinesObjectSelectors";
import { ContractModalBody } from "./ContractModalBody";
import { useFormContext } from "../../../View/Modals/FormContext";
import { Alert, Col, Form, Row, Spinner } from "react-bootstrap";
import { ModalBodyProps } from "../../../View/Modals/ModalsTypes";
import { citiesRepository, entitiesRepository } from "../ContractsController";
import { CityData, EntityData, OurContract } from "../../../../Typings/bussinesTypes";
import { MyAsyncTypeahead } from "../../../View/Modals/CommonFormComponents/GenericComponents";
import { CityInlineCreateDrawer, EntityInlineCreateDrawer } from "../../../View/Modals/InlineCreateDrawers";
import { fetchAqmMatch, AqmMatchResponse } from "./aqmMatchService";
import { normalizeNip } from "./nipValidator";

/** Text labels for the 3 AQM dedup match states (L11). */
const AQM_MATCH_LABELS: Record<AqmMatchResponse["match"], string> = {
    NIP: "Podmiot zostanie powiązany po NIP z istniejącą organizacją w AQM.",
    NAME: "Znaleziono organizację o zbieżnej nazwie bez NIP — wymagane potwierdzenie przed zapisem.",
    NONE: "Podmiot nie istnieje w AQM — zostanie utworzony automatycznie przy zapisie umowy.",
};

/** Variant for the match-state Alert. */
const AQM_MATCH_VARIANT: Record<AqmMatchResponse["match"], "success" | "warning" | "info"> = {
    NIP: "success",
    NAME: "warning",
    NONE: "info",
};

export function OurContractModalBody(props: ModalBodyProps<OurContract>) {
    const { initialData, isEditing } = props;
    const {
        register,
        trigger,
        setValue,
        watch,
        formState: { errors },
        control,
    } = useFormContext();
    const _type = watch("_type");
    const _employers = watch("_employers") as EntityData[] | undefined;
    const [showCreateCity, setShowCreateCity] = useState(false);
    const [showCreateEmployer, setShowCreateEmployer] = useState(false);

    // AQM match preview state (L11)
    const [matchState, setMatchState] = useState<AqmMatchResponse | null>(null);
    const [matchLoading, setMatchLoading] = useState(false);
    const [matchError, setMatchError] = useState<string | null>(null);
    const prevNipRef = useRef<string | null>(null);

    const isAqm = _type?.name === "AQM";

    useEffect(() => {
        setValue("_type", initialData?._type, { shouldValidate: true });
        setValue("ourId", initialData?.ourId || "", { shouldValidate: true });
        setValue("_city", initialData?._city, { shouldValidate: true });
        setValue("_admin", initialData?._admin, { shouldValidate: true });
        setValue("_manager", initialData?._manager, { shouldValidate: true });
        setValue("_employers", initialData?._employers, { shouldValidate: true });
    }, [initialData, setValue]);

    // Reset match state when switching away from AQM type
    useEffect(() => {
        if (!isAqm) {
            setMatchState(null);
            setMatchError(null);
            prevNipRef.current = null;
        }
    }, [isAqm]);

    // Trigger match preview when AQM employer is selected/changed (L11)
    useEffect(() => {
        if (!isAqm) return;

        const employer = _employers?.[0];
        if (!employer?.taxNumber) {
            setMatchState(null);
            setMatchError(null);
            prevNipRef.current = null;
            return;
        }

        const normalized = normalizeNip(employer.taxNumber);
        if (normalized === prevNipRef.current) return; // avoid duplicate calls
        prevNipRef.current = normalized;

        if (!/^\d{10}$/.test(normalized)) {
            // Invalid NIP — don't bother calling match; schema will show error
            setMatchState(null);
            setMatchError(null);
            return;
        }

        let cancelled = false;
        setMatchLoading(true);
        setMatchError(null);
        setMatchState(null);

        fetchAqmMatch(normalized, employer.name)
            .then((result) => {
                if (!cancelled) setMatchState(result);
            })
            .catch((err: unknown) => {
                if (!cancelled) {
                    setMatchError(
                        err instanceof Error ? err.message : "Nie udało się sprawdzić dopasowania w AQM.",
                    );
                }
            })
            .finally(() => {
                if (!cancelled) setMatchLoading(false);
            });

        return () => {
            cancelled = true;
        };
    }, [isAqm, _employers]);

    function handleCityCreated(created: CityData) {
        setValue("_city", created, { shouldValidate: true });
    }

    function handleEmployerCreated(created: EntityData) {
        if (isAqm) {
            // AQM: single employer only
            setValue("_employers", [created], { shouldValidate: true });
        } else {
            const current = (watch("_employers") as EntityData[]) || [];
            setValue("_employers", [...current, created], { shouldValidate: true });
        }
    }

    return (
        <>
            {/* AQM info-banner (L11): visible ONLY when type === AQM */}
            {isAqm && (
                <Alert variant="info" className="mb-3" data-testid="aqm-info-banner">
                    <strong>Integracja AQM:</strong> po zapisaniu umowy podmiot i umowa zostaną automatycznie
                    przekazane do systemu e-Aquamatic 3.0. Upewnij się, że Zamawiający ma poprawny NIP.
                </Alert>
            )}

            <Row>
                <Form.Group as={Col} controlId="_city">
                    <Form.Label>Miasto</Form.Label>
                    <CitySelector showValidationInfo={true} onRequestCreate={() => setShowCreateCity(true)} />
                </Form.Group>
                {!isEditing && (
                    <Form.Group as={Col} controlId="_type">
                        <ContractTypeSelector typesToInclude="our" />
                    </Form.Group>
                )}
            </Row>
            <ContractModalBody {...props} />
            <Row>
                <Form.Group as={Col} controlId="_manager">
                    <PersonSelectorPreloaded
                        label="Koordynator"
                        name="_manager"
                        repository={MainSetup.personsEnviRepository}
                    />
                </Form.Group>
                <Form.Group as={Col} controlId="_admin">
                    <PersonSelectorPreloaded
                        label="Administrator"
                        name="_admin"
                        repository={MainSetup.personsEnviRepository}
                    />
                </Form.Group>
                <Form.Group>
                    <Form.Label>Zamawiający</Form.Label>
                    {/* AQM: single employer (multiple=false); other types: multiple allowed */}
                    <EntitySelector
                        name="_employers"
                        multiple={!isAqm}
                        onRequestCreate={() => setShowCreateEmployer(true)}
                    />

                    {/* AQM match preview (L11): 3 states — NIP / NAME / NONE */}
                    {isAqm && matchLoading && (
                        <div className="mt-2 text-muted small d-flex align-items-center gap-1" data-testid="aqm-match-loading">
                            <Spinner animation="border" size="sm" />
                            <span>Sprawdzanie dopasowania w AQM…</span>
                        </div>
                    )}
                    {isAqm && !matchLoading && matchError && (
                        <Alert variant="warning" className="mt-2 py-1 px-2 small" data-testid="aqm-match-error">
                            Nie udało się sprawdzić dopasowania: {matchError}
                        </Alert>
                    )}
                    {isAqm && !matchLoading && !matchError && matchState && (
                        <Alert
                            variant={AQM_MATCH_VARIANT[matchState.match]}
                            className="mt-2 py-1 px-2 small"
                            data-testid={`aqm-match-state-${matchState.match}`}
                        >
                            {AQM_MATCH_LABELS[matchState.match]}
                            {matchState.organization && (
                                <span className="d-block text-muted">
                                    AQM: {matchState.organization.name}
                                    {matchState.organization.taxNr ? ` (NIP: ${matchState.organization.taxNr})` : ""}
                                </span>
                            )}
                        </Alert>
                    )}
                </Form.Group>
            </Row>
            <CityInlineCreateDrawer
                show={showCreateCity}
                onHide={() => setShowCreateCity(false)}
                title="Nowe miasto"
                repository={citiesRepository}
                onCreated={handleCityCreated}
            />
            <EntityInlineCreateDrawer
                show={showCreateEmployer}
                onHide={() => setShowCreateEmployer(false)}
                title="Nowy podmiot (zamawiający)"
                repository={entitiesRepository}
                onCreated={handleEmployerCreated}
            />
        </>
    );
}
