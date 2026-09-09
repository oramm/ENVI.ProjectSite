import React, { useEffect, useState } from "react";
import { Form, Button, Alert, Spinner } from "react-bootstrap";
import { useFormContext } from "../../View/Modals/FormContext";
import { ModalBodyProps } from "../../View/Modals/ModalsTypes";
import { EntityData } from "../../../Typings/bussinesTypes";
import { ErrorMessage } from "../../View/Modals/CommonFormComponents/GenericComponents";
import { lookupNip } from "./gusLookupService";
import { EntityGusPanel } from "./EntityGusPanel";
import { GusStatusBadge } from "../EntitiesBadges";

/**
 * GUS-4b / D-GUS-6 — nowy podmiot zakłada się Z REJESTRU, nie z klawiatury.
 *
 * Kolejność pól jest z makiety zatwierdzonej przez właściciela 2026-09-09: NIP stoi
 * pierwszy, bo od niego zaczyna się zakładanie podmiotu. Nazwa, adres, REGON i KRS
 * są przy dodawaniu ZABLOKOWANE do wpisywania — wypełnia je „Pobierz z GUS".
 *
 * WYJŚCIE AWARYJNE JEST KONIECZNE, blokada bez niego nie wchodzi w grę: 94 podmioty
 * w słowniku nie mają NIP-u, a jeden („AWT Rekultivace a.s.") jest czeski i polski
 * rejestr go nie zna. Przycisk „Dodaj mimo braku w rejestrze" odblokowuje wpisywanie
 * ręczne. Podmiot dodany tą drogą zostaje przy stanie „nie sprawdzano" — serwer nie
 * przyjmuje statusu z formularza (Entity.ts w PS-nodeJS), więc nie ma tu czego ustawiać.
 *
 * W trybie EDYCJI nic nie jest blokowane: rekord już istnieje, a poprawianie danych
 * ręcznie jest normalną pracą.
 */
