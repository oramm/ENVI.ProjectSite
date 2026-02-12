import React from "react";
import { SystemUserData } from "../../../../Typings/bussinesTypes";
import { GeneralAddNewModalButton, GeneralEditModalButton } from "../../../View/Modals/GeneralModalButtons";
import { SpecificAddNewModalButtonProps, SpecificEditModalButtonProps } from "../../../View/Modals/ModalsTypes";
import { systemUserRepository } from "../SystemUserController";
import { SystemUserModalBody } from "./SystemUserModalBody";
import { makeSystemUserValidationSchema } from "./SystemUserValidationSchema";
import { savePersonV2AccountAndProfile } from "../../../Persons/personsV2Helpers";

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
