import React, { useState } from "react";
import { Alert, Button, Card, Col, Form, Row, Spinner } from "react-bootstrap";
import { useFormContext } from "../../View/Modals/FormContext";
import { GusStatus, GusStatusBadge, formatGusCheckedAt } from "../EntitiesBadges";
import {
    GUS_ACCEPTABLE_FIELDS,
    GusAcceptableField,
    GusSnapshot,
    acceptGusFields,
    checkEntityInGus,
} from "../gusEntityService";

/**
 * GUS-4b — okno różnic „w PS" / „w rejestrze GUS" w oknie podmiotu.
 *
 * ZASADA NADRZĘDNA PACKA (D-GUS-1): GUS proponuje, człowiek przyjmuje. Nic tutaj
 * nie zapisuje nazwy ani adresu inaczej niż przez zaznaczenie pola i kliknięcie
 * „Przyjmij zaznaczone". Trasa /gus/check zapisuje wyłącznie werdykt.
 *
 * Panel pokazuje się przy `DIFF` i `DIFF_MINOR`, czyli wtedy, gdy jest co porównywać.
 * Cztery pola (nazwa, adres, REGON, KRS) — tyle, ile umie przyjąć serwer
 * (GUS_ACCEPTABLE_FIELDS w PS-nodeJS/src/entities/gusBir/GusCompare.ts).
 *
 * Kolumnę „w PS" czytamy z FORMULARZA, nie z rekordu: człowiek mógł już coś w oknie
 * poprawić i porównywanie go z nieaktualnym odczytem byłoby kłamstwem. Po przyjęciu
 * pola wpisujemy wartość z rejestru z powrotem do formularza — inaczej „Zatwierdź"
 * w modalu odesłałby na serwer starą wartość i cofnęło przyjęcie.
 */

const FIELD_LABELS: Record<GusAcceptableField, string> = {
    name: "Nazwa",
    address: "Adres",
    regon: "REGON",
    krs: "KRS",
};

/** Wartość widoczna dla człowieka: pusty tekst pokazujemy myślnikiem, jak w makiecie. */
function shown(value?: string | null): string {
    const trimmed = (value ?? "").trim();
    return trimmed.length > 0 ? trimmed : "—";
}

function differs(inPs?: string | null, inGus?: string | null): boolean {
    return (inPs ?? "").trim() !== (inGus ?? "").trim();
}

/**
 * Które pola są zaznaczone przy otwarciu okna.
 *
 * Zgodnie z makietą zatwierdzoną przez właściciela: TYLKO te, przy których obie strony mają
 * wartość i te wartości się rozjeżdżają. To ta sama definicja różnicy, którą ma serwer
 * (`GusCompare` w PS-nodeJS): puste pole to brak danych, a nie sprzeczność.
 *
 * Widać to wprost na rekordzie 38 z makiety: nazwa i adres zaznaczone (obie strony mają
 * wartość, inną), REGON i KRS odznaczone (PS ich nie ma). Puste pole wolno przyjąć — wystarczy
 * je zaznaczyć — ale nikt nie robi tego za człowieka.
 */
export function initialSelection(
    psValues: Partial<Record<GusAcceptableField, string | undefined>>,
    snapshot: GusSnapshot | null | undefined
): GusAcceptableField[] {
    if (!snapshot) return [];
    return GUS_ACCEPTABLE_FIELDS.filter(
        (field) =>
            (snapshot[field] ?? "").trim().length > 0 &&
            (psValues[field] ?? "").trim().length > 0 &&
            differs(psValues[field], snapshot[field])
    );
}

