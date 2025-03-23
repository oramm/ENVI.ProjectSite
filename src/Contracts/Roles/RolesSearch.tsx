import React, { useEffect } from "react";
import FilterableTable from "../../View/Resultsets/FilterableTable/FilterableTable";
import { ContractRoleData, ProjectRoleData, RoleData } from "../../../Typings/bussinesTypes";
import { RolesFilterBody } from "./RoleFilterBody";
import { isProjectRole, rolesRepository } from "./RolesController";
import {
    ContractRoleAddNewModalButton,
    ProjectRoleAddNewModalButton,
    RoleEditModalButton,
} from "./Modals/RoleModalButtons";

export default function RolesSearch({ title }: { title: string }) {
    useEffect(() => {
        document.title = title;
    }, [title]);

    function renderRow(role: ContractRoleData | ProjectRoleData) {
        return (
            <>
                <div>
                    {role.groupName}: <strong>{role.name}</strong> | {role._person?._nameSurnameEmail}
                </div>
                <div className="text-muted">{role.description}</div>
                {isProjectRole(role) ? renderProjectData(role) : renderContractData(role)}
            </>
        );
    }
    function renderProjectData(role: ProjectRoleData) {
        if (!role._project?.ourId) return <div className="text-danger">⚠️ Brak danych projektu</div>;
        const { name, ourId, alias } = role._project;

        return (
            <>
                <div>
                    {ourId} {alias}{" "}
                </div>
                <div className="text-secondary">{name}</div>
            </>
        );
    }

    function renderContractData(role: ContractRoleData) {
        if (!role._contract?.id) return <div className="text-danger">⚠️ Brak danych kontraktu</div>;

        const { name, alias, startDate, endDate, _type } = role._contract;
        return (
            <>
                <div>
                    Typ umowy: {_type.name}, {alias}
                </div>
                <div className="text-secondary">{name}</div>
                <div>
                    {" "}
                    Realizacja od {startDate} do {endDate}
                </div>
            </>
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