export function EntityModalBody({ isEditing, initialData }: ModalBodyProps<EntityData>) {
    const {
        register,
        reset,
        getValues,
        setValue,
        formState: { dirtyFields, errors, isValid },
        trigger,
    } = useFormContext();

    const [gusLoading, setGusLoading] = useState(false);
    const [gusError, setGusError] = useState<string | null>(null);
    /** D-GUS-6: przy dodawaniu pola z rejestru odblokowuje albo GUS, albo wyjście awaryjne. */
    const [manualEntry, setManualEntry] = useState(false);
    const [gusFilled, setGusFilled] = useState(false);

    const registryFieldsLocked = !isEditing && !manualEntry && !gusFilled;

    // NIP-G1 — "Pobierz z GUS": autofill name+address from taxNumber, user can
    // still edit both before saving. BLOCKED until gate G-N1 in prod (503 with
    // a readable message until the owner sets GUS_BIR_KEY).
    //
    // GUS-1: REGON i KRS też wchodzą do formularza. Serwis zwracał je od lipca, tylko
    // nie było gdzie ich zapisać — teraz Entities ma kolumny Regon i Krs. Gdy GUS ich
    // nie podał (osoba fizyczna nie ma KRS-u), pole jest czyszczone, a nie zostawiane
    // z wartością poprzedniego podmiotu.
    const handleFetchFromGus = async () => {
        const nip = getValues("taxNumber");
        setGusError(null);
        setGusLoading(true);
        try {
            const result = await lookupNip(nip);
            setValue("name", result.name, { shouldDirty: true, shouldValidate: true });
            setValue("address", result.address, { shouldDirty: true, shouldValidate: true });
            setValue("regon", result.regon ?? "", { shouldDirty: true, shouldValidate: true });
            setValue("krs", result.krs ?? "", { shouldDirty: true, shouldValidate: true });
            setGusFilled(true);
        } catch (err) {
            setGusError(err instanceof Error ? err.message : "Błąd wyszukiwania GUS");
        } finally {
            setGusLoading(false);
        }
    };

    useEffect(() => {
        const resetData: any = {
            name: initialData?.name,
            shortName: initialData?.shortName,
            address: initialData?.address,
            taxNumber: initialData?.taxNumber,
            regon: initialData?.regon,
            krs: initialData?.krs,
            www: initialData?.www,
            email: initialData?.email,
            phone: initialData?.phone,
        };
        reset(resetData);
        trigger();
    }, [initialData, reset]);

    const showGusPanel =
        isEditing &&
        !!initialData?.id &&
        (initialData?.gusStatus === "DIFF" || initialData?.gusStatus === "DIFF_MINOR");

    return (
        <>
            {showGusPanel && initialData && (
                <EntityGusPanel
                    entityId={initialData.id}
                    initialStatus={initialData.gusStatus}
                    initialCheckedAt={initialData.gusCheckedAt}
                    initialSnapshot={initialData.gusSnapshot}
                    entityValues={{
                        name: initialData.name,
                        address: initialData.address,
                        regon: initialData.regon,
                        krs: initialData.krs,
                    }}
                />
            )}
            {/* Stan porównania widać w oknie podmiotu ZAWSZE, nie tylko przy różnicy. Przy różnicy
                niesie go nagłówek panelu porównania wyżej, przy pozostałych stanach ta linijka. */}
            {isEditing && !!initialData?.id && !showGusPanel && (
                <div className="mb-3">
                    <GusStatusBadge status={initialData?.gusStatus} checkedAt={initialData?.gusCheckedAt} />
                </div>
            )}

            <Form.Group controlId="taxNumber">
                <Form.Label>NIP</Form.Label>
                <div className="d-flex align-items-start gap-2">
                    <Form.Control
                        placeholder="Podaj numer podatkowy"
                        isInvalid={!!errors?.taxNumber}
                        isValid={!errors?.taxNumber}
                        {...register("taxNumber")}
                    />
                    <Button
                        variant="outline-secondary"
                        size="sm"
                        className="text-nowrap"
                        onClick={handleFetchFromGus}
                        disabled={gusLoading || !!errors?.taxNumber || !getValues("taxNumber")}
                    >
                        {gusLoading ? (
                            <>
                                <Spinner animation="border" size="sm" className="me-1" />
                                Pobieranie...
                            </>
                        ) : (
                            "Pobierz z GUS"
                        )}
                    </Button>
                </div>
                <ErrorMessage name="taxNumber" errors={errors} />
                {gusError && (
                    <Alert variant="danger" className="mt-2 mb-0" onClose={() => setGusError(null)} dismissible>
                        {gusError}
                    </Alert>
                )}
            </Form.Group>

            {registryFieldsLocked && (
                <Alert variant="light" className="border mt-2">
                    <div>
                        Nazwę, adres, REGON i KRS pobiera się z rejestru — wpisz NIP i kliknij „Pobierz z GUS".
                        Dzięki temu rozbieżności nie powstają już przy zakładaniu podmiotu.
                    </div>
                    <Button variant="outline-secondary" size="sm" className="mt-2" onClick={() => setManualEntry(true)}>
                        Dodaj mimo braku w rejestrze
                    </Button>
                </Alert>
            )}
            {!isEditing && manualEntry && (
                <Alert variant="warning" className="mt-2">
                    Dane wpisujesz ręcznie — rejestr tego podmiotu nie zna albo nie ma on polskiego NIP-u. Podmiot
                    zostanie zapisany ze stanem „GUS: nie sprawdzano".
                </Alert>
            )}

            <Form.Group controlId="name">
                <Form.Label>Nazwa</Form.Label>
                <Form.Control
                    as="textarea"
                    rows={2}
                    placeholder={registryFieldsLocked ? "Wypełni się po pobraniu z GUS" : "Podaj nazwę"}
                    disabled={registryFieldsLocked}
                    isInvalid={!!errors?.name}
                    isValid={!errors?.name}
                    {...register("name")}
                />
                <ErrorMessage name="name" errors={errors} />
            </Form.Group>

            <Form.Group controlId="address">
                <Form.Label>Adres</Form.Label>
                <Form.Control
                    placeholder={registryFieldsLocked ? "Wypełni się po pobraniu z GUS" : "Podaj adres"}
                    disabled={registryFieldsLocked}
                    isInvalid={!!errors?.address}
                    isValid={!errors?.address}
                    {...register("address")}
                />
                <ErrorMessage name="address" errors={errors} />
            </Form.Group>

            {/* GUS-1: oba pola wypelnia przycisk "Pobierz z GUS", ale wolno je tez wpisac recznie -
                REGON bywa jedynym kluczem dla podmiotu, któremu brakuje NIP-u. */}
            <Form.Group controlId="regon">
                <Form.Label>REGON</Form.Label>
                <Form.Control
                    placeholder="Podaj REGON (wypełnia się przy pobraniu z GUS)"
                    maxLength={14}
                    disabled={registryFieldsLocked}
                    isInvalid={!!errors?.regon}
                    isValid={!errors?.regon}
                    {...register("regon")}
                />
                <ErrorMessage name="regon" errors={errors} />
            </Form.Group>

            <Form.Group controlId="krs">
                <Form.Label>KRS</Form.Label>
                <Form.Control
                    placeholder="Podaj numer KRS (wypełnia się przy pobraniu z GUS)"
                    maxLength={10}
                    disabled={registryFieldsLocked}
                    isInvalid={!!errors?.krs}
                    isValid={!errors?.krs}
                    {...register("krs")}
                />
                <ErrorMessage name="krs" errors={errors} />
            </Form.Group>

            {/* D-GUS-6: nazwa skrócona zostaje polem własnym PS - rejestr jej nie zna,
                więc nigdy nie jest blokowana ani nadpisywana przez GUS. */}
            <Form.Group controlId="shortName">
                <Form.Label>Skrócona nazwa</Form.Label>
                <Form.Control
                    placeholder="Podaj skróconą nazwę (max 15 znaków) (Potrzebna do nazwy folderu kontraktu na dysku)"
                    maxLength={15}
                    isInvalid={!!errors?.shortName}
                    isValid={!errors?.shortName}
                    {...register("shortName")}
                />
                <ErrorMessage name="shortName" errors={errors} />
            </Form.Group>

            <Form.Group controlId="www">
                <Form.Label>WWW</Form.Label>
                <Form.Control
                    placeholder="Podaj adres strony www"
                    isInvalid={!!errors?.www}
                    isValid={!errors?.www}
                    {...register("www")}
                />
                <ErrorMessage name="www" errors={errors} />
            </Form.Group>

            <Form.Group controlId="email">
                <Form.Label>Email</Form.Label>
                <Form.Control
                    type="email"
                    placeholder="Podaj adres email"
                    isInvalid={!!errors?.email}
                    isValid={!errors?.email}
                    {...register("email")}
                />
                <ErrorMessage name="email" errors={errors} />
            </Form.Group>

            <Form.Group controlId="phone">
                <Form.Label>Telefon</Form.Label>
                <Form.Control
                    placeholder="Podaj numer telefonu"
                    isInvalid={!!errors?.phone}
                    isValid={!errors?.phone}
                    {...register("phone")}
                />
                <ErrorMessage name="phone" errors={errors} />
            </Form.Group>
        </>
    );
}
