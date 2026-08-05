import React from "react";
import { SystemUserData } from "../../../../Typings/bussinesTypes";
import { GeneralAddNewModalButton, GeneralEditModalButton } from "../../../View/Modals/GeneralModalButtons";
import { SpecificAddNewModalButtonProps, SpecificEditModalButtonProps } from "../../../View/Modals/ModalsTypes";
import { systemUserRepository } from "../SystemUserController";
import { SystemUserModalBody } from "./SystemUserModalBody";
import { makeSystemUserValidationSchema } from "./SystemUserValidationSchema";
import { savePersonProjectAssignments, savePersonV2AccountAndProfile } from "../../../Persons/personsV2Helpers";
import MainSetup from "../../../React/MainSetupReact";

/**
 * Zapisuje przypisania projektów po zapisaniu konta. Dla ról spoza zakresowych
 * (pracownik kontraktowy, klient) wysyła pustą listę - dzięki temu zmiana roli na inną
 * odbiera dostęp do projektów, zamiast zostawiać go po cichu w bazie.
 */
export async function saveProjectAssignments(person: SystemUserData) {
    if (!person?.id) return;

    if (!MainSetup.isProjectScopedRoleId(person.systemRoleId)) {
        await savePersonProjectAssignments(person.id, []);
        return;
    }

    const selected = (person as any)._projectAssignments;
    // Brak pola to NIE to samo co pusty wybór. Gdyby formularz go nie dowiózł,
    // pusta lista skasowałaby istniejące przypisania - a zapis, który po cichu
    // kasuje dane, jest gorszy niż zapis, który ich nie ruszy.
    if (!Array.isArray(selected)) return;

    await savePersonProjectAssignments(
        person.id,
        selected.map((project: { ourId: string }) => project.ourId)
    );
}

export function SystemUserEditModalButton({
    modalProps: { onEdit, initialData },
}: SpecificEditModalButtonProps<SystemUserData>) {
    async function handleEdit(editedObject: SystemUserData) {
        // Po zapisie legacy, wyslij PUT v2 account + profile
        if (editedObject?.id) {
            await savePersonV2AccountAndProfile(
                editedObject.id,
                {
                    systemRoleId: editedObject.systemRoleId
                        ? Number(editedObject.systemRoleId)
                        : undefined,
                    systemEmail: editedObject.systemEmail || undefined,
                },
                {},
                "SystemUsers"
            );
            await saveProjectAssignments(editedObject);
        }
        onEdit(editedObject);
    }

    return (
        <GeneralEditModalButton<SystemUserData>
            modalProps={{
                onEdit: handleEdit,
                ModalBodyComponent: SystemUserModalBody,
                modalTitle: "Edycja danych osoby",
                repository: systemUserRepository,
                initialData: initialData,
                makeValidationSchema: makeSystemUserValidationSchema,
            }}
            buttonProps={{
                buttonVariant: "outline-success",
            }}
        />
    );
}

export function SystemUserAddNewModalButton({ modalProps: { onAddNew } }: SpecificAddNewModalButtonProps<SystemUserData>) {
    async function handleAddNew(newObject: SystemUserData) {
        // Po POST /person, wyslij PUT v2 account z danymi systemowymi
        if (newObject?.id) {
            await savePersonV2AccountAndProfile(
                newObject.id,
                {
                    systemRoleId: newObject.systemRoleId
                        ? Number(newObject.systemRoleId)
                        : undefined,
                    systemEmail: newObject.systemEmail || undefined,
                },
                {},
                "SystemUsers"
            );
            await saveProjectAssignments(newObject);
        }
        onAddNew(newObject);
    }

    return (
        <GeneralAddNewModalButton<SystemUserData>
            modalProps={{
                onAddNew: handleAddNew,
                ModalBodyComponent: SystemUserModalBody,
                modalTitle: "Dodaj użytkownika systemu",
                repository: systemUserRepository,
                makeValidationSchema: makeSystemUserValidationSchema,
            }}
            buttonProps={{
                buttonCaption: "Dodaj użytkownika",
                buttonVariant: "outline-success",
            }}
        />
    );
}