export function EntityGusPanel({
    entityId,
    initialStatus,
    initialCheckedAt,
    initialSnapshot,
    entityValues,
}: {
    entityId: number;
    initialStatus?: GusStatus | null;
    initialCheckedAt?: string | Date | null;
    initialSnapshot?: GusSnapshot | null;
    /**
     * Dane podmiotu prosto z rekordu. Wstępne zaznaczenie liczymy WŁAŚNIE Z NICH, a nie
     * z formularza: formularz wypełnia `reset` w efekcie okna, który przy pierwszym renderze
     * panelu jeszcze się nie wykonał. Liczone z formularza zaznaczenie wychodziło losowe —
     * raz nazwa, raz nic (zmierzone na ekranie, rekord „ALLES COOL").
     */
    entityValues?: Partial<Record<GusAcceptableField, string | undefined>>;
}) {
    const { getValues, setValue, watch } = useFormContext();

    // Kolumna „w PS" ma pokazywać to, co JEST w formularzu w tej chwili — także wtedy,
    // gdy człowiek właśnie coś w nim poprawił. `getValues` nie odświeża widoku, `watch` tak.
    // Zanim formularz się wypełni, pokazujemy wartości z rekordu.
    const psValues: Record<GusAcceptableField, string | undefined> = {
        name: watch("name") ?? entityValues?.name,
        address: watch("address") ?? entityValues?.address,
        regon: watch("regon") ?? entityValues?.regon,
        krs: watch("krs") ?? entityValues?.krs,
    };

    const [status, setStatus] = useState<GusStatus | null>(initialStatus ?? null);
    const [checkedAt, setCheckedAt] = useState<string | Date | null>(initialCheckedAt ?? null);
    const [snapshot, setSnapshot] = useState<GusSnapshot | null>(initialSnapshot ?? null);
    const [selected, setSelected] = useState<GusAcceptableField[]>(() =>
        initialSelection(entityValues ?? {}, initialSnapshot)
    );
    const [pending, setPending] = useState<"check" | "accept" | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [info, setInfo] = useState<string | null>(null);

    function toggle(field: GusAcceptableField) {
        setSelected((current) =>
            current.includes(field) ? current.filter((item) => item !== field) : [...current, field]
        );
    }

    async function handleCheck() {
        setError(null);
        setInfo(null);
        setPending("check");
        try {
            const result = await checkEntityInGus(entityId);
            setStatus(result.status);
            setCheckedAt(result.checkedAt);
            setSnapshot(result.snapshot);
            setSelected(
                initialSelection(
                    {
                        name: getValues("name"),
                        address: getValues("address"),
                        regon: getValues("regon"),
                        krs: getValues("krs"),
                    },
                    result.snapshot
                )
            );
            setInfo("Sprawdzono w rejestrze. Dane podmiotu zostały nietknięte.");
        } catch (err) {
            setError(err instanceof Error ? err.message : "Błąd sprawdzenia w GUS");
        } finally {
            setPending(null);
        }
    }

    async function handleAccept() {
        if (selected.length === 0) return;
        setError(null);
        setInfo(null);
        setPending("accept");
        try {
            const result = await acceptGusFields(entityId, selected);
            for (const field of result.applied) {
                const fromGus = snapshot?.[field];
                if (fromGus !== undefined)
                    setValue(field, fromGus, { shouldDirty: false, shouldValidate: true });
            }
            setStatus(result.status);
            setSelected([]);
            setInfo(
                `Przyjęto z rejestru: ${result.applied.map((field) => FIELD_LABELS[field]).join(", ")}.`
            );
        } catch (err) {
            setError(err instanceof Error ? err.message : "Błąd przyjęcia danych z GUS");
        } finally {
            setPending(null);
        }
    }

    const checked = formatGusCheckedAt(checkedAt);

    return (
        <Card className="mb-3">
            <Card.Header className="d-flex flex-wrap align-items-center gap-2">
                <strong>Porównanie z rejestrem GUS</strong>
                <GusStatusBadge status={status} checkedAt={checkedAt} />
                {checked && <span className="text-muted small">sprawdzono {checked}</span>}
            </Card.Header>
            <Card.Body>
                <Row className="text-muted text-uppercase small border-bottom pb-1">
                    <Col xs={1} />
                    <Col xs={5}>w PS</Col>
                    <Col xs={6}>w rejestrze GUS</Col>
                </Row>

                {GUS_ACCEPTABLE_FIELDS.map((field) => {
                    const inPs = psValues[field];
                    const inGus = snapshot?.[field];
                    const hasGusValue = (inGus ?? "").trim().length > 0;
                    const isDifferent = hasGusValue && differs(inPs, inGus);
                    return (
                        <Row key={field} className="border-bottom py-2 align-items-start">
                            <Col xs={1}>
                                <Form.Check
                                    type="checkbox"
                                    id={`gus-accept-${field}`}
                                    aria-label={`Przyjmij z GUS: ${FIELD_LABELS[field]}`}
                                    checked={selected.includes(field)}
                                    disabled={!hasGusValue || pending !== null}
                                    onChange={() => toggle(field)}
                                />
                            </Col>
                            <Col xs={5}>
                                <div className="text-muted text-uppercase small">{FIELD_LABELS[field]}</div>
                                <div>{shown(inPs)}</div>
                            </Col>
                            <Col xs={6}>
                                <div className="text-muted text-uppercase small">{FIELD_LABELS[field]}</div>
                                <div>{isDifferent ? <mark>{shown(inGus)}</mark> : shown(inGus)}</div>
                            </Col>
                        </Row>
                    );
                })}

                {snapshot?.closedAt && (
                    <Alert variant="dark" className="mt-3 mb-0">
                        Rejestr podaje zakończenie działalności: {snapshot.closedAt}. Podmiot zostaje w słowniku
                        razem z historią — niczego nie ukrywamy ani nie kasujemy.
                    </Alert>
                )}

                <div className="d-flex flex-wrap gap-2 pt-3">
                    <Button
                        variant="primary"
                        size="sm"
                        onClick={handleAccept}
                        disabled={selected.length === 0 || pending !== null}
                    >
                        {pending === "accept" ? (
                            <>
                                <Spinner animation="border" size="sm" className="me-1" />
                                Przyjmowanie...
                            </>
                        ) : (
                            "Przyjmij zaznaczone"
                        )}
                    </Button>
                    <Button variant="outline-primary" size="sm" onClick={handleCheck} disabled={pending !== null}>
                        {pending === "check" ? (
                            <>
                                <Spinner animation="border" size="sm" className="me-1" />
                                Sprawdzanie...
                            </>
                        ) : (
                            "Sprawdź teraz w GUS"
                        )}
                    </Button>
                </div>

                {error && (
                    <Alert variant="danger" className="mt-3 mb-0" onClose={() => setError(null)} dismissible>
                        {error}
                    </Alert>
                )}
                {info && (
                    <Alert variant="success" className="mt-3 mb-0" onClose={() => setInfo(null)} dismissible>
                        {info}
                    </Alert>
                )}
            </Card.Body>
        </Card>
    );
}
