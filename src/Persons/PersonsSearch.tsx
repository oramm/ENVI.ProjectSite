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
                {
                    header: "Imię i nazwisko",
                    renderTdBody: (person: PersonData) => (
                        <>
                            {person.name} {person.surname}
                        </>
                    ),
                    colMd: 2,
                },
                { header: "Telefon", objectAttributeToShow: "phone", colMd: 2 },
                { header: "Email", objectAttributeToShow: "email", colMd: 2 },
                { header: "Firma", renderTdBody: (person: PersonData) => renderEntityName(person), colMd: 2 },
                { header: "Stanowisko", objectAttributeToShow: "position", colMd: 1 },
                { header: "Opis", objectAttributeToShow: "comment", colMd: 2 },
            ]}
            AddNewButtonComponents={[PersonAddNewModalButton]}
            EditButtonComponent={PersonEditModalButton}
            isDeletable={true}
            repository={personsRepository}
            selectedObjectRoute={"/person/"}
        />
    );
}
