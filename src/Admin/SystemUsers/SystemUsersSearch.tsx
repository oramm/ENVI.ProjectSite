import React, { useEffect } from "react";
import FilterableTable from "../../View/Resultsets/FilterableTable/FilterableTable";
import { SystemUserData } from "../../../Typings/bussinesTypes";
import { PersonsFilterBody } from "./SystemUserFilterBody";
import { SystemUserAddNewModalButton, SystemUserEditModalButton } from "./Modals/SystemUserModalButtons";
import { systemUserRepository } from "./SystemUserController";

export default function PersonsSearch({ title }: { title: string }) {
    useEffect(() => {
        document.title = title;
    }, [title]);

    function renderEntityName(person: SystemUserData) {
        return <>{person._entity.name}</>;
    }

    function renderSystemRoleId(person: SystemUserData) {
        return <>{person.systemRoleId}</>;
    }

    return (
        <FilterableTable<SystemUserData>
            id="persons"
            title={title}
            FilterBodyComponent={PersonsFilterBody}
            tableStructure={[
                {
                    header: "Imię i nazwisko",
                    renderTdBody: (person: SystemUserData) => (
                        <>
                            {person.name} {person.surname}
                        </>
                    ),
                    colMd: 2,
                },
                { header: "Telefon", objectAttributeToShow: "phone", colMd: 1 },
                { header: "Email", objectAttributeToShow: "email", colMd: 2 },
                { header: "Firma", renderTdBody: (person: SystemUserData) => renderEntityName(person), colMd: 2 },
                { header: "Stanowisko", objectAttributeToShow: "position", colMd: 1 },
                { header: "Email systemowy", objectAttributeToShow: "systemEmail", colMd: 2 },
                { header: "Rola systemowa", renderTdBody: (person: SystemUserData) => renderSystemRoleId(person), colMd: 1 },
            ]}
            AddNewButtonComponents={[SystemUserAddNewModalButton]}
            EditButtonComponent={SystemUserEditModalButton}
            isDeletable={true}
            repository={systemUserRepository}
            selectedObjectRoute={"/user/"}
        />
    );
}
