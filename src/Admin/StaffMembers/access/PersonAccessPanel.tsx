import React, { useEffect, useState } from "react";
import { Alert, Button, Spinner, Table } from "react-bootstrap";
import MainSetup from "../../../React/MainSetupReact";
import { savePersonProjectAssignments } from "../../../Persons/personsV2Helpers";
import { AREA_LABEL, AreaAccess, fetchAccessPreview, fetchPersonAccess, PersonAccessView } from "./accessOverviewApi";
import { SeesPill, SourcePill } from "./AccessPills";

/** Co się zmieni po odebraniu przypisania - porównanie dwóch odpowiedzi serwera, nie zgadywanie. */
export function removalEffect(before: AreaAccess[], after: AreaAccess[]) {
    const lost = before.filter((a) => a.sees && !after.find((b) => b.area === a.area)?.sees).map((a) => AREA_LABEL[a.area]);
    const narrowed = before
        .filter((a) => a.sees)
        .map((a) => ({ a, b: after.find((b) => b.area === a.area) }))
        .filter(({ a, b }) => b?.sees && b.value !== a.value)
        .map(({ a, b }) => `${AREA_LABEL[a.area]}: ${b!.value}`);
    return { lost, narrowed, nothingLeft: !after.some((a) => a.sees) };
}

/** Opis roli bez powtórzonej nazwy na początku („Współpracownik zewnętrzny – praca...” → „praca...”). */
const roleDescription = (role: PersonAccessView["role"]) => {
    const text = MainSetup.SystemRoles[role]?.description ?? "";
    const [, ...rest] = text.split(" – ");
    return rest.length ? rest.join(" – ") : text;
};

type Props = { personId: number; onBack: () => void; onEdit: (person: PersonAccessView) => void; onChanged: () => void };

