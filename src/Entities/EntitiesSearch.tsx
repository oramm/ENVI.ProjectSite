import React, { useEffect } from "react";
import FilterableTable from "../View/Resultsets/FilterableTable/FilterableTable";
import { EntityData } from "../../Typings/bussinesTypes";
import { EntityAddNewModalButton, EntityEditModalButton } from "./Modals/EntityModalButtons";
import { entitiesRepository } from "./EntitiesController";
import { EntitiesFilterBody } from "./EntityFilterBody";

export default function EntitiesSearch({ title }: { title: string }) {
    useEffect(() => {
        document.title = title;
    }, [title]);

    return (
        <FilterableTable<EntityData>
            id="entities"
            title={title}
            FilterBodyComponent={EntitiesFilterBody}
            tableStructure={[
                { header: "Nazwa", objectAttributeToShow: "name" },
                { header: "Adres", objectAttributeToShow: "address" },
                { header: "NIP", objectAttributeToShow: "taxNumber" },
                { header: "Telefon", objectAttributeToShow: "phone" },
            ]}
            AddNewButtonComponents={[EntityAddNewModalButton]}
            EditButtonComponent={EntityEditModalButton}
            isDeletable={true}
            repository={entitiesRepository}
            selectedObjectRoute={"/entity/"}
        />
    );
}
