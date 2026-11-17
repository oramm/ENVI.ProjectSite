import React, { useEffect, useState } from "react";
import { Dropdown } from "react-bootstrap";
import { Case } from "../../Typings/bussinesTypes";
import MainSetup from "../React/MainSetupReact";
import { CaseStatusBadge } from "../View/Resultsets/CommonComponents";
import { casesRepository } from "./TasksGlobalController";
import { useFilterableTableContext } from "../View/Resultsets/FilterableTable/FilterableTableContext";

interface Props {
    caseItem: Case;
}

/**
 * Szybka zmiana statusu sprawy (dropdown) — analogicznie do kamienia milowego.
 * Wysyła zmianę pola `status`; backend może wcześniej uruchomić autoryzację Google.
 * Mutuje obiekt caseItem (współdzielony z drzewem) + lokalny stan, by zmiana była widoczna od razu.
 */
export default function CaseInlineStatusDropdown({ caseItem }: Props) {
    const { refreshSectionsAfterMutation } = useFilterableTableContext();
    const [status, setStatus] = useState(caseItem.status);
    const [saving, setSaving] = useState(false);
    const statuses = Object.values(MainSetup.CaseStatus);

    useEffect(() => setStatus(caseItem.status), [caseItem.status]);

    async function changeStatus(newStatus: string) {
        if (newStatus === status) return;
        try {
            setSaving(true);
            await casesRepository.editItem({ ...caseItem, status: newStatus }, undefined, ["status"]);
            caseItem.status = newStatus;
            setStatus(newStatus);
            await refreshSectionsAfterMutation();
        } catch (err) {
            console.error("Błąd zmiany statusu sprawy:", err);
        } finally {
            setSaving(false);
        }
    }

    return (
        <Dropdown onClick={(e) => e.stopPropagation()}>
            <Dropdown.Toggle as="span" role="button" bsPrefix="scrum-status-toggle">
                {status && <CaseStatusBadge status={status} />}
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
