import React from "react";
import { SpecificAddNewModalButtonProps, SpecificEditModalButtonProps } from "../../../View/Modals/ModalsTypes";
import { RoleData } from "../../../../Typings/bussinesTypes";
import { GeneralAddNewModalButton, GeneralEditModalButton } from "../../../View/Modals/GeneralModalButtons";
import { rolesRepository } from "../RolesController";
import { RoleModalBody } from "./RoleModalBody";
import { makeRoleValidationSchema } from "./RoleValidationSchema";
import { ContractRoleModalBody } from "./ContractRoleModal";
import { ProjectRoleModalBody } from "./ProjectRoleModal";

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

export function ContractRoleAddNewModalButton({ modalProps: { onAddNew } }: SpecificAddNewModalButtonProps<RoleData>) {
    return (
        <GeneralAddNewModalButton<RoleData>
            modalProps={{
                onAddNew: onAddNew,
                ModalBodyComponent: ContractRoleModalBody,
                modalTitle: "Dodaj rolę kontraktową",
                modalSubtitle:
                    "Dodana rola będzie przypisana do wybranego kontraktu. Jeśli chcesz dodać rolę do wszystkich kontraktów w projekcie," +
                    "skorzystaj z opcji dodaj rolę projektową",
                repository: rolesRepository,
                makeValidationSchema: makeRoleValidationSchema,
            }}
            buttonProps={{
                buttonCaption: "Dodaj rolę kontraktową",
                buttonVariant: "outline-success",
            }}
        />
    );
}

export function ProjectRoleAddNewModalButton({ modalProps: { onAddNew } }: SpecificAddNewModalButtonProps<RoleData>) {
    return (
        <GeneralAddNewModalButton<RoleData>
            modalProps={{
                onAddNew: onAddNew,
                ModalBodyComponent: ProjectRoleModalBody,
                modalTitle: "Dodaj rolę projektową",
                modalSubtitle:
                    "Dodana rola będzie przypisana do wszystkich kontraktów w wybranym projekcie. Jeśi chcesz dodac rolę do jednego kontraktu," +
                    "skorzystaj z opcji dodaj rola kontraktowa",
                repository: rolesRepository,
                makeValidationSchema: makeRoleValidationSchema,
            }}
            buttonProps={{
                buttonCaption: "Dodaj rolę projektową",
                buttonVariant: "outline-success",
            }}
        />
    );
}
