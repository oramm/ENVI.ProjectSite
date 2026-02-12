import React from "react";
import { PersonData } from "../../../Typings/bussinesTypes";
import { GeneralAddNewModalButton, GeneralEditModalButton } from "../../View/Modals/GeneralModalButtons";
import { SpecificAddNewModalButtonProps, SpecificEditModalButtonProps } from "../../View/Modals/ModalsTypes";
import { personsRepository } from "../PersonsController";
import { PersonModalBody } from "./PersonModalBody";
import { makePersonValidationSchema } from "./PersonValidationSchema";
import { savePersonV2AccountAndProfile } from "../personsV2Helpers";

export function PersonEditModalButton({
    modalProps: { onEdit, initialData },
}: SpecificEditModalButtonProps<PersonData>) {
    async function handleEdit(editedObject: PersonData) {
        // Po zapisie legacy, wyslij PUT v2 account + profile
        // Pola account (systemRoleId, systemEmail) sa zakomentowane w formularzu Persons
        // Wysylamy puste payloady -- endpointy v2 tworza/aktualizuja rekordy
        if (editedObject?.id) {
            await savePersonV2AccountAndProfile(
                editedObject.id,
                {},
                {},
                "Persons"
            );
        }
        onEdit(editedObject);
    }

    return (
        <GeneralEditModalButton<PersonData>
            modalProps={{
                onEdit: handleEdit,
                ModalBodyComponent: PersonModalBody,
                modalTitle: "Edycja danych osoby",
                repository: personsRepository,
                initialData: initialData,
                makeValidationSchema: makePersonValidationSchema,
            }}
            buttonProps={{
                buttonVariant: "outline-success",
            }}
        />
    );
}

export function PersonAddNewModalButton({ modalProps: { onAddNew } }: SpecificAddNewModalButtonProps<PersonData>) {
    return (
        <GeneralAddNewModalButton<PersonData>
            modalProps={{
                onAddNew: onAddNew,
                ModalBodyComponent: PersonModalBody,
                modalTitle: "Dodaj osobę",
                repository: personsRepository,
                makeValidationSchema: makePersonValidationSchema,
            }}
            buttonProps={{
                buttonCaption: "Dodaj osobę",
                buttonVariant: "outline-success",
            }}
        />
    );
}