/** Widok jednej osoby: skąd ma dostęp, co widzi i dlaczego, odebranie przypisania z jasnym skutkiem (DOSTEP-7). */
export function PersonAccessPanel({ personId, onBack, onEdit, onChanged }: Props) {
    const [person, setPerson] = useState<PersonAccessView | null | undefined>(undefined);
    const [removing, setRemoving] = useState<{ ourId: string; effect: ReturnType<typeof removalEffect> } | null>(null);
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const load = () => fetchPersonAccess(personId).then(setPerson).catch(() => setPerson(null));
    useEffect(() => {
        setPerson(undefined);
        setRemoving(null);
        load();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [personId]);

    if (person === undefined) return <Spinner size="sm" />;
    if (!person)
        return (
            <Alert variant="warning">
                Ta osoba nie ma aktywnego konta, więc nie może się zalogować. <Button variant="link" className="p-0" onClick={onBack}>Wróć do przeglądu</Button>
            </Alert>
        );

    const isStaff = MainSetup.STAFF_ROLES.includes(person.role);
    const remaining = (ourId: string) => person.assignments.map((a) => a.ourId).filter((id) => id !== ourId);

    const askRemove = async (ourId: string) => {
        setError(null);
        setBusy(true);
        try {
            const after = await fetchAccessPreview(person.personId, person.systemRoleId, remaining(ourId));
            setRemoving({ ourId, effect: removalEffect(person.areas, after) });
        } catch {
            setError("Nie udało się policzyć skutku odebrania.");
        } finally {
            setBusy(false);
        }
    };
    const doRemove = async () => {
        if (!removing) return;
        setBusy(true);
        try {
            await savePersonProjectAssignments(person.personId, remaining(removing.ourId));
            setRemoving(null);
            await load();
            onChanged();
        } catch {
            setError("Nie udało się odebrać przypisania.");
        } finally {
            setBusy(false);
        }
    };

    return (
        <div data-testid="person-access">
            <div className="d-flex flex-wrap gap-2 align-items-baseline mb-2">
                <Button variant="link" className="p-0" onClick={onBack}>← Przegląd</Button>
                <h5 className="mb-0">{person.name} {person.surname}</h5>
                <span className="text-muted">{person.entityName}</span>
                <Button size="sm" className="ms-auto" onClick={() => onEdit(person)}>Zmień uprawnienia</Button>
            </div>
            {error && <Alert variant="danger" className="py-1 small">{error}</Alert>}
            {!person.areas.some((a) => a.sees) && (
                <Alert variant="warning" className="py-2 small"><b>Ta osoba nie zobaczy nic.</b> Po zalogowaniu trafi do pustego systemu.</Alert>
            )}

            <div className="fw-semibold small mt-3 mb-1">Skąd ma dostęp</div>
            <dl className="row small mb-0">
                <dt className="col-sm-3 text-muted fw-normal">Krąg</dt>
                <dd className="col-sm-9"><SourcePill source="rola" /> <b>{MainSetup.ROLE_LABELS[person.role]}</b>. {roleDescription(person.role)}</dd>
                <dt className="col-sm-3 text-muted fw-normal">Przypisania do projektów</dt>
                <dd className="col-sm-9">
                    {person.assignments.length
                        ? person.assignments.map((a) => <div key={a.ourId}><SourcePill source="przypisanie" /> <span className="font-monospace">{a.ourId}</span> {a.name}</div>)
                        : <span className="text-muted">brak</span>}
                </dd>
                {person.contractRoles.length > 0 && (
                    <>
                        <dt className="col-sm-3 text-muted fw-normal">Rola w kontraktach</dt>
                        <dd className="col-sm-9">
                            Kierownik, administrator umowy albo osoba dodatkowa w kontraktach projektów:{" "}
                            {[...new Set(person.contractRoles.map((c) => c.projectOurId))].join(", ")}. Daje pocztę i pokój czatu, jeśli projekt albo kontrakt je ma; danych projektu nie otwiera.
                        </dd>
                    </>
                )}
                {person.role === "EXTERNAL_USER" && (
                    <>
                        <dt className="col-sm-3 text-muted fw-normal">Kontrakty z pismami</dt>
                        <dd className="col-sm-9">{person.letterContracts.length ? person.letterContracts.join(", ") : <span className="text-muted">brak</span>}</dd>
                    </>
                )}
            </dl>

            <div className="fw-semibold small mt-3 mb-1">Co widzi i dlaczego</div>
            <Table size="sm" bordered className="small">
                <thead><tr><th>Obszar</th><th>Widzi?</th><th>Skąd</th><th>Dlaczego</th></tr></thead>
                <tbody>
                    {person.areas.map((a) => (
                        <tr key={a.area} className={a.sees ? "" : "text-muted"}>
                            <td>{AREA_LABEL[a.area]}</td>
                            <td className="text-nowrap"><SeesPill access={a} /> {a.sees && a.value}</td>
                            <td><SourcePill source={a.source} /></td>
                            <td>{a.why}</td>
                        </tr>
                    ))}
                </tbody>
            </Table>
            {!isStaff && <p className="small text-muted">Pliki na Dysku Google nadaje się osobno. Przypisanie w PS ich nie otwiera.</p>}

            {!isStaff && person.assignments.length > 0 && (
                <section className="border-top pt-2">
                    <div className="fw-semibold small mb-1">Odebranie dostępu</div>
                    {removing ? (
                        <Alert variant="warning" className="py-2 small" role="alert">
                            <b>Odebrać przypisanie {removing.ourId}?</b>{" "}
                            {removing.effect.lost.length > 0 && <>Osoba straci: {removing.effect.lost.join(", ")}. </>}
                            {removing.effect.narrowed.length > 0 && <>Zostanie jej: {removing.effect.narrowed.join("; ")}. </>}
                            {removing.effect.nothingLeft && <>Nie zostanie jej nic - po zalogowaniu zobaczy pusty system.</>}
                            <div className="d-flex gap-2 mt-2">
                                <Button size="sm" variant="outline-danger" disabled={busy} onClick={doRemove}>Odbierz przypisanie</Button>
                                <Button size="sm" variant="outline-secondary" disabled={busy} onClick={() => setRemoving(null)}>Anuluj</Button>
                            </div>
                        </Alert>
                    ) : (
                        <div className="d-flex flex-wrap gap-2">
                            {person.assignments.map((a) => (
                                <Button key={a.ourId} size="sm" variant="outline-danger" disabled={busy} onClick={() => askRemove(a.ourId)}>
                                    Odbierz przypisanie {a.ourId}…
                                </Button>
                            ))}
                        </div>
                    )}
                </section>
            )}
        </div>
    );
}
