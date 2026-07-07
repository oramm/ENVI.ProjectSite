import React, { useEffect, useState } from "react";
import { Alert, Table } from "react-bootstrap";
import { ScrumboardPersonSummary } from "../../../Typings/bussinesTypes";
import { SpinnerBootstrap } from "../../View/Resultsets/CommonComponents";
import ScrumboardApi from "../ScrumboardApi";
import { useScrumboardEvents } from "../useScrumboardEvents";

const fmt = (n: number) => (Number.isInteger(n) ? String(n) : n.toFixed(1));

/** Podsumowanie godzin — odpowiednik tabeli "Times summary" z arkusza. */
export default function TimesSummaryTab({ active }: { active?: boolean }) {
    const [rows, setRows] = useState<ScrumboardPersonSummary[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    async function load() {
        try {
            setRows(await ScrumboardApi.getTimesSummary());
        } catch (err) {
            setError(err instanceof Error ? err.message : String(err));
        } finally {
            setLoading(false);
        }
    }

    // Przeładuj przy wejściu na zakładkę (dane mogły się zmienić na innych zakładkach)
    useEffect(() => {
        if (active !== false) load();
    }, [active]);

    // Odśwież przy zmianach wpływających na godziny
    useScrumboardEvents(
        {
            "task-hours-changed": load,
            "hours-reset": load,
            "planning-changed": load,
            "task-status-changed": load,
        },
        load
    );

    if (loading) return <SpinnerBootstrap />;
    if (error)
        return (
            <Alert variant="danger" dismissible onClose={() => setError(null)}>
                {error}
            </Alert>
        );

    return (
        <Table striped bordered hover size="sm" responsive>
            <thead>
                <tr>
                    <th>Osoba</th>
                    <th>Dostępne</th>
                    <th>Przypisano</th>
                    <th>PON.</th>
                    <th>WTO.</th>
                    <th>ŚR.</th>
                    <th>CZW.</th>
                    <th>PT.</th>
                    <th>Spotkania</th>
                    <th>Razem</th>
                    <th>Pozostało</th>
                </tr>
            </thead>
            <tbody>
                {rows.map((r) => (
                    <tr key={r.personId}>
                        <td>{r.personName}</td>
                        <td>{fmt(r.available)}</td>
                        <td>{fmt(r.assigned)}</td>
                        <td>{fmt(r.mon)}</td>
                        <td>{fmt(r.tue)}</td>
                        <td>{fmt(r.wed)}</td>
                        <td>{fmt(r.thu)}</td>
                        <td>{fmt(r.fri)}</td>
                        <td>{fmt(r.meetings)}</td>
                        <td>{fmt(r.total)}</td>
                        <td className={r.remaining < 0 ? "text-danger fw-semibold" : ""}>{fmt(r.remaining)}</td>
                    </tr>
                ))}
            </tbody>
        </Table>
    );
}
