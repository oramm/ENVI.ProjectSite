import React, { useEffect, useState } from "react";
import { Dropdown } from "react-bootstrap";
import { MilestoneData } from "../../Typings/bussinesTypes";
import MainSetup from "../React/MainSetupReact";
import { MilestoneStatusBadge } from "../View/Resultsets/CommonComponents";
import { milestonesRepository } from "./TasksGlobalController";
import { useFilterableTableContext } from "../View/Resultsets/FilterableTable/FilterableTableContext";

interface Props {
    milestone: MilestoneData;
}

/**
 * Szybka zmiana statusu kamienia milowego (dropdown) — analogicznie do zadania.
 * Wysyła zmianę pola `status`; backend może wcześniej uruchomić autoryzację Google.
 * Mutuje obiekt milestone (współdzielony z drzewem) + lokalny stan, by zmiana była widoczna od razu.
 */
export default function MilestoneInlineStatusDropdown({ milestone }: Props) {
    const { refreshSectionsAfterMutation } = useFilterableTableContext();
    const [status, setStatus] = useState(milestone.status);
    const [saving, setSaving] = useState(false);
    const statuses = Object.values(MainSetup.MilestoneStatus);

    useEffect(() => setStatus(milestone.status), [milestone.status]);

    async function changeStatus(newStatus: string) {
        if (newStatus === status) return;
        try {
            setSaving(true);
            await milestonesRepository.editItem({ ...milestone, status: newStatus }, undefined, ["status"]);
            milestone.status = newStatus;
            setStatus(newStatus);
            await refreshSectionsAfterMutation();
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
