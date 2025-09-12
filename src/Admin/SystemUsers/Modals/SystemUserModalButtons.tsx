import React from "react";
import { SystemUserData } from "../../../../Typings/bussinesTypes";
import { GeneralAddNewModalButton, GeneralEditModalButton } from "../../../View/Modals/GeneralModalButtons";
import { SpecificAddNewModalButtonProps, SpecificEditModalButtonProps } from "../../../View/Modals/ModalsTypes";
import { systemUserRepository } from "../SystemUserController";
import { SystemUserModalBody } from "./SystemUserModalBody";
import { makeSystemUserValidationSchema } from "./SystemUserValidationSchema";

export function SystemUserEditModalButton({
    modalProps: { onEdit, initialData },
}: SpecificEditModalButtonProps<SystemUserData>) {
    return (
        <GeneralEditModalButton<SystemUserData>
            modalProps={{
                onEdit: onEdit,
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
    return (
        <GeneralAddNewModalButton<SystemUserData>
            modalProps={{
                onAddNew: onAddNew,
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
