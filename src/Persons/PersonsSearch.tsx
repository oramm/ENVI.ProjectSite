import React, { useEffect } from "react";
import FilterableTable from "../View/Resultsets/FilterableTable/FilterableTable";
import { EntityData, PersonData } from "../../Typings/bussinesTypes";
import { PersonsFilterBody } from "./PersonFilterBody";
import { PersonAddNewModalButton, PersonEditModalButton } from "./Modals/PersonModalButtons";
import { personsRepository } from "./PersonsController";

export default function PersonsSearch({ title }: { title: string }) {
    useEffect(() => {
        document.title = title;
    }, [title]);

    function renderEntityName(person: PersonData) {
        return <>{person._entity.name}</>;
    }

    return (
        <FilterableTable<PersonData>
            id="persons"
            title={title}
            FilterBodyComponent={PersonsFilterBody}
            tableStructure={[
                { header: "Imię", objectAttributeToShow: "name" },
                { header: "Nazwisko", objectAttributeToShow: "surname" },
                { header: "Telefon", objectAttributeToShow: "phone" },
                { header: "Email", objectAttributeToShow: "email" },
                { header: "Firma", renderTdBody: (person: PersonData) => renderEntityName(person) },
                { header: "Stanowisko", objectAttributeToShow: "position" },
                { header: "Opis", objectAttributeToShow: "comment" },
            ]}
            AddNewButtonComponents={[PersonAddNewModalButton]}
            EditButtonComponent={PersonEditModalButton}
            isDeletable={true}
            repository={personsRepository}
            selectedObjectRoute={"/person/"}
        />
    );
}
