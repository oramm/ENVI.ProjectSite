import React, { useEffect, useRef, useState } from "react";
import { Alert, Button, ButtonGroup, Card, Form, Table } from "react-bootstrap";
import {
    ScrumboardVacationRow,
    ScrumboardVacationsData,
} from "../../Typings/bussinesTypes";
import { SpinnerBootstrap } from "../View/Resultsets/CommonComponents";
import ScrumboardApi from "../Scrumboard/ScrumboardApi";
import { useScrumboardEvents } from "../Scrumboard/useScrumboardEvents";
import AbsenceModal, { AbsenceDraft } from "./AbsenceModal";
import "./Vacations.css";
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

/**
 * Strona Urlopy (Biuro → Urlopy) — następca arkusza "urlopy".
 * Widok roczny (timeline) albo miesięczny (siatka dni).
 *
 * Dane bierze z tras /scrumboard/* i ze wspólnego kanału zdarzeń scrumboardu:
 * urlopy wyszły ze scrumboardu jako WIDOK, backend został na miejscu.
 */
export default function VacationsPage({ title }: { title?: string }) {
    const now = new Date();
    const [year, setYear] = useState(now.getFullYear());
    const [month0, setMonth0] = useState(now.getMonth());
    const [viewMode, setViewMode] = useState<ViewMode>("year");
    // Salda (urlop / opieka / za święta) domyślnie zwinięte — na co dzień liczy się
    // kalendarz, a nie liczniki; rozwinięte zjadają szerokość timeline'u.
    const [showBalances, setShowBalances] = useState(false);
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
        if (title) document.title = title;
    }, [title]);

    useEffect(() => {
        load();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [year]);

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
        careDays: number,
        holidayDays: number
    ) {
        try {
            await ScrumboardApi.setVacationLimit(
                personId,
                year,
                limitDays,
                carryoverDays,
                careDays,
                holidayDays
            );
        } catch (err) {
            setError(err instanceof Error ? err.message : String(err));
        }
    }

    function updateLimitLocal(
        personId: number,
        field: "limitDays" | "carryoverDays" | "careDays" | "holidayDays",
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
        <Card>
            <Card.Body className="vacations">
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
                            className="vacation-month-label"
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

                <div className="d-flex flex-wrap gap-2 ms-auto vacation-legend">
                    {data.types.map((t) => (
                        <span key={t.id} className="vacation-legend-item">
                            <span
                                className="vacation-swatch"
                                style={{ background: t.color }}
                            />
                            {t.name}
                        </span>
                    ))}
                </div>
            </div>

            {viewMode === "year" ? (
                <YearView
                    data={data}
                    showBalances={showBalances}
                    onToggleBalances={() => setShowBalances(!showBalances)}
                    onOpenEdit={openEditFor}
                    onLimitChange={updateLimitLocal}
                    onLimitSave={saveLimit}
                />
            ) : (
                <MonthView
                    data={data}
                    year={year}
                    month0={month0}
                    showBalances={showBalances}
                    onToggleBalances={() => setShowBalances(!showBalances)}
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
            </Card.Body>
        </Card>
    );
}

interface ViewProps {
    data: ScrumboardVacationsData;
    /** false => kolumny sald (Urlop / Opieka / Za święta) są zwinięte. */
    showBalances: boolean;
    /** Zwija/rozwija salda — podpięte pod klik w nagłówek kolumny. */
    onToggleBalances: () => void;
    onOpenEdit: (row: ScrumboardVacationRow, dateStr: string) => void;
    onLimitChange: (
        personId: number,
        field: "limitDays" | "carryoverDays" | "careDays" | "holidayDays",
        value: number
    ) => void;
    onLimitSave: (
        personId: number,
        limitDays: number,
        carryoverDays: number,
        careDays: number,
        holidayDays: number
    ) => void;
}

type BalanceProps = Pick<ViewProps, "onLimitChange" | "onLimitSave"> & {
    row: ScrumboardVacationRow;
};

/**
 * Zapis wymiaru urlopu. Endpoint przyjmuje KOMPLET pul (urlop + zaległy + opieka
 * + za święta) i nadpisuje wiersz, więc każde pole musi wysłać wszystkie cztery —
 * inaczej edycja jednej puli wyzerowałaby pozostałe.
 */
function saveAll(
    row: ScrumboardVacationRow,
    onLimitSave: ViewProps["onLimitSave"]
) {
    onLimitSave(
        row.personId,
        row.limitDays,
        row.carryoverDays,
        row.careDays,
        row.holidayDays
    );
}

/**
 * Etykiety trzech pul. Kolejność jest kontraktem — nagłówki i komórki widoku
 * zwiniętego renderują się z tej samej tablicy, więc liczby stoją pod opisami.
 */
const POOLS = [
    { key: "vacation", short: "Urlop" },
    { key: "care", short: "Opieka" },
    { key: "holiday", short: "Święta" },
] as const;

/**
 * Saldo każdej puli w jednym miejscu: liczba pozostałych dni + opis do tooltipa.
 * Widok rozwinięty i zwinięty czytają stąd, żeby opisy nie rozjechały się z liczbami.
 */
function poolBalances(row: ScrumboardVacationRow) {
    const vacation = row.limitDays + row.carryoverDays - row.usedDays;
    const care = row.careDays - row.careUsedDays;
    const holiday = row.holidayDays - row.holidayUsedDays;
    return {
        vacation: {
            remaining: vacation,
            title: `Urlop wykorzystany: ${row.usedDays}, pozostały: ${vacation} (Obecny ${row.limitDays} + Zaległy ${row.carryoverDays} − wykorzystany ${row.usedDays})`,
        },
        care: {
            remaining: care,
            title: `Opieka wykorzystana: ${row.careUsedDays}, pozostała: ${care} (pula ${row.careDays} − wykorzystana ${row.careUsedDays})`,
        },
        holiday: {
            remaining: holiday,
            title: `Wolne za święta wykorzystane: ${row.holidayUsedDays}, pozostałe: ${holiday} (pula ${row.holidayDays} − wykorzystane ${row.holidayUsedDays})`,
        },
    };
}

/** Liczba pozostałych dni — na minusie czerwona, w obu widokach tak samo. */
function RemainingValue({
    balance,
    children,
}: {
    balance: { remaining: number; title: string };
    children?: React.ReactNode;
}) {
    return (
        <span
            title={balance.title}
            className={
                balance.remaining < 0 ? "text-danger fw-semibold" : "fw-semibold"
            }
        >
            {children ?? balance.remaining}
        </span>
    );
}

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
        <label className="vacation-limit-field" title={title}>
            <span className="text-muted">{label}</span>
            {editing ? (
                <Form.Control
                    type="number"
                    min={0}
                    step={1}
                    size="sm"
                    autoFocus
                    className="vacation-limit-input"
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
                    className="vacation-limit-value"
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
    const balance = poolBalances(row).vacation;
    const save = () => saveAll(row, onLimitSave);
    return (
        <div className="vacation-balance-row">
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
            <RemainingValue balance={balance}>
                {row.usedDays} / {balance.remaining}
            </RemainingValue>
        </div>
    );
}

/** Kolumna salda opieki: pula (edytowalna) + Wyk./Poz. */
function CareBalanceCell({ row, onLimitChange, onLimitSave }: BalanceProps) {
    const balance = poolBalances(row).care;
    const save = () => saveAll(row, onLimitSave);
    return (
        <div className="vacation-balance-row">
            <LimitInput
                label="Pula"
                title="pula dni opieki na dany rok"
                value={row.careDays}
                onChange={(v) => onLimitChange(row.personId, "careDays", v)}
                onBlur={save}
            />
            <RemainingValue balance={balance}>
                {row.careUsedDays} / {balance.remaining}
            </RemainingValue>
        </div>
    );
}

/**
 * Kolumna salda wolnego za święta: pula (edytowalna) + Wyk./Poz.
 * Pula to liczba świąt, które w danym roku wypadły w sobotę (art. 130 §2 KP) —
 * wpisywana ręcznie, bo system nie zna kalendarza świąt.
 */
function HolidayBalanceCell({ row, onLimitChange, onLimitSave }: BalanceProps) {
    const balance = poolBalances(row).holiday;
    const save = () => saveAll(row, onLimitSave);
    return (
        <div className="vacation-balance-row">
            <LimitInput
                label="Pula"
                title="dni wolne za święta wypadające w sobotę, na dany rok"
                value={row.holidayDays}
                onChange={(v) => onLimitChange(row.personId, "holidayDays", v)}
                onBlur={save}
            />
            <RemainingValue balance={balance}>
                {row.holidayUsedDays} / {balance.remaining}
            </RemainingValue>
        </div>
    );
}

const COLLAPSE_HINT = "Kliknij, aby zwinąć salda.";

/**
 * Nagłówki kolumn sald. Sam nagłówek jest przełącznikiem — klik w dowolny z nich
 * zwija panel, klik w zwinięty rozwija go z powrotem. Strzałka siedzi w ostatniej
 * kolumnie, więc po rozwinięciu jest na prawym końcu bloku sald.
 */
function BalanceHeaders({
    show,
    onToggle,
}: {
    show: boolean;
    onToggle: () => void;
}) {
    const toggle = {
        className: "vacation-balance-col vacation-balance-head",
        onClick: onToggle,
        role: "button",
        "aria-expanded": show,
    };

    if (!show)
        return (
            <th
                {...toggle}
                title="Pozostało dni w każdej puli. Kliknij, aby rozwinąć i edytować wymiary."
            >
                <div className="vacation-balance-head-row">
                    <div className="vacation-pool-grid vacation-pool-labels">
                        {POOLS.map((pool) => (
                            <span key={pool.key}>{pool.short}</span>
                        ))}
                    </div>
                    <span className="vacation-chevron">▸</span>
                </div>
            </th>
        );

    return (
        <>
            <th {...toggle} title={COLLAPSE_HINT}>
                <div className="vacation-balance-head-row">Urlop</div>
            </th>
            <th {...toggle} title={COLLAPSE_HINT}>
                <div className="vacation-balance-head-row">Opieka</div>
            </th>
            <th
                {...toggle}
                title={`Wolne za święta wypadające w sobotę. ${COLLAPSE_HINT}`}
            >
                <div className="vacation-balance-head-row">
                    Za święta
                    <span className="vacation-chevron">◂</span>
                </div>
            </th>
        </>
    );
}

/**
 * Komórki sald jednego wiersza. Zwinięte: trzy liczby "ile pozostało", ustawione
 * w tej samej siatce co etykiety w nagłówku. Rozwinięte: pełne kolumny z edycją pul.
 */
function BalanceCells({
    show,
    row,
    onLimitChange,
    onLimitSave,
}: BalanceProps & { show: boolean }) {
    if (!show) {
        const balances = poolBalances(row);
        return (
            <td className="vacation-balance-col">
                <div className="vacation-pool-grid">
                    {POOLS.map((pool) => (
                        <RemainingValue key={pool.key} balance={balances[pool.key]} />
                    ))}
                </div>
            </td>
        );
    }
    const cellProps = { row, onLimitChange, onLimitSave };
    return (
        <>
            <td className="vacation-balance-col">
                <VacationBalanceCell {...cellProps} />
            </td>
            <td className="vacation-balance-col">
                <CareBalanceCell {...cellProps} />
            </td>
            <td className="vacation-balance-col">
                <HolidayBalanceCell {...cellProps} />
            </td>
        </>
    );
}

/** Widok roczny: proporcjonalny timeline urlopów per osoba. */
function YearView({
    data,
    showBalances,
    onToggleBalances,
    onOpenEdit,
    onLimitChange,
    onLimitSave,
}: ViewProps) {
    const ticks = monthTicks(data.year);
    const todayPct = todayMarkerPct(data.year);
    return (
        <div className="vacations-scroll">
            <Table bordered hover size="sm" className="vacation-year">
                <thead>
                    <tr>
                        <th className="vacation-name-col">Osoba</th>
                        <BalanceHeaders show={showBalances} onToggle={onToggleBalances} />
                        <th>
                            <div className="vacation-track vacation-track-header">
                                {ticks.map((t) => (
                                    <span
                                        key={t.label}
                                        className="vacation-tick"
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
                            <td className="vacation-name-col">{row.personName}</td>
                            <BalanceCells
                                show={showBalances}
                                row={row}
                                onLimitChange={onLimitChange}
                                onLimitSave={onLimitSave}
                            />
                            <td className="vacation-timeline-cell">
                                <div className="vacation-track">
                                    {todayPct !== null && (
                                        <span
                                            className="vacation-today-line"
                                            style={{ left: `${todayPct}%` }}
                                        />
                                    )}
                                    {ticks.map((t) => (
                                        <span
                                            key={t.label}
                                            className="vacation-gridline"
                                            style={{ left: `${t.leftPct}%` }}
                                        />
                                    ))}
                                    {row.absences.map((a) => {
                                        const style = yearBarStyle(a, data.year);
                                        if (!style) return null;
                                        return (
                                            <div
                                                key={a.id}
                                                className="vacation-bar"
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
    showBalances,
    onToggleBalances,
    onOpenEdit,
    onLimitChange,
    onLimitSave,
}: ViewProps & { year: number; month0: number }) {
    const dayCount = daysInMonth(year, month0);
    const days = Array.from({ length: dayCount }, (_, i) => i + 1);
    const today = todayYmd();
    return (
        <div className="vacations-scroll">
            <Table bordered size="sm" className="vacation-month">
                <thead>
                    <tr>
                        <th className="vacation-name-col">Osoba</th>
                        <BalanceHeaders show={showBalances} onToggle={onToggleBalances} />
                        {days.map((d) => {
                            const dateStr = ymd(year, month0, d);
                            return (
                                <th
                                    key={d}
                                    className={
                                        "vacation-day-head" +
                                        (isWeekendYmd(dateStr) ? " vacation-weekend" : "") +
                                        (dateStr === today ? " vacation-today" : "")
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
                            <td className="vacation-name-col">{row.personName}</td>
                            <BalanceCells
                                show={showBalances}
                                row={row}
                                onLimitChange={onLimitChange}
                                onLimitSave={onLimitSave}
                            />
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
                                            "vacation-day-cell" +
                                            (weekend ? " vacation-weekend" : "") +
                                            (dateStr === today ? " vacation-today" : "")
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
