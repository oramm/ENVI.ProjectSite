import React, { useEffect, useRef, useState } from "react";
import { Alert, Button, ButtonGroup, Form, Table } from "react-bootstrap";
import {
    ScrumboardVacationRow,
    ScrumboardVacationsData,
} from "../../../Typings/bussinesTypes";
import { SpinnerBootstrap } from "../../View/Resultsets/CommonComponents";
import ScrumboardApi from "../ScrumboardApi";
import { useScrumboardEvents } from "../useScrumboardEvents";
import AbsenceModal, { AbsenceDraft } from "./AbsenceModal";
import {
    daysInMonth,
    findAbsenceOn,
    isWeekendYmd,
    MONTHS_PL_LONG,
    monthTicks,
    todayMarkerPct,
    todayYmd,
    yearBarStyle,
    ymd,
} from "./vacationViewUtils";

type ViewMode = "year" | "month";

/** Zakładka Urlopy — następca arkusza "urlopy". Widok roczny (timeline) lub miesięczny (siatka dni). */
export default function VacationsTab({ active }: { active?: boolean }) {
    const now = new Date();
    const [year, setYear] = useState(now.getFullYear());
    const [month0, setMonth0] = useState(now.getMonth());
    const [viewMode, setViewMode] = useState<ViewMode>("year");
    const [data, setData] = useState<ScrumboardVacationsData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [draft, setDraft] = useState<AbsenceDraft | null>(null);

    async function load() {
        try {
            setData(await ScrumboardApi.getVacations(year));
        } catch (err) {
            setError(err instanceof Error ? err.message : String(err));
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        if (active !== false) load();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [year, active]);

    useScrumboardEvents({ "absence-changed": load }, load);

    function openAdd(prefill?: AbsenceDraft) {
        setDraft(prefill ?? {});
    }

    function openEditFor(row: ScrumboardVacationRow, dateStr: string) {
        const absence = findAbsenceOn(row.absences, dateStr);
        if (absence)
            setDraft({
                id: absence.id,
                personId: absence.personId,
                typeId: absence.typeId,
                dateFrom: absence.dateFrom,
                dateTo: absence.dateTo,
                note: absence.note,
            });
        else if (!isWeekendYmd(dateStr))
            openAdd({ personId: row.personId, dateFrom: dateStr, dateTo: dateStr });
    }

    async function handleSave(payload: {
        id?: number;
        personId: number;
        typeId: number;
        dateFrom: string;
        dateTo: string;
        note: string | null;
    }) {
        // Bez try/catch — ewentualny błąd (np. brak dni opieki) propaguje się do modala,
        // który go pokazuje i zostaje otwarty. Zamykamy dopiero po sukcesie.
        if (payload.id)
            await ScrumboardApi.updateAbsence(payload.id, {
                typeId: payload.typeId,
                dateFrom: payload.dateFrom,
                dateTo: payload.dateTo,
                note: payload.note,
            });
        else await ScrumboardApi.addAbsence(payload);
        setDraft(null);
        load();
    }

    async function handleDelete(id: number) {
        try {
            await ScrumboardApi.deleteAbsence(id);
            setDraft(null);
            load();
        } catch (err) {
            setError(err instanceof Error ? err.message : String(err));
        }
    }

    async function saveLimit(
        personId: number,
        limitDays: number,
        carryoverDays: number,
        careDays: number
    ) {
        try {
            await ScrumboardApi.setVacationLimit(
                personId,
                year,
                limitDays,
                carryoverDays,
                careDays
            );
        } catch (err) {
            setError(err instanceof Error ? err.message : String(err));
        }
    }

    function updateLimitLocal(
        personId: number,
        field: "limitDays" | "carryoverDays" | "careDays",
        value: number
    ) {
        setData((prev) =>
            prev
                ? {
                      ...prev,
                      rows: prev.rows.map((r) =>
                          r.personId === personId ? { ...r, [field]: value } : r
                      ),
                  }
                : prev
        );
    }

    if (loading) return <SpinnerBootstrap />;
    if (error)
        return (
            <Alert variant="danger" dismissible onClose={() => setError(null)}>
                {error}
            </Alert>
        );
    if (!data) return null;

    const persons = data.rows.map((r) => ({
        personId: r.personId,
        personName: r.personName,
    }));

    return (
        <div className="scrum-vacations">
            <div className="d-flex flex-wrap align-items-center gap-2 mb-3">
                <ButtonGroup size="sm">
                    <Button variant="outline-secondary" onClick={() => setYear(year - 1)}>
                        ‹
                    </Button>
                    <Button variant="outline-secondary" disabled>
                        {year}
                    </Button>
                    <Button variant="outline-secondary" onClick={() => setYear(year + 1)}>
                        ›
                    </Button>
                </ButtonGroup>

                <ButtonGroup size="sm">
                    <Button
                        variant={viewMode === "year" ? "primary" : "outline-primary"}
                        onClick={() => setViewMode("year")}
                    >
                        Rok
                    </Button>
                    <Button
                        variant={viewMode === "month" ? "primary" : "outline-primary"}
                        onClick={() => setViewMode("month")}
                    >
                        Miesiąc
                    </Button>
                </ButtonGroup>

                {viewMode === "month" && (
                    <ButtonGroup size="sm">
                        <Button
                            variant="outline-secondary"
                            onClick={() => setMonth0((month0 + 11) % 12)}
                        >
                            ‹
                        </Button>
                        <Button
                            variant="outline-secondary"
                            disabled
                            className="scrum-vacation-month-label"
                        >
                            {MONTHS_PL_LONG[month0]}
                        </Button>
                        <Button
                            variant="outline-secondary"
                            onClick={() => setMonth0((month0 + 1) % 12)}
                        >
                            ›
                        </Button>
                    </ButtonGroup>
                )}

                <Button size="sm" variant="success" onClick={() => openAdd()}>
                    + Dodaj urlop
                </Button>

                <div className="d-flex flex-wrap gap-2 ms-auto scrum-vacation-legend">
                    {data.types.map((t) => (
                        <span key={t.id} className="scrum-vacation-legend-item">
                            <span
                                className="scrum-vacation-swatch"
                                style={{ background: t.color }}
                            />
                            {t.name}
                        </span>
                    ))}
                </div>
            </div>

            {viewMode === "year" ? (
                <YearView data={data} onOpenEdit={openEditFor} onLimitChange={updateLimitLocal} onLimitSave={saveLimit} />
            ) : (
                <MonthView
                    data={data}
                    year={year}
                    month0={month0}
                    onOpenEdit={openEditFor}
                    onLimitChange={updateLimitLocal}
                    onLimitSave={saveLimit}
                />
            )}

            <AbsenceModal
                show={!!draft}
                draft={draft}
                persons={persons}
                types={data.types}
                onSave={handleSave}
                onDelete={handleDelete}
                onClose={() => setDraft(null)}
            />
        </div>
    );
}

interface ViewProps {
    data: ScrumboardVacationsData;
    onOpenEdit: (row: ScrumboardVacationRow, dateStr: string) => void;
    onLimitChange: (
        personId: number,
        field: "limitDays" | "carryoverDays" | "careDays",
        value: number
    ) => void;
    onLimitSave: (
        personId: number,
        limitDays: number,
        carryoverDays: number,
        careDays: number
    ) => void;
}

type BalanceProps = Pick<ViewProps, "onLimitChange" | "onLimitSave"> & {
    row: ScrumboardVacationRow;
};

/** Pole limitu: w trybie odczytu pokazuje wartość; klik → input (jak godziny w zadaniach). */
function LimitInput({
    label,
    title,
    value,
    onChange,
    onBlur,
}: {
    label: string;
    title: string;
    value: number;
    onChange: (v: number) => void;
    onBlur: () => void;
}) {
    const [editing, setEditing] = useState(false);
    const originalRef = useRef(value);

    return (
        <label className="scrum-vacation-limit-field" title={title}>
            <span className="text-muted">{label}</span>
            {editing ? (
                <Form.Control
                    type="number"
                    min={0}
                    step={1}
                    size="sm"
                    autoFocus
                    className="scrum-vacation-limit-input"
                    value={value}
                    onChange={(e) => onChange(Number(e.target.value))}
                    onBlur={() => {
                        setEditing(false);
                        onBlur();
                    }}
                    onKeyDown={(e) => {
                        if (e.key === "Enter") e.currentTarget.blur();
                        if (e.key === "Escape") {
                            onChange(originalRef.current);
                            setEditing(false);
                        }
                    }}
                />
            ) : (
                <span
                    className="scrum-inline-value scrum-vacation-limit-value"
                    title="Kliknij, aby edytować"
                    onClick={() => {
                        originalRef.current = value;
                        setEditing(true);
                    }}
                >
                    {value}
                </span>
            )}
        </label>
    );
}

/** Kolumna salda urlopu: Obecny/Zaległy (edytowalne) + Wyk./Poz. */
function VacationBalanceCell({ row, onLimitChange, onLimitSave }: BalanceProps) {
    const remaining = row.limitDays + row.carryoverDays - row.usedDays;
    const save = () =>
        onLimitSave(row.personId, row.limitDays, row.carryoverDays, row.careDays);
    return (
        <div className="scrum-vacation-balance-row">
            <LimitInput
                label="Obecny"
                title="urlop za bieżący rok"
                value={row.limitDays}
                onChange={(v) => onLimitChange(row.personId, "limitDays", v)}
                onBlur={save}
            />
            <LimitInput
                label="Zaległy"
                title="urlop zaległy z poprzedniego roku"
                value={row.carryoverDays}
                onChange={(v) => onLimitChange(row.personId, "carryoverDays", v)}
                onBlur={save}
            />
            <span
                title={`Urlop wykorzystany: ${row.usedDays}, pozostały: ${remaining} (Obecny ${row.limitDays} + Zaległy ${row.carryoverDays} − wykorzystany ${row.usedDays})`}
                className={remaining < 0 ? "text-danger fw-semibold" : "fw-semibold"}
            >
                {row.usedDays} / {remaining}
            </span>
        </div>
    );
}

/** Kolumna salda opieki: pula (edytowalna) + Wyk./Poz. */
function CareBalanceCell({ row, onLimitChange, onLimitSave }: BalanceProps) {
    const careRemaining = row.careDays - row.careUsedDays;
    const save = () =>
        onLimitSave(row.personId, row.limitDays, row.carryoverDays, row.careDays);
    return (
        <div className="scrum-vacation-balance-row">
            <LimitInput
                label="Pula"
                title="pula dni opieki na dany rok"
                value={row.careDays}
                onChange={(v) => onLimitChange(row.personId, "careDays", v)}
                onBlur={save}
            />
            <span
                title={`Opieka wykorzystana: ${row.careUsedDays}, pozostała: ${careRemaining} (pula ${row.careDays} − wykorzystana ${row.careUsedDays})`}
                className={careRemaining < 0 ? "text-danger fw-semibold" : "fw-semibold"}
            >
                {row.careUsedDays} / {careRemaining}
            </span>
        </div>
    );
}

/** Widok roczny: proporcjonalny timeline urlopów per osoba. */
function YearView({ data, onOpenEdit, onLimitChange, onLimitSave }: ViewProps) {
    const ticks = monthTicks(data.year);
    const todayPct = todayMarkerPct(data.year);
    return (
        <div className="scrum-vacations-scroll">
            <Table bordered hover size="sm" className="scrum-vacation-year">
                <thead>
                    <tr>
                        <th className="scrum-vacation-name-col">Osoba</th>
                        <th className="scrum-vacation-balance-col">Urlop</th>
                        <th className="scrum-vacation-balance-col">Opieka</th>
                        <th>
                            <div className="scrum-vacation-track scrum-vacation-track-header">
                                {ticks.map((t) => (
                                    <span
                                        key={t.label}
                                        className="scrum-vacation-tick"
                                        style={{ left: `${t.leftPct}%` }}
                                    >
                                        {t.label}
                                    </span>
                                ))}
                            </div>
                        </th>
                    </tr>
                </thead>
                <tbody>
                    {data.rows.map((row) => (
                        <tr key={row.personId}>
                            <td className="scrum-vacation-name-col">{row.personName}</td>
                            <td className="scrum-vacation-balance-col">
                                <VacationBalanceCell row={row} onLimitChange={onLimitChange} onLimitSave={onLimitSave} />
                            </td>
                            <td className="scrum-vacation-balance-col">
                                <CareBalanceCell row={row} onLimitChange={onLimitChange} onLimitSave={onLimitSave} />
                            </td>
                            <td className="scrum-vacation-timeline-cell">
                                <div className="scrum-vacation-track">
                                    {todayPct !== null && (
                                        <span
                                            className="scrum-vacation-today-line"
                                            style={{ left: `${todayPct}%` }}
                                        />
                                    )}
                                    {ticks.map((t) => (
                                        <span
                                            key={t.label}
                                            className="scrum-vacation-gridline"
                                            style={{ left: `${t.leftPct}%` }}
                                        />
                                    ))}
                                    {row.absences.map((a) => {
                                        const style = yearBarStyle(a, data.year);
                                        if (!style) return null;
                                        return (
                                            <div
                                                key={a.id}
                                                className="scrum-vacation-bar"
                                                style={{
                                                    left: `${style.leftPct}%`,
                                                    width: `${style.widthPct}%`,
                                                    background: a._typeColor,
                                                }}
                                                title={`${a._typeName}: ${a.dateFrom} – ${a.dateTo} (${a.workingDaysCount} dni rob.)`}
                                                onClick={() => onOpenEdit(row, a.dateFrom)}
                                            />
                                        );
                                    })}
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </Table>
        </div>
    );
}

/** Widok miesięczny: siatka dni (weekendy wyszarzone), kolor = typ urlopu. */
function MonthView({
    data,
    year,
    month0,
    onOpenEdit,
    onLimitChange,
    onLimitSave,
}: ViewProps & { year: number; month0: number }) {
    const dayCount = daysInMonth(year, month0);
    const days = Array.from({ length: dayCount }, (_, i) => i + 1);
    const today = todayYmd();
    return (
        <div className="scrum-vacations-scroll">
            <Table bordered size="sm" className="scrum-vacation-month">
                <thead>
                    <tr>
                        <th className="scrum-vacation-name-col">Osoba</th>
                        <th className="scrum-vacation-balance-col">Urlop</th>
                        <th className="scrum-vacation-balance-col">Opieka</th>
                        {days.map((d) => {
                            const dateStr = ymd(year, month0, d);
                            return (
                                <th
                                    key={d}
                                    className={
                                        "scrum-vacation-day-head" +
                                        (isWeekendYmd(dateStr) ? " scrum-vacation-weekend" : "") +
                                        (dateStr === today ? " scrum-vacation-today" : "")
                                    }
                                >
                                    {d}
                                </th>
                            );
                        })}
                    </tr>
                </thead>
                <tbody>
                    {data.rows.map((row) => (
                        <tr key={row.personId}>
                            <td className="scrum-vacation-name-col">{row.personName}</td>
                            <td className="scrum-vacation-balance-col">
                                <VacationBalanceCell row={row} onLimitChange={onLimitChange} onLimitSave={onLimitSave} />
                            </td>
                            <td className="scrum-vacation-balance-col">
                                <CareBalanceCell row={row} onLimitChange={onLimitChange} onLimitSave={onLimitSave} />
                            </td>
                            {days.map((d) => {
                                const dateStr = ymd(year, month0, d);
                                const weekend = isWeekendYmd(dateStr);
                                const absence = findAbsenceOn(row.absences, dateStr);
                                // weekend zawsze szary — urlop w weekend nie liczy się do wykorzystanych
                                const showColor = absence && !weekend;
                                return (
                                    <td
                                        key={d}
                                        className={
                                            "scrum-vacation-day-cell" +
                                            (weekend ? " scrum-vacation-weekend" : "") +
                                            (dateStr === today ? " scrum-vacation-today" : "")
                                        }
                                        style={
                                            showColor
                                                ? { background: absence!._typeColor }
                                                : undefined
                                        }
                                        title={
                                            absence
                                                ? `${absence._typeName}: ${absence.dateFrom} – ${absence.dateTo}`
                                                : undefined
                                        }
                                        onClick={() => onOpenEdit(row, dateStr)}
                                    />
                                );
                            })}
                        </tr>
                    ))}
                </tbody>
            </Table>
        </div>
    );
}
