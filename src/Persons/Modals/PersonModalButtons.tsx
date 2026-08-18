import React from "react";
import { PersonData } from "../../../Typings/bussinesTypes";
import { GeneralAddNewModalButton, GeneralEditModalButton } from "../../View/Modals/GeneralModalButtons";
import { SpecificAddNewModalButtonProps, SpecificEditModalButtonProps } from "../../View/Modals/ModalsTypes";
import { personsRepository } from "../PersonsController";
import { PersonModalBody } from "./PersonModalBody";
import { makePersonValidationSchema } from "./PersonValidationSchema";
import { savePersonV2AccountAndProfile, throwOnSaveErrors } from "../personsV2Helpers";

/**
 * Domknięcie zapisu osoby danymi v2.
 *
 * UWAGA: oba payloady są dziś puste, więc `savePersonV2AccountAndProfile` pomija oba PUT-y
 * i to wywołanie NIE generuje żadnego żądania. Zostaje jako jedno miejsce podpięcia, gdy
 * formularz Osób dostanie pola konta (`systemRoleId`, `systemEmail` są w nim zakomentowane)
 * albo profilu (`headline`, `summary`) - wtedy trzeba tu wstawić realne payloady.
 *
 * Wiersz `PersonProfiles` nie jest już zakładany przy zapisie osoby: tworzą go leniwie
 * moduły profilu przy pierwszym wpisie (wykształcenie / doświadczenie / specjalizacja).
 */
async function savePersonV2Data(person: PersonData): Promise<string[]> {
    if (!person?.id) return [];
    const result = await savePersonV2AccountAndProfile(person.id, {}, {}, "Persons");
    return result.errors;
}

export function PersonEditModalButton({
    modalProps: { onEdit, initialData },
}: SpecificEditModalButtonProps<PersonData>) {
    async function handleEdit(editedObject: PersonData) {
        const errors = await savePersonV2Data(editedObject);
        // Lista dostaje dane legacy niezależnie od wyniku v2 - one już są w bazie.
        onEdit(editedObject);
        // Dopiero teraz błąd: modal zostaje otwarty i pokazuje, czego NIE zapisał.
        throwOnSaveErrors(errors);
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
                // PersonModalBody używa InlineCreateDrawer — modal musi puścić focus do panelu
                enforceFocus: false,
            }}
            buttonProps={{
                buttonVariant: "outline-success",
            }}
        />
    );
}

export function PersonAddNewModalButton({ modalProps: { onAddNew } }: SpecificAddNewModalButtonProps<PersonData>) {
    async function handleAddNew(newObject: PersonData) {
        const errors = await savePersonV2Data(newObject);
        onAddNew(newObject);
        throwOnSaveErrors(errors);
    }

    return (
        <GeneralAddNewModalButton<PersonData>
            modalProps={{
                onAddNew: handleAddNew,
                ModalBodyComponent: PersonModalBody,
                modalTitle: "Dodaj osobę",
                repository: personsRepository,
                makeValidationSchema: makePersonValidationSchema,
                // PersonModalBody używa InlineCreateDrawer — modal musi puścić focus do panelu
                enforceFocus: false,
            }}
            buttonProps={{
                buttonCaption: "Dodaj osobę",
                buttonVariant: "outline-success",
            }}
        />
    );
}
