import React, { useState } from "react";
import { Dropdown } from "react-bootstrap";
import { Task } from "../../../Typings/bussinesTypes";
import MainSetup from "../../React/MainSetupReact";
import { TaskStatusBadge } from "../../View/Resultsets/CommonComponents";
import ScrumboardApi from "../ScrumboardApi";

interface Props {
    task: Task;
    onSaved: (status: string) => void;
}

/** Szybka zmiana statusu zadania (dropdown). Deleguje do backendu zachowując sync arkusza. */
export default function InlineStatusDropdown({ task, onSaved }: Props) {
    const [saving, setSaving] = useState(false);
    const statuses = Object.values(MainSetup.TaskStatus);

    async function changeStatus(newStatus: string) {
        if (newStatus === task.status) return;
        try {
            setSaving(true);
            // backend deleguje do TasksController.edit — wymaga payloadu z _case
            const payload = { ...task, status: newStatus, _case: task._parent };
            await ScrumboardApi.updateTaskStatus(payload);
            onSaved(newStatus);
        } catch (err) {
            console.error("Błąd zmiany statusu:", err);
        } finally {
            setSaving(false);
        }
    }

    return (
        <Dropdown onClick={(e) => e.stopPropagation()}>
            <Dropdown.Toggle as="span" role="button" className="scrum-status-toggle" bsPrefix="scrum-status-toggle">
                <TaskStatusBadge status={task.status} />
                {saving && " …"}
            </Dropdown.Toggle>
            <Dropdown.Menu>
                {statuses.map((status) => (
                    <Dropdown.Item key={status} active={status === task.status} onClick={() => changeStatus(status)}>
                        {status}
                    </Dropdown.Item>
                ))}
            </Dropdown.Menu>
        </Dropdown>
    );
}
