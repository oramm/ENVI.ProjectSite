import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Alert, Button, ButtonGroup, Form, Spinner, Table } from "react-bootstrap";
import MainSetup from "../../../React/MainSetupReact";
import { SystemRoleName } from "../../../../Typings/bussinesTypes";
import {
    AREA_LABEL,
    AREAS,
    AccessArea,
    fetchAccessOverview,
    filterOverview,
    OverviewFilter,
    PersonAccessView,
    SOURCES,
} from "./accessOverviewApi";
import { SeesPill, SourceLegend, SourcePill } from "./AccessPills";
import { PersonAccessPanel } from "./PersonAccessPanel";

type Props = { onEdit: (person: PersonAccessView) => void };

/**
 * „Kto ma do czego dostęp” - zakładka okna „Personel i uprawnienia” (makieta DOSTEP-6, wariant A).
 * Każda odpowiedź (widzi, skąd, dlaczego) przychodzi z serwera; tu tylko filtry i układ.
 */
export function AccessOverview({ onEdit }: Props) {
    const ROLE_ORDER = Object.keys(MainSetup.ROLE_LABELS) as SystemRoleName[];
    const [persons, setPersons] = useState<PersonAccessView[] | null>(null);
    const [error, setError] = useState(false);
    const [mode, setMode] = useState<"area" | "grid">("area");
    const [filter, setFilter] = useState<OverviewFilter>({ area: "projects", has: "", role: "", source: "", query: "" });
    const [selectedCell, setSelectedCell] = useState<{ personId: number; area: AccessArea } | null>(null);
    const [personId, setPersonId] = useState<number | null>(null);

    const load = useCallback(() => {
        setError(false);
        fetchAccessOverview().then(setPersons).catch(() => setError(true));
    }, []);
    useEffect(load, [load]);

    const sorted = useMemo(
        () => [...(persons ?? [])].sort((a, b) => ROLE_ORDER.indexOf(a.role) - ROLE_ORDER.indexOf(b.role)
            || `${a.surname} ${a.name}`.localeCompare(`${b.surname} ${b.name}`, "pl")),
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [persons],
    );
    const rows = useMemo(() => filterOverview(sorted, filter), [sorted, filter]);
    const gridRows = useMemo(
        () => filterOverview(sorted, { ...filter, has: "", source: "" })
            .filter(({ person }) => !filter.source || person.areas.some((a) => a.sees && a.source === filter.source)),
        [sorted, filter],
    );

    if (personId)
        return <PersonAccessPanel personId={personId} onBack={() => setPersonId(null)} onEdit={onEdit} onChanged={load} />;
    if (error) return <Alert variant="danger">Nie udało się wczytać przeglądu dostępów.</Alert>;
    if (!persons) return <Spinner size="sm" />;

    const set = (patch: Partial<OverviewFilter>) => setFilter((f) => ({ ...f, ...patch }));
    const personLink = (p: PersonAccessView) => (
        <Button variant="link" className="p-0 text-start" onClick={() => setPersonId(p.personId)}>{p.name} {p.surname}</Button>
    );
    const shown = mode === "area" ? rows.length : gridRows.length;
    const selected = selectedCell && persons.find((p) => p.personId === selectedCell.personId);
    const selectedAccess = selected?.areas.find((a) => a.area === selectedCell?.area);

    return (
        <div data-testid="access-overview">
            <div className="d-flex flex-wrap gap-3 align-items-end mb-2">
                <Form.Group>
                    <Form.Label className="small text-muted text-uppercase mb-0">Układ</Form.Label>
                    <div>
                        <ButtonGroup size="sm">
                            <Button variant={mode === "area" ? "primary" : "outline-secondary"} onClick={() => setMode("area")}>Jeden obszar</Button>
                            <Button variant={mode === "grid" ? "primary" : "outline-secondary"} onClick={() => setMode("grid")}>Wszystkie obszary</Button>
                        </ButtonGroup>
                    </div>
                </Form.Group>
                {mode === "area" && (
                    <>
                        <Form.Group controlId="accessArea">
                            <Form.Label className="small text-muted text-uppercase mb-0">Obszar</Form.Label>
                            <Form.Select size="sm" value={filter.area} onChange={(e) => set({ area: e.target.value as AccessArea })}>
                                {AREAS.map(([key, label]) => <option key={key} value={key}>{label}</option>)}
                            </Form.Select>
                        </Form.Group>
                        <Form.Group controlId="accessHas">
                            <Form.Label className="small text-muted text-uppercase mb-0">Dostęp</Form.Label>
                            <Form.Select size="sm" value={filter.has} onChange={(e) => set({ has: e.target.value as OverviewFilter["has"] })}>
                                <option value="">Wszyscy</option>
                                <option value="1">Mają dostęp</option>
                                <option value="0">Nie mają</option>
                            </Form.Select>
                        </Form.Group>
                    </>
                )}
                <Form.Group controlId="accessRole">
                    <Form.Label className="small text-muted text-uppercase mb-0">Krąg</Form.Label>
                    <Form.Select size="sm" value={filter.role} onChange={(e) => set({ role: e.target.value as SystemRoleName | "" })}>
                        <option value="">Wszystkie kręgi</option>
                        {ROLE_ORDER.map((role) => <option key={role} value={role}>{MainSetup.ROLE_LABELS[role]}</option>)}
                    </Form.Select>
                </Form.Group>
                <Form.Group controlId="accessSource">
                    <Form.Label className="small text-muted text-uppercase mb-0">Skąd</Form.Label>
                    <Form.Select size="sm" value={filter.source} onChange={(e) => set({ source: e.target.value as OverviewFilter["source"] })}>
                        <option value="">Każde źródło</option>
                        {SOURCES.map((source) => <option key={source} value={source}>{source}</option>)}
                    </Form.Select>
                </Form.Group>
                <Form.Group controlId="accessQuery">
                    <Form.Label className="small text-muted text-uppercase mb-0">Szukaj osoby lub firmy</Form.Label>
                    <Form.Control size="sm" value={filter.query} onChange={(e) => set({ query: e.target.value })} />
                </Form.Group>
            </div>
            <SourceLegend />
            {mode === "grid" && (selected && selectedAccess ? (
                <Alert variant="light" className="py-2 small border mt-2 mb-0">
                    <b>{selected.name} {selected.surname}</b> · {AREA_LABEL[selectedAccess.area]}: {selectedAccess.sees ? "widzi" : "nie widzi"}. {selectedAccess.why}{" "}
                    <Button variant="link" className="p-0 small" onClick={() => setPersonId(selected.personId)}>Otwórz osobę</Button>
                </Alert>
            ) : (
                <p className="small text-muted mb-0 mt-2">Kliknij pole w tabeli, żeby zobaczyć, dlaczego osoba ma albo nie ma dostępu.</p>
            ))}

            <div className="table-responsive mt-2">
                {mode === "area" ? (
                    <Table size="sm" hover className="small">
                        <thead><tr><th>Osoba</th><th>Krąg</th><th>Dostęp</th><th>Skąd</th><th>Dlaczego</th></tr></thead>
                        <tbody>
                            {rows.map(({ person, access }) => (
                                <tr key={person.personId} className={access.sees ? "" : "text-muted"}>
                                    <td className="text-nowrap">{personLink(person)}<div className="text-muted">{person.entityName}</div></td>
                                    <td>{MainSetup.ROLE_LABELS[person.role]}</td>
                                    <td className="text-nowrap"><SeesPill access={access} /> {access.sees && access.value}</td>
                                    <td><SourcePill source={access.source} /></td>
                                    <td>{access.why}</td>
                                </tr>
                            ))}
                            {!rows.length && <tr><td colSpan={5} className="text-muted">Nikt nie spełnia tych filtrów.</td></tr>}
                        </tbody>
                    </Table>
                ) : (
                    <Table size="sm" bordered className="small">
                        <thead>
                            <tr><th>Osoba</th>{AREAS.map(([key, label]) => <th key={key} className="text-center">{label}</th>)}</tr>
                        </thead>
                        <tbody>
                            {gridRows.map(({ person }) => (
                                <tr key={person.personId}>
                                    <td className="text-nowrap">{personLink(person)}<div className="text-muted">{MainSetup.ROLE_LABELS[person.role]}</div></td>
                                    {person.areas.map((a) => {
                                        const isSelected = selectedCell?.personId === person.personId && selectedCell.area === a.area;
                                        return (
                                            <td
                                                key={a.area}
                                                role="button"
                                                tabIndex={0}
                                                className={`text-center ${a.sees ? "" : "text-muted"} ${isSelected ? "table-active" : ""}`}
                                                onClick={() => setSelectedCell({ personId: person.personId, area: a.area })}
                                                onKeyDown={(e) => e.key === "Enter" && setSelectedCell({ personId: person.personId, area: a.area })}
                                            >
                                                {a.sees ? <>{a.value}<div><SourcePill source={a.source} /></div></> : "—"}
                                            </td>
                                        );
                                    })}
                                </tr>
                            ))}
                            {!gridRows.length && <tr><td colSpan={AREAS.length + 1} className="text-muted">Nikt nie spełnia tych filtrów.</td></tr>}
                        </tbody>
                    </Table>
                )}
            </div>
            <div className="small text-muted">Pokazano {shown} z {persons.length} osób, które mogą się zalogować.</div>
        </div>
    );
}
