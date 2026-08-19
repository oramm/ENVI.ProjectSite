import React, { useEffect, useState } from "react";
import { Alert, Button, Form, Modal } from "react-bootstrap";
import {
    ScrumboardAbsence,
    ScrumboardAbsenceType,
} from "../../Typings/bussinesTypes";

export interface AbsenceDraft {
    id?: number;
    personId?: number;
    typeId?: number;
    dateFrom?: string;
    dateTo?: string;
    note?: string | null;
}

interface Props {
    show: boolean;
    draft: AbsenceDraft | null;
    persons: { personId: number; personName: string }[];
    types: ScrumboardAbsenceType[];
    onSave: (payload: {
        id?: number;
        personId: number;
        typeId: number;
        dateFrom: string;
        dateTo: string;
        note: string | null;
    }) => Promise<void>;
    onDelete: (id: number) => void;
    onClose: () => void;
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

/** Modal dodawania/edycji urlopu. Osobę wybieramy tylko przy dodawaniu. */
export default function AbsenceModal({
    show,
    draft,
    persons,
    types,
    onSave,
    onDelete,
    onClose,
}: Props) {
    const isEdit = !!draft?.id;
    const [personId, setPersonId] = useState<number | undefined>();
    const [typeId, setTypeId] = useState<number | undefined>();
    const [dateFrom, setDateFrom] = useState("");
    const [dateTo, setDateTo] = useState("");
    const [note, setNote] = useState("");
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!draft) return;
        setPersonId(draft.personId);
        setTypeId(draft.typeId ?? types[0]?.id);
        setDateFrom(draft.dateFrom ?? "");
        setDateTo(draft.dateTo ?? draft.dateFrom ?? "");
        setNote(draft.note ?? "");
        setError(null);
    }, [draft, types]);

    async function handleSave() {
        if (!personId) return setError("Wybierz osobę");
        if (!typeId) return setError("Wybierz typ urlopu");
        if (!dateFrom || !dateTo) return setError("Podaj zakres dat");
        if (dateTo < dateFrom)
            return setError("Data końcowa nie może być wcześniejsza niż początkowa");
        // Serwer i tak to odrzuci — tu tylko po to, żeby odpowiedź przyszła od razu,
        // tak jak przy odwróconym zakresie dat.
        if (dateFrom.slice(0, 4) !== dateTo.slice(0, 4))
            return setError(
                "Nieobecność na przełomie roku wpisz osobno dla każdego roku — pule dni rozliczają się rocznikami."
            );
        setError(null);
        try {
            // Błąd serwera (np. brak dni opieki) pokazujemy TU, w modalu — modal zostaje otwarty,
            // tabela urlopów nie znika. Zamknięcie następuje po stronie rodzica dopiero po sukcesie.
            await onSave({
                id: draft?.id,
                personId,
                typeId,
                dateFrom,
                dateTo,
                note: note.trim() || null,
            });
        } catch (err) {
            setError(err instanceof Error ? err.message : String(err));
        }
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
                <div className="d-flex gap-2 mb-2">
                    <Form.Group className="flex-fill">
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
                    <Form.Group className="flex-fill">
                        <Form.Label>Do</Form.Label>
                        <Form.Control
                            type="date"
                            value={dateTo}
                            min={dateFrom || undefined}
                            onChange={(e) => setDateTo(e.target.value)}
                        />
                    </Form.Group>
                </div>
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
