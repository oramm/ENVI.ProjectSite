import React, { useEffect } from "react";
import FilterableTable from "../../View/Resultsets/FilterableTable/FilterableTable";
import { ContractRoleData, ProjectRoleData } from "../../../Typings/bussinesTypes";
import { RolesFilterBody } from "./RoleFilterBody";
import { isProjectRole, rolesRepository } from "./RolesController";
import {
    ContractRoleAddNewModalButton,
    ProjectRoleAddNewModalButton,
    RoleEditModalButton,
} from "./Modals/RoleModalButtons";
import ToolsDate from "../../React/ToolsDate";

export default function RolesSearch({ title }: { title: string }) {
    useEffect(() => {
        document.title = title;
    }, [title]);

    function renderRow(role: ContractRoleData | ProjectRoleData) {
        return (
            <>
                <h6>
                    {role.groupName}: <strong>{role.name}</strong> | {role._person?._nameSurnameEmail} |{" "}
                    {isProjectRole(role) && "rola projektowa"}
                </h6>
                <div className="text-muted">{role.description}</div>
                {renderContractData(role)} {renderProjectData(role)}
            </>
        );
    }
    function renderProjectData(role: ProjectRoleData) {
        if (!role._project?.ourId) return <div className="text-danger mb-2">⚠️ Brak danych projektu</div>;
        const { name, ourId, alias } = role._project;

        return (
            <div className="mb-2">
                <div>
                    Projekt: {ourId} {alias}{" "}
                </div>
                <div className="text-secondary">{name}</div>
            </div>
        );
    }

    function renderContractData(role: ContractRoleData) {
        if (!role._contract?.id) return <div className="text-danger mb-2">⚠️ Brak danych kontraktu</div>;

        const { name, alias, startDate, endDate, _type, _contractRangesNames } = role._contract;

        return (
            <div className="mb-2">
                <div>
                    Typ umowy: <strong>{_type.name}</strong>, {alias}, zakresy:{" "}
                    {_contractRangesNames?.length ? (
                        <span className="text-success">{_contractRangesNames.join(", ")}</span>
                    ) : (
                        <span className="text-danger">⚠️ nie podano zakresów</span>
                    )}
                </div>
                <div className="text-secondary">{name}</div>
                <div>
                    Realizacja od <strong>{ToolsDate.dateISOToDMY(startDate!)}</strong> do{" "}
                    <strong>{ToolsDate.dateISOToDMY(endDate!)}</strong>
                </div>
            </div>
        );
    }
    return (
        <FilterableTable<ContractRoleData | ProjectRoleData>
            id="roles"
            title={title}
            FilterBodyComponent={RolesFilterBody}
            tableStructure={[{ header: "Nazwa", renderTdBody: renderRow }]}
            AddNewButtonComponents={[ProjectRoleAddNewModalButton, ContractRoleAddNewModalButton]}
            EditButtonComponent={RoleEditModalButton}
            isDeletable={true}
            repository={rolesRepository}
            selectedObjectRoute={"/role/"}
        />
    );
}
