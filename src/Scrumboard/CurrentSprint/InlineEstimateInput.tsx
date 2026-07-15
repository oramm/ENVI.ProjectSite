import React, { useState } from "react";
import { Task } from "../../../Typings/bussinesTypes";
import ScrumboardApi from "../ScrumboardApi";

interface Props {
    task: Task;
    onSaved: (hours: { estimatedHours: number | null }) => void;
}

/** Inline-edycja szacowanej liczby godzin. Klik → input; Enter/blur → zapis. */
export default function InlineEstimateInput({ task, onSaved }: Props) {
    const [editing, setEditing] = useState(false);
    const [value, setValue] = useState<string>(task.estimatedHours != null ? String(task.estimatedHours) : "");
    const [saving, setSaving] = useState(false);

    async function save() {
        setEditing(false);
        const parsed = value.trim() === "" ? null : Number(value);
        if (parsed != null && (Number.isNaN(parsed) || parsed < 0)) return;
        if (parsed === (task.estimatedHours ?? null)) return;
        try {
            setSaving(true);
            const result = await ScrumboardApi.updateTaskHours(task.id, { estimatedHours: parsed });
            onSaved({ estimatedHours: result.estimatedHours });
        } catch (err) {
            console.error("Błąd zapisu szac. czasu:", err);
        } finally {
            setSaving(false);
        }
    }

    if (!editing) {
        return (
            <span
                className="scrum-inline-value"
                title="Kliknij, aby edytować szac. czas"
                onClick={(e) => {
                    e.stopPropagation();
                    setEditing(true);
                }}
            >
                {task.estimatedHours != null ? `${task.estimatedHours} h` : "—"}
                {saving && " …"}
            </span>
        );
    }

    return (
        <input
            type="number"
            min={0}
            step={0.25}
            autoFocus
            className="form-control form-control-sm scrum-inline-input"
            value={value}
            onClick={(e) => e.stopPropagation()}
            onChange={(e) => setValue(e.target.value)}
            onBlur={save}
            onKeyDown={(e) => {
                if (e.key === "Enter") save();
                if (e.key === "Escape") setEditing(false);
            }}
        />
    );
}
