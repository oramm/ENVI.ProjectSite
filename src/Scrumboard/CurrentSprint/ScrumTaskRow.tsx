import React, { useEffect, useState } from "react";
import { Task } from "../../../Typings/bussinesTypes";
import InlineEstimateInput from "./InlineEstimateInput";
import InlineStatusDropdown from "./InlineStatusDropdown";
import InlineWeekHoursEditor from "./InlineWeekHoursEditor";

interface Props {
    task: Task;
}

/**
 * Wiersz zadania w drzewie scrumboardu: nazwa | status | osoba | szac. czas | czas rzeczywisty.
 * Inline-edycja szac. czasu, godzin PO-PT i statusu. Mutuje obiekt task (współdzielony z drzewem)
 * oraz lokalny stan, aby zmiana była widoczna od razu bez przeładowania.
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
            {/* nazwa jest elastyczna i kurczy się, gdy edytor godzin się rozsuwa — wiersz zostaje w jednej linii */}
            <span className="scrum-task-name flex-grow-1 text-truncate">{task.name}</span>
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
