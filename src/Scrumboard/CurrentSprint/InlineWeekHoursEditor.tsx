import React, { useEffect, useRef, useState } from "react";
import { Task } from "../../../Typings/bussinesTypes";
import ScrumboardApi, { ScrumboardTaskHours } from "../ScrumboardApi";

interface Props {
    task: Task;
    onSaved: (hours: ScrumboardTaskHours) => void;
}

const DAYS: { key: "hoursMon" | "hoursTue" | "hoursWed" | "hoursThu" | "hoursFri"; placeholder: string }[] = [
    { key: "hoursMon", placeholder: "PO" },
    { key: "hoursTue", placeholder: "WT" },
    { key: "hoursWed", placeholder: "ŚR" },
    { key: "hoursThu", placeholder: "CZ" },
    { key: "hoursFri", placeholder: "PT" },
];

function weekSum(task: Task): number {
    return DAYS.reduce((sum, d) => sum + (Number(task[d.key]) || 0), 0);
}

/** Indeks dzisiejszego dnia roboczego (PO=0 … PT=4); w weekend fallback na poniedziałek. */
function todayDayIndex(): number {
    const day = new Date().getDay(); // 0=niedz, 1=pon … 6=sob
    return day >= 1 && day <= 5 ? day - 1 : 0;
}

/** Czas rzeczywisty PO-PT: klik w sumę → 5 pól rozsuwa się (animacja); Enter/blur poza obszar → zapis. */
export default function InlineWeekHoursEditor({ task, onSaved }: Props) {
    const [editing, setEditing] = useState(false);
    const [saving, setSaving] = useState(false);
    const [values, setValues] = useState<Record<string, string>>({});
    const containerRef = useRef<HTMLDivElement>(null);
    const focusInputRef = useRef<HTMLInputElement>(null);
    // Tuż po otwarciu potrafi wpaść przejściowy blur (relatedTarget=null) w trakcie animacji
    // — ignorujemy go, żeby edytor nie zwijał się od razu (i nie robił pustego zapisu).
    const justOpenedRef = useRef(false);
    const todayIdx = todayDayIndex();

    useEffect(() => {
        if (!editing) return;
        const initial: Record<string, string> = {};
        for (const d of DAYS) initial[d.key] = task[d.key] != null ? String(task[d.key]) : "";
        setValues(initial);
        justOpenedRef.current = true;
        const timer = setTimeout(() => (justOpenedRef.current = false), 350);
        requestAnimationFrame(() => focusInputRef.current?.focus());
        return () => clearTimeout(timer);
    }, [editing]);

    async function save() {
        const payload: Record<string, number | null> = {};
        for (const d of DAYS) {
            const raw = values[d.key];
            const parsed = raw == null || raw.trim() === "" ? null : Number(raw);
            if (parsed != null && (Number.isNaN(parsed) || parsed < 0)) return;
            payload[d.key] = parsed;
        }
        try {
            setSaving(true);
            const result = await ScrumboardApi.updateTaskHours(task.id, payload);
            onSaved(result);
        } catch (err) {
            console.error("Błąd zapisu godzin dziennych:", err);
        } finally {
            setSaving(false);
            setEditing(false);
        }
    }

    function handleBlur(e: React.FocusEvent<HTMLDivElement>) {
        if (justOpenedRef.current) return; // przejściowy blur w trakcie otwierania — pomiń
        if (!containerRef.current?.contains(e.relatedTarget as Node)) save();
    }

    const sum = weekSum(task);
    return (
        <span className="scrum-rt d-inline-flex align-items-center" onClick={(e) => e.stopPropagation()}>
            {!editing && (
                <span
                    className="scrum-inline-value"
                    title="Kliknij, aby wpisać godziny dzienne (PO-PT)"
                    onClick={() => setEditing(true)}
                >
                    {sum > 0 ? `${sum} h` : "—"}
                    {saving && " …"}
                </span>
            )}
            <div ref={containerRef} className={"scrum-week-hours" + (editing ? " open" : "")} onBlur={handleBlur}>
                {DAYS.map((d, idx) => (
                    <input
                        key={d.key}
                        ref={idx === todayIdx ? focusInputRef : undefined}
                        type="number"
                        min={0}
                        step={0.5}
                        tabIndex={editing ? 0 : -1}
                        placeholder={d.placeholder}
                        className="form-control form-control-sm scrum-day-input"
                        value={values[d.key] ?? ""}
                        onChange={(e) => setValues((prev) => ({ ...prev, [d.key]: e.target.value }))}
                        onKeyDown={(e) => {
                            if (e.key === "Enter") save();
                            if (e.key === "Escape") setEditing(false);
                        }}
                    />
                ))}
            </div>
        </span>
    );
}
