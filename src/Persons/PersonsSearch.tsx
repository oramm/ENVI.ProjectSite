import React, { useEffect } from "react";
import FilterableTable from "../View/Resultsets/FilterableTable/FilterableTable";
import { EntityData, Person } from "../../Typings/bussinesTypes";
import { PersonsFilterBody } from "./PersonFilterBody";
import { PersonAddNewModalButton, PersonEditModalButton } from "./Modals/PersonModalButtons";
import { personsRepository } from "./PersonsController";

export default function PersonsSearch({ title }: { title: string }) {
    useEffect(() => {
        document.title = title;
    }, [title]);

    function renderEntityName(person: Person) {
        return <>{person._entity.name}</>;
    }

    return (
        <FilterableTable<Person>
            id="persons"
            title={title}
            FilterBodyComponent={PersonsFilterBody}
            tableStructure={[
                { header: "Imię", objectAttributeToShow: "name" },
                { header: "Nazwisko", objectAttributeToShow: "surname" },
                { header: "Telefon", objectAttributeToShow: "phone" },
                { header: "Email", objectAttributeToShow: "email" },
                { header: "Firma", renderTdBody: (person: Person) => renderEntityName(person) },
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
