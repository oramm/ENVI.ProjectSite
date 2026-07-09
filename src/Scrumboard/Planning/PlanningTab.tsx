import React, { useEffect, useState } from "react";
import { Alert, Form, Table } from "react-bootstrap";
import {
    ScrumboardPlanningEntry,
    ScrumboardVacationWeekCount,
} from "../../../Typings/bussinesTypes";
import { SpinnerBootstrap } from "../../View/Resultsets/CommonComponents";
import ScrumboardApi from "../ScrumboardApi";
import { useScrumboardEvents } from "../useScrumboardEvents";

type EditableField =
    | "workingDays"
    | "hoursPerDay"
    | "planningMeetingHours"
    | "retroMeetingHours"
    | "extraMeetingsHours";

const FIELDS: { key: EditableField; label: string }[] = [
    { key: "workingDays", label: "Dni pracy" },
    { key: "hoursPerDay", label: "Godz./dzień" },
    { key: "planningMeetingHours", label: "Planowanie" },
    { key: "retroMeetingHours", label: "Spotkanie końcowe" },
    { key: "extraMeetingsHours", label: "Dodatkowe" },
];

function available(entry: ScrumboardPlanningEntry): number {
    return (
        entry.workingDays * entry.hoursPerDay -
        (entry.planningMeetingHours + entry.retroMeetingHours + entry.extraMeetingsHours)
    );
}

/** Planowanie — odpowiednik arkusza "planowanie". Edycja per komórka na blur. */
export default function PlanningTab() {
    const [entries, setEntries] = useState<ScrumboardPlanningEntry[]>([]);
    const [weekCounts, setWeekCounts] = useState<
        Map<number, ScrumboardVacationWeekCount>
    >(new Map());
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    async function load() {
        try {
            const [planning, counts] = await Promise.all([
                ScrumboardApi.getPlanning(),
                ScrumboardApi.getVacationWeekCounts(),
            ]);
            setEntries(planning);
            setWeekCounts(new Map(counts.map((c) => [c.personId, c])));
        } catch (err) {
            setError(err instanceof Error ? err.message : String(err));
        } finally {
            setLoading(false);
        }
    }

    async function loadWeekCounts() {
        try {
            const counts = await ScrumboardApi.getVacationWeekCounts();
            setWeekCounts(new Map(counts.map((c) => [c.personId, c])));
        } catch (err) {
            setError(err instanceof Error ? err.message : String(err));
        }
    }

    useEffect(() => {
        load();
    }, []);

    useScrumboardEvents(
        {
            "planning-changed": (payload: { personId: number; entry: ScrumboardPlanningEntry }) => {
                setEntries((prev) =>
                    prev.map((e) => (e.personId === payload.personId ? { ...e, ...payload.entry } : e))
                );
            },
            "absence-changed": loadWeekCounts,
        },
        load
    );

    function updateLocal(personId: number, field: EditableField, value: number) {
        setEntries((prev) => prev.map((e) => (e.personId === personId ? { ...e, [field]: value } : e)));
    }

    async function saveEntry(entry: ScrumboardPlanningEntry) {
        try {
            await ScrumboardApi.updatePlanning(entry.personId, {
                workingDays: entry.workingDays,
                hoursPerDay: entry.hoursPerDay,
                planningMeetingHours: entry.planningMeetingHours,
                retroMeetingHours: entry.retroMeetingHours,
                extraMeetingsHours: entry.extraMeetingsHours,
            });
        } catch (err) {
            setError(err instanceof Error ? err.message : String(err));
        }
    }

    if (loading) return <SpinnerBootstrap />;
    if (error)
        return (
            <Alert variant="danger" dismissible onClose={() => setError(null)}>
                {error}
            </Alert>
        );

    return (
        <Table bordered hover size="sm" responsive>
            <thead>
                <tr>
                    <th>Osoba</th>
                    {FIELDS.map((f) => (
                        <th key={f.key}>{f.label}</th>
                    ))}
                    <th>Godz. w tygodniu</th>
                    <th title="Dni urlopu: tydzień poprzedni / bieżący / następny">
                        Urlopy (pop./bież./nast.)
                    </th>
                </tr>
            </thead>
            <tbody>
                {entries.map((entry) => (
                    <tr key={entry.personId}>
                        <td>
                            {entry._person
                                ? `${entry._person.name ?? ""} ${entry._person.surname ?? ""}`.trim()
                                : entry.personId}
                        </td>
                        {FIELDS.map((f) => (
                            <td key={f.key} style={{ maxWidth: 90 }}>
                                <Form.Control
                                    type="number"
                                    min={0}
                                    step={0.5}
                                    size="sm"
                                    value={entry[f.key]}
                                    onChange={(e) =>
                                        updateLocal(entry.personId, f.key, Number(e.target.value))
                                    }
                                    onBlur={() => saveEntry(entry)}
                                />
                            </td>
                        ))}
                        <td className="fw-semibold">{available(entry)}</td>
                        <td className="text-nowrap">
                            {(() => {
                                const c = weekCounts.get(entry.personId);
                                return `${c?.prev ?? 0} / ${c?.current ?? 0} / ${c?.next ?? 0}`;
                            })()}
                        </td>
                    </tr>
                ))}
            </tbody>
        </Table>
    );
}
