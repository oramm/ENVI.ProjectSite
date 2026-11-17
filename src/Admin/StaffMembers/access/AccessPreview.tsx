import React, { useEffect, useState } from "react";
import { Alert, Spinner, Table } from "react-bootstrap";
import { AREA_LABEL, AreaAccess, fetchAccessPreview } from "./accessOverviewApi";
import { SourcePill } from "./AccessPills";

type Props = {
    personId?: number;
    systemRoleId: number | string | null | undefined;
    /** null = przypisania osoby jeszcze nie dojechały albo ich odczyt padł - wtedy podgląd nic nie liczy. */
    projectOurIds: string[] | null;
};

/**
 * „Co ta osoba będzie widzieć” - podgląd na żywo w oknie nadawania uprawnień (makieta DOSTEP-6,
 * wariant A). Liczy go serwer z roli i przypisań wpisanych w formularz, jeszcze przed zapisem.
 */
export function AccessPreview({ personId, systemRoleId, projectOurIds }: Props) {
    const roleId = Number(systemRoleId);
    const key = projectOurIds?.join("|") ?? null;
    const [areas, setAreas] = useState<AreaAccess[] | null>(null);
    const [error, setError] = useState(false);

    useEffect(() => {
        if (!roleId || !projectOurIds) {
            setAreas(null);
            return;
        }
        let cancelled = false;
        // Krótka zwłoka: przy klikaniu w wybór projektów nie wysyłamy żądania na każdy znak.
        const timer = setTimeout(() => {
            fetchAccessPreview(personId, roleId, projectOurIds)
                .then((result) => !cancelled && (setAreas(result), setError(false)))
                .catch(() => !cancelled && (setAreas(null), setError(true)));
        }, 300);
        return () => {
            cancelled = true;
            clearTimeout(timer);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [personId, roleId, key]);

    if (!roleId) return null;
    if (!projectOurIds)
        return (
            <section className="border rounded p-2 mt-3 small text-muted" data-testid="access-preview">
                Podgląd pojawi się po wczytaniu przypisań osoby.
            </section>
        );
    const seen = areas?.filter((a) => a.sees) ?? [];
    const notSeen = areas?.filter((a) => !a.sees) ?? [];

    return (
        <section className="border rounded p-2 mt-3" aria-live="polite" data-testid="access-preview">
            <div className="fw-semibold">Co ta osoba będzie widzieć</div>
            <div className="small text-muted mb-2">Podgląd przed zapisem. Liczy się z tych samych reguł, co serwer.</div>
            {error && <Alert variant="warning" className="py-1 small mb-2">Nie udało się policzyć podglądu.</Alert>}
            {!areas && !error && <Spinner size="sm" />}
            {areas && !seen.length && (
                <Alert variant="warning" className="py-1 small mb-2">
                    <b>Ta osoba nie zobaczy nic.</b> Po zalogowaniu trafi do pustego systemu.
                </Alert>
            )}
            {areas && (
                <Table size="sm" className="mb-0 small">
                    <tbody>
                        <tr className="table-light"><td colSpan={3} className="text-uppercase text-muted">Widzi · {seen.length}</td></tr>
                        {seen.map((a) => (
                            <tr key={a.area} title={a.why}>
                                <td>{AREA_LABEL[a.area]}</td>
                                <td className="text-nowrap">{a.value}</td>
                                <td><SourcePill source={a.source} /></td>
                            </tr>
                        ))}
                        <tr className="table-light"><td colSpan={3} className="text-uppercase text-muted">Nie widzi · {notSeen.length}</td></tr>
                        {notSeen.map((a) => (
                            <tr key={a.area} className="text-muted" title={a.why}><td colSpan={3}>{AREA_LABEL[a.area]}</td></tr>
                        ))}
                    </tbody>
                </Table>
            )}
        </section>
    );
}
