import React, { useEffect, useState } from "react";
import { Task } from "../../../Typings/bussinesTypes";
import InlineEstimateInput from "./InlineEstimateInput";
import InlineStatusDropdown from "./InlineStatusDropdown";
import InlineWeekHoursEditor from "./InlineWeekHoursEditor";

interface Props {
    task: Task;
}

const toYmd = (d: Task["deadline"]) => (d ? String(d).slice(0, 10) : "");

/**
 * Wiersz zadania: nazwa | termin | status | właściciel | szac. czas | czas rzeczywisty.
 * Inline-edytowalne: status, szac. czas, godziny PO-PT. Termin i właściciel — tylko podgląd.
 * Mutuje obiekt task (współdzielony z drzewem) + lokalny stan, by zmiana była widoczna od razu.
 */
export default function ScrumTaskRow({ task }: Props) {
    const [, forceRender] = useState(0);

    useEffect(() => {
        forceRender((n) => n + 1);
    }, [task.id]);

    function applyChange(patch: Partial<Task>) {
        Object.assign(task, patch);
        forceRender((n) => n + 1);
    }

    return (
        <div className="scrum-task-row d-flex align-items-center gap-3">
            <span className="scrum-task-name flex-grow-1 text-truncate">{task.name}</span>
            <div className="scrum-task-field text-secondary small">{toYmd(task.deadline)}</div>
            <div className="scrum-task-field">
                <InlineStatusDropdown task={task} onSaved={(status) => applyChange({ status })} />
            </div>
            <div className="scrum-task-field text-secondary small text-truncate scrum-task-owner">
                {task._owner ? `${task._owner.name} ${task._owner.surname}` : "—"}
            </div>
            <div className="scrum-task-field">
                <span className="text-muted small me-1">szac.:</span>
                <InlineEstimateInput task={task} onSaved={({ estimatedHours }) => applyChange({ estimatedHours })} />
            </div>
            <div className="scrum-task-field">
                <span className="text-muted small me-1">rzecz.:</span>
                <InlineWeekHoursEditor
                    task={task}
                    onSaved={(hours) =>
                        applyChange({
                            hoursMon: hours.hoursMon,
                            hoursTue: hours.hoursTue,
                            hoursWed: hours.hoursWed,
                            hoursThu: hours.hoursThu,
                            hoursFri: hours.hoursFri,
                        })
                    }
                />
            </div>
        </div>
    );
}
