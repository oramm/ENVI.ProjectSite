import React, { useState } from "react";
import { Dropdown } from "react-bootstrap";
import { MilestoneData } from "../../Typings/bussinesTypes";
import MainSetup from "../React/MainSetupReact";
import { MilestoneStatusBadge } from "../View/Resultsets/CommonComponents";
import { milestonesRepository } from "./TasksGlobalController";

interface Props {
    milestone: MilestoneData;
}

/**
 * Szybka zmiana statusu kamienia milowego (dropdown) — analogicznie do zadania.
 * Aktualizuje tylko pole `status` (fieldsToUpdate), więc backend pomija operacje GD/Scrum.
 * Mutuje obiekt milestone (współdzielony z drzewem) + lokalny stan, by zmiana była widoczna od razu.
 */
export default function MilestoneInlineStatusDropdown({ milestone }: Props) {
    const [status, setStatus] = useState(milestone.status);
    const [saving, setSaving] = useState(false);
    const statuses = Object.values(MainSetup.MilestoneStatus);

    async function changeStatus(newStatus: string) {
        if (newStatus === status) return;
        try {
            setSaving(true);
            await milestonesRepository.editItem({ ...milestone, status: newStatus }, undefined, ["status"]);
            milestone.status = newStatus;
            setStatus(newStatus);
        } catch (err) {
            console.error("Błąd zmiany statusu kamienia:", err);
        } finally {
            setSaving(false);
        }
    }

    return (
        <Dropdown onClick={(e) => e.stopPropagation()}>
            <Dropdown.Toggle as="span" role="button" bsPrefix="scrum-status-toggle">
                {status && <MilestoneStatusBadge status={status} />}
                {saving && " …"}
            </Dropdown.Toggle>
            <Dropdown.Menu>
                {statuses.map((s) => (
                    <Dropdown.Item key={s} active={s === status} onClick={() => changeStatus(s)}>
                        {s}
                    </Dropdown.Item>
                ))}
            </Dropdown.Menu>
        </Dropdown>
    );
}
