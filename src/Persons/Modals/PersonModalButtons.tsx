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
            try {
                await savePersonV2AccountAndProfile(editedObject.id, {}, {}, "Persons");
            } catch (err) {
                console.error("[Persons] savePersonV2: błąd przy edycji osoby id=%d", editedObject.id, err);
            }
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
    async function handleAddNew(newObject: PersonData) {
        if (newObject?.id) {
            try {
                await savePersonV2AccountAndProfile(newObject.id, {}, {}, "Persons");
            } catch (err) {
                console.error("[Persons] savePersonV2: błąd po dodaniu osoby id=%d", newObject.id, err);
            }
        }
        onAddNew(newObject);
    }

    return (
        <GeneralAddNewModalButton<PersonData>
            modalProps={{
                onAddNew: handleAddNew,
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
