import React, { useEffect } from "react";
import FilterableTable from "../../View/Resultsets/FilterableTable/FilterableTable";
import { RoleData } from "../../../Typings/bussinesTypes";
import { RolesFilterBody } from "./RoleFilterBody";
import { rolesRepository } from "./RolesController";
import { RoleAddNewModalButton, RoleEditModalButton } from "./Modals/RoleModalButtons";

export default function RolesSearch({ title }: { title: string }) {
    useEffect(() => {
        document.title = title;
    }, [title]);

    return (
        <FilterableTable<RoleData>
            id="roles"
            title={title}
            FilterBodyComponent={RolesFilterBody}
            tableStructure={[
                { header: "Nazwa", objectAttributeToShow: "name" },
                { header: "Adres", objectAttributeToShow: "groupName" },
                { header: "NIP", objectAttributeToShow: "description" },
            ]}
            AddNewButtonComponents={[RoleAddNewModalButton]}
            EditButtonComponent={RoleEditModalButton}
            isDeletable={true}
            repository={rolesRepository}
            selectedObjectRoute={"/role/"}
        />
    );
}
