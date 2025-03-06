import React from "react";
import { SpecificAddNewModalButtonProps, SpecificEditModalButtonProps } from "../../../View/Modals/ModalsTypes";
import { RoleData } from "../../../../Typings/bussinesTypes";
import { GeneralAddNewModalButton, GeneralEditModalButton } from "../../../View/Modals/GeneralModalButtons";
import { rolesRepository } from "../RolesController";
import { RoleModalBody } from "./RoleModalBody";
import { makeRoleValidationSchema } from "./RoleValidationSchema";

export function RoleEditModalButton({ modalProps: { onEdit, initialData } }: SpecificEditModalButtonProps<RoleData>) {
    return (
        <GeneralEditModalButton<RoleData>
            modalProps={{
                onEdit: onEdit,
                ModalBodyComponent: RoleModalBody,
                modalTitle: "Edycja roli",
                repository: rolesRepository,
                initialData: initialData,
                makeValidationSchema: makeRoleValidationSchema,
            }}
            buttonProps={{
                buttonVariant: "outline-success",
            }}
        />
    );
}

export function RoleAddNewModalButton({ modalProps: { onAddNew } }: SpecificAddNewModalButtonProps<RoleData>) {
    return (
        <GeneralAddNewModalButton<RoleData>
            modalProps={{
                onAddNew: onAddNew,
                ModalBodyComponent: RoleModalBody,
                modalTitle: "Dodaj rolę",
                repository: rolesRepository,
                makeValidationSchema: makeRoleValidationSchema,
            }}
            buttonProps={{
                buttonCaption: "Dodaj rolę",
                buttonVariant: "outline-success",
            }}
        />
    );
}
