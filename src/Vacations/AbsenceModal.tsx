import React, { useEffect, useState } from "react";
import { Alert, Button, ButtonGroup, Form, Modal, ToggleButton } from "react-bootstrap";
import {
    ScrumboardAbsenceType,
    ScrumboardVacationRow,
} from "../../Typings/bussinesTypes";
import {
    MINUTES_PER_DAY,
    formatDays,
    formatHours,
    isWeekendYmd,
    minutesToDays,
    partialDayMinutes,
} from "./vacationViewUtils";

export interface AbsenceDraft {
    id?: number;
    personId?: number;
    typeId?: number;
    dateFrom?: string;
    dateTo?: string;
    /** 'HH:MM' albo null. Oba wypełnione = nieobecność na część jednego dnia. */
    startTime?: string | null;
    endTime?: string | null;
    note?: string | null;
}

interface Props {
    show: boolean;
    draft: AbsenceDraft | null;
    persons: { personId: number; personName: string }[];
    types: ScrumboardAbsenceType[];
    /** Wiersze osób z saldami - potrzebne tylko do podpowiedzi "ile zostanie w puli". */
    rows: ScrumboardVacationRow[];
    onSave: (payload: {
        id?: number;
        personId: number;
        typeId: number;
        dateFrom: string;
        dateTo: string;
        startTime: string | null;
        endTime: string | null;
        note: string | null;
    }) => Promise<void>;
    onDelete: (id: number) => void;
    onClose: () => void;
}

type Mode = "whole" | "partial";

/**
  * Godziny startują PUSTE - decyzja ownera 2026-09-02. Podpowiedziana z góry połówka dnia
  * wygląda jak wpis, którego nikt nie zrobił, i kusi, żeby ją zostawić bez czytania.
  */
const NO_TIME = "";

/** Nieobecność godzinowa idzie na pełne godziny, bez minut (decyzja ownera 2026-09-02). */
function isWholeHour(time: string): boolean {
    return /^\d{2}:00$/.test(time);
}

/**
 * Z której puli schodzi typ nieobecności. Kolejność musi odpowiadać kontrolerowi
 * (assertTypeWithinPool): opieka → za święta → limit urlopu.
 */
function poolHint(type: ScrumboardAbsenceType): string {
    if (type.countsAsCare) return " (z puli opieki)";
    if (type.countsAsHoliday) return " (z puli za święta)";
    if (type.countsAgainstLimit) return "";
    return " (nie liczy do limitu)";
}

/** Odmiana słowa "dzień" przy liczbie: 1 dzień, 2 dni, 0,5 dnia. */
function daysWord(days: number): string {
    if (!Number.isInteger(days)) return "dnia";
    return days === 1 ? "dzień" : "dni";
}

/** Nazwa puli w zdaniu ("W puli opieki zostanie...") i jej stan po stronie osoby. */
function poolState(
    type: ScrumboardAbsenceType | undefined,
    row: ScrumboardVacationRow | undefined
): { label: string; remaining: number } | null {
    if (!type || !row) return null;
    if (type.countsAsCare)
        return { label: "puli opieki", remaining: row.careRemainingDays };
    if (type.countsAsHoliday)
        return { label: "puli wolnego za święta", remaining: row.holidayRemainingDays };
    if (type.countsAgainstLimit)
        return { label: "limicie urlopu", remaining: row.remainingDays };
    return null;
}

