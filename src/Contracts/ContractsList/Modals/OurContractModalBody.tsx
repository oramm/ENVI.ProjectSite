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
    const _invoiceBuyer = watch("_invoiceBuyer") as EntityData | null | undefined;
    const [showCreateCity, setShowCreateCity] = useState(false);
    const [showCreateEmployer, setShowCreateEmployer] = useState(false);
    const [showCreateInvoiceBuyer, setShowCreateInvoiceBuyer] = useState(false);

    // AQM match preview state (L11)
    const [matchState, setMatchState] = useState<AqmMatchResponse | null>(null);
    const [matchLoading, setMatchLoading] = useState(false);
    const [matchError, setMatchError] = useState<string | null>(null);
    const prevNipRef = useRef<string | null>(null);

    // Nabywca-FV AQM match (incident 2026-07-17, umowa 871): a buyer NIP that
    // already exists as an AQM org signals the field was swapped with Zamawiający
    // (gmina normally is NOT in AQM). Advisory only — no loading/error UI.
    const [buyerMatch, setBuyerMatch] = useState<AqmMatchResponse | null>(null);
    const prevBuyerNipRef = useRef<string | null>(null);

    const isAqm = _type?.name === "AQM";

    useEffect(() => {
        setValue("_type", initialData?._type, { shouldValidate: true });
        setValue("ourId", initialData?.ourId || "", { shouldValidate: true });
        setValue("_city", initialData?._city, { shouldValidate: true });
        setValue("_admin", initialData?._admin, { shouldValidate: true });
        setValue("_manager", initialData?._manager, { shouldValidate: true });
        setValue("_employers", initialData?._employers, { shouldValidate: true });
        setValue("_invoiceBuyer", initialData?._invoiceBuyer, { shouldValidate: true });
    }, [initialData, setValue]);

    // Keep invoiceBuyerEntityId in lockstep with _invoiceBuyer (server ContractOur.ts derives
    // the FK from _invoiceBuyer.id when present; but on EDIT the previous invoiceBuyerEntityId
    // survives the merge with currentDataItem in GeneralModal, so clearing the picker needs an
    // EXPLICIT null here, not just an absent field, or the old id would stick server-side).
    useEffect(() => {
        setValue("invoiceBuyerEntityId", _invoiceBuyer?.id ?? null, { shouldDirty: false });
    }, [_invoiceBuyer, setValue]);

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

    // Nabywca-FV AQM match check (incident 2026-07-17). Mirrors the employer
    // effect but advisory-only: on error or non-AQM we just clear the warning.
    useEffect(() => {
        if (!isAqm || !_invoiceBuyer?.taxNumber) {
            setBuyerMatch(null);
            prevBuyerNipRef.current = null;
            return;
        }

        const normalized = normalizeNip(_invoiceBuyer.taxNumber);
        if (normalized === prevBuyerNipRef.current) return;
        prevBuyerNipRef.current = normalized;

        if (!/^\d{10}$/.test(normalized)) {
            setBuyerMatch(null);
            return;
        }

        let cancelled = false;
        fetchAqmMatch(normalized, _invoiceBuyer.name)
            .then((result) => {
                if (!cancelled) setBuyerMatch(result);
            })
            .catch(() => {
                if (!cancelled) setBuyerMatch(null);
            });

        return () => {
            cancelled = true;
        };
    }, [isAqm, _invoiceBuyer]);

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

    function handleInvoiceBuyerCreated(created: EntityData) {
        setValue("_invoiceBuyer", created, { shouldValidate: true });
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
                    {/* AQM stays array-shaped; schema enforces exactly one employer. */}
                    <EntitySelector
                        name="_employers"
                        multiple={true}
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
            <Row>
                <Form.Group>
                    <Form.Label>Nabywca FV (JST — gmina)</Form.Label>
                    <EntitySelector
                        name="_invoiceBuyer"
                        multiple={false}
                        showValidationInfo={false}
                        onRequestCreate={() => setShowCreateInvoiceBuyer(true)}
                    />
                    {_invoiceBuyer && !_invoiceBuyer.taxNumber && (
                        <div className="small text-warning mt-1">
                            ⚠ Nabywca FV nie ma NIP — KSeF odrzuci fakturę przy wysyłce. Uzupełnij NIP podmiotu.
                        </div>
                    )}
                    {_invoiceBuyer && !_invoiceBuyer.address && (
                        <div className="small text-warning mt-1">
                            ⚠ Nabywca FV nie ma adresu — na zwykłej fakturze adres jest obowiązkowy, KSeF odrzuci fakturę bez niego.
                        </div>
                    )}
                    {/* Cross-check vs Zamawiający (incident 871): swapped fields */}
                    {_invoiceBuyer && _employers?.[0] && _invoiceBuyer.id === _employers[0].id && (
                        <div className="small text-warning mt-1" data-testid="buyer-equals-employer-warning">
                            ⚠ Nabywca FV to ten sam podmiot co Zamawiający — prawdopodobnie pomyłka (zamienione pola?). Nabywca FV powinien być gminą (JST), a Zamawiający zakładem.
                        </div>
                    )}
                    {isAqm && buyerMatch?.match === "NIP" && (
                        <div className="small text-warning mt-1" data-testid="buyer-in-aqm-warning">
                            ⚠ Nabywca FV pasuje po NIP do organizacji w AQM
                            {buyerMatch.organization ? ` (${buyerMatch.organization.name})` : ""} — Nabywca FV to zwykle gmina, której NIE ma w AQM. Sprawdź, czy pola z Zamawiającym nie zostały zamienione.
                        </div>
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
            <EntityInlineCreateDrawer
                show={showCreateInvoiceBuyer}
                onHide={() => setShowCreateInvoiceBuyer(false)}
                title="Nowy podmiot (Nabywca FV)"
                repository={entitiesRepository}
                onCreated={handleInvoiceBuyerCreated}
            />
        </>
    );
}