/** Modal dodawania/edycji urlopu. Osobę wybieramy tylko przy dodawaniu. */
export default function AbsenceModal({
    show,
    draft,
    persons,
    types,
    rows,
    onSave,
    onDelete,
    onClose,
}: Props) {
    const isEdit = !!draft?.id;
    const [personId, setPersonId] = useState<number | undefined>();
    const [typeId, setTypeId] = useState<number | undefined>();
    const [mode, setMode] = useState<Mode>("whole");
    const [dateFrom, setDateFrom] = useState("");
    const [dateTo, setDateTo] = useState("");
    const [startTime, setStartTime] = useState(NO_TIME);
    const [endTime, setEndTime] = useState(NO_TIME);
    const [note, setNote] = useState("");
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!draft) return;
        setPersonId(draft.personId);
        setTypeId(draft.typeId ?? types[0]?.id);
        setDateFrom(draft.dateFrom ?? "");
        setDateTo(draft.dateTo ?? draft.dateFrom ?? "");
        // Otwarcie istniejącej nieobecności godzinowej wchodzi od razu w tryb części dnia.
        const hasTimes = !!draft.startTime && !!draft.endTime;
        setMode(hasTimes ? "partial" : "whole");
        setStartTime(draft.startTime ?? NO_TIME);
        setEndTime(draft.endTime ?? NO_TIME);
        setNote(draft.note ?? "");
        setError(null);
    }, [draft, types]);

    const selectedType = types.find((t) => t.id === typeId);
    const allowsPartial = selectedType?.allowsPartialDay !== false;

    // Typ bez zgody na godziny wyklucza tryb części dnia - także wtedy, gdy użytkownik
    // przestawił typ już po wybraniu trybu. Serwer odrzuciłby taki zapis komunikatem,
    // ale okno nie powinno pozwolić go nawet złożyć.
    useEffect(() => {
        if (!allowsPartial && mode === "partial") setMode("whole");
    }, [allowsPartial, mode]);

    const isPartial = mode === "partial";
    const minutes = isPartial ? partialDayMinutes(startTime, endTime) : 0;
    const days = minutesToDays(minutes);
    const row = rows.find((r) => r.personId === personId);
    const pool = poolState(selectedType, row);
    // Przy edycji własny wpis siedzi już w saldzie, więc trzeba go najpierw oddać puli,
    // inaczej podpowiedź odjęłaby te same dni dwa razy.
    const ownAbsence = draft?.id
        ? row?.absences.find((a) => a.id === draft.id)
        : undefined;
    const ownDays =
        ownAbsence && ownAbsence.typeId === typeId
            ? ownAbsence.workingDaysCount
            : 0;

    /** Sprawdzenia dublujące serwer - tylko po to, żeby odpowiedź przyszła od razu. */
    function validate(): string | null {
        if (!personId) return "Wybierz osobę";
        if (!typeId) return "Wybierz typ urlopu";
        if (!dateFrom) return "Podaj datę";
        if (isPartial) {
            if (!startTime || !endTime) return "Podaj godzinę od i do.";
            if (!isWholeHour(startTime) || !isWholeHour(endTime))
                return "Nieobecność godzinową wpisuje się w pełnych godzinach — bez minut.";
            if (isWeekendYmd(dateFrom))
                return "To dzień wolny — nieobecności godzinowej nie ma z czego odjąć.";
            if (minutes <= 0)
                return "Godzina końcowa musi być późniejsza niż początkowa.";
            if (minutes >= MINUTES_PER_DAY)
                return "To cały dzień pracy — przełącz na tryb «Całe dni».";
            return null;
        }
        if (!dateTo) return "Podaj zakres dat";
        if (dateTo < dateFrom)
            return "Data końcowa nie może być wcześniejsza niż początkowa";
        if (dateFrom.slice(0, 4) !== dateTo.slice(0, 4))
            return "Nieobecność na przełomie roku wpisz osobno dla każdego roku — pule dni rozliczają się rocznikami.";
        return null;
    }

    async function handleSave() {
        const problem = validate();
        if (problem) return setError(problem);
        setError(null);
        try {
            // Błąd serwera (np. brak dni opieki) pokazujemy TU, w modalu — modal zostaje otwarty,
            // tabela urlopów nie znika. Zamknięcie następuje po stronie rodzica dopiero po sukcesie.
            await onSave({
                id: draft?.id,
                personId: personId as number,
                typeId: typeId as number,
                dateFrom,
                // Część dnia z definicji mieści się w jednym dniu.
                dateTo: isPartial ? dateFrom : dateTo,
                startTime: isPartial ? startTime : null,
                endTime: isPartial ? endTime : null,
                note: note.trim() || null,
            });
        } catch (err) {
            setError(err instanceof Error ? err.message : String(err));
        }
    }

    /** Podpowiedź pod polami: ile dnia to zdejmuje i ile zostanie w puli. */
    function renderPartialHint() {
        if (!isPartial) return null;
        if (minutes <= 0 || minutes >= MINUTES_PER_DAY) return null;
        // Przy edycji własny wpis wraca do puli, zanim odejmiemy nową długość.
        const available = pool ? pool.remaining + ownDays : null;
        const after = available !== null ? available - days : null;
        const overdrawn = after !== null && after < 0;
        return (
            <Form.Text
                muted={!overdrawn}
                className={`d-block mb-2${overdrawn ? " text-danger" : ""}`}
            >
                {formatHours(minutes)} = {formatDays(days)} dnia.{" "}
                {available === null ? (
                    "Ten typ nie schodzi z żadnej puli."
                ) : overdrawn ? (
                    <>
                        To więcej, niż zostało w {pool!.label}:{" "}
                        <strong>{formatDays(available)}</strong>{" "}
                        {daysWord(available)}. Serwer takiego wpisu nie przyjmie.
                    </>
                ) : (
                    <>
                        W {pool!.label} zostanie{" "}
                        <strong>{formatDays(after as number)}</strong>{" "}
                        {daysWord(after as number)}.
                    </>
                )}
            </Form.Text>
        );
    }

    return (
        <Modal show={show} onHide={onClose} centered>
            <Modal.Header closeButton>
                <Modal.Title>{isEdit ? "Edytuj urlop" : "Dodaj urlop"}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form.Group className="mb-2">
                    <Form.Label>Osoba</Form.Label>
                    <Form.Select
                        value={personId ?? ""}
                        disabled={isEdit}
                        onChange={(e) => setPersonId(Number(e.target.value) || undefined)}
                    >
                        <option value="">— wybierz —</option>
                        {persons.map((p) => (
                            <option key={p.personId} value={p.personId}>
                                {p.personName}
                            </option>
                        ))}
                    </Form.Select>
                </Form.Group>
                <Form.Group className="mb-2">
                    <Form.Label>Typ</Form.Label>
                    <Form.Select
                        value={typeId ?? ""}
                        onChange={(e) => setTypeId(Number(e.target.value) || undefined)}
                    >
                        {types.map((t) => (
                            <option key={t.id} value={t.id}>
                                {t.name}
                                {poolHint(t)}
                            </option>
                        ))}
                    </Form.Select>
                </Form.Group>

                {/*
                  * Przełącznik pojawia się TYLKO dla typów, które wolno brać na godziny.
                  * Dla pozostałych znika w całości - razem z wyjaśnieniem, dlaczego go nie ma
                  * (decyzja ownera 2026-09-02). Wyłączony przycisk z notką pod spodem zajmował
                  * miejsce i tłumaczył coś, o co nikt nie pytał; brak wyboru mówi to samo krócej.
                  */}
                {allowsPartial && (
                    <ButtonGroup className="w-100 mb-2" aria-label="Wymiar nieobecności">
                        <ToggleButton
                            id="absence-mode-whole"
                            type="radio"
                            variant="outline-primary"
                            name="absence-mode"
                            value="whole"
                            checked={!isPartial}
                            onChange={() => setMode("whole")}
                        >
                            Całe dni
                        </ToggleButton>
                        <ToggleButton
                            id="absence-mode-partial"
                            type="radio"
                            variant="outline-primary"
                            name="absence-mode"
                            value="partial"
                            checked={isPartial}
                            onChange={() => setMode("partial")}
                        >
                            Część dnia
                        </ToggleButton>
                    </ButtonGroup>
                )}

                {isPartial ? (
                    <>
                        <div className="d-flex gap-2 mb-1 flex-wrap">
                            <Form.Group className="flex-fill" style={{ minWidth: 140 }}>
                                <Form.Label>Dzień</Form.Label>
                                <Form.Control
                                    type="date"
                                    value={dateFrom}
                                    onChange={(e) => {
                                        setDateFrom(e.target.value);
                                        setDateTo(e.target.value);
                                    }}
                                />
                            </Form.Group>
                            <Form.Group className="flex-fill" style={{ minWidth: 110 }}>
                                <Form.Label>Od</Form.Label>
                                <Form.Control
                                    type="time"
                                    // krok godzinowy: przeglądarka podpowiada same pełne godziny
                                    step={3600}
                                    value={startTime}
                                    onChange={(e) => setStartTime(e.target.value)}
                                />
                            </Form.Group>
                            <Form.Group className="flex-fill" style={{ minWidth: 110 }}>
                                <Form.Label>Do</Form.Label>
                                <Form.Control
                                    type="time"
                                    step={3600}
                                    value={endTime}
                                    min={startTime || undefined}
                                    onChange={(e) => setEndTime(e.target.value)}
                                />
                            </Form.Group>
                        </div>
                        {renderPartialHint()}
                    </>
                ) : (
                    <div className="d-flex gap-2 mb-2 flex-wrap">
                        <Form.Group className="flex-fill" style={{ minWidth: 140 }}>
                            <Form.Label>Od</Form.Label>
                            <Form.Control
                                type="date"
                                value={dateFrom}
                                onChange={(e) => {
                                    setDateFrom(e.target.value);
                                    if (!dateTo || dateTo < e.target.value)
                                        setDateTo(e.target.value);
                                }}
                            />
                        </Form.Group>
                        <Form.Group className="flex-fill" style={{ minWidth: 140 }}>
                            <Form.Label>Do</Form.Label>
                            <Form.Control
                                type="date"
                                value={dateTo}
                                min={dateFrom || undefined}
                                onChange={(e) => setDateTo(e.target.value)}
                            />
                        </Form.Group>
                    </div>
                )}

                <Form.Group>
                    <Form.Label>Notatka</Form.Label>
                    <Form.Control
                        as="textarea"
                        rows={2}
                        maxLength={500}
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                    />
                </Form.Group>
                {error && (
                    <Alert variant="danger" dismissible onClose={() => setError(null)} className="mt-3 mb-0">
                        {error}
                    </Alert>
                )}
            </Modal.Body>
            <Modal.Footer className="justify-content-between">
                <div>
                    {isEdit && (
                        <Button
                            variant="outline-danger"
                            onClick={() => draft?.id && onDelete(draft.id)}
                        >
                            Usuń
                        </Button>
                    )}
                </div>
                <div className="d-flex gap-2">
                    <Button variant="secondary" onClick={onClose}>
                        Anuluj
                    </Button>
                    <Button variant="primary" onClick={handleSave}>
                        Zapisz
                    </Button>
                </div>
            </Modal.Footer>
        </Modal>
    );
}
