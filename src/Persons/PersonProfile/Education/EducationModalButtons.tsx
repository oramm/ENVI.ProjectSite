import React from "react";
import { PersonProfileEducationV2Record } from "../../../../Typings/bussinesTypes";
import { GeneralAddNewModalButton, GeneralEditModalButton } from "../../../View/Modals/GeneralModalButtons";
import { SpecificAddNewModalButtonProps, SpecificEditModalButtonProps } from "../../../View/Modals/ModalsTypes";
import RepositoryReact from "../../../React/RepositoryReact";
import { EducationModalBody } from "./EducationModalBody";
import { makeEducationValidationSchema } from "./EducationValidationSchema";

export function createEducationEditModalButton(repository: RepositoryReact<PersonProfileEducationV2Record>) {
    return function EducationEditModalButton({ modalProps: { onEdit, initialData } }: SpecificEditModalButtonProps<PersonProfileEducationV2Record>) {
        return (
            <GeneralEditModalButton<PersonProfileEducationV2Record>
                modalProps={{
                    onEdit: onEdit,
                    ModalBodyComponent: EducationModalBody,
                    modalTitle: "Edycja wykształcenia",
                    repository: repository,
                    initialData: initialData,
                    makeValidationSchema: makeEducationValidationSchema,
                }}
                buttonProps={{
                    buttonVariant: "outline-success",
                }}
            />
        );
    };
}

export function createEducationAddNewModalButton(repository: RepositoryReact<PersonProfileEducationV2Record>) {
    return function EducationAddNewModalButton({ modalProps: { onAddNew } }: SpecificAddNewModalButtonProps<PersonProfileEducationV2Record>) {
        return (
            <GeneralAddNewModalButton<PersonProfileEducationV2Record>
                modalProps={{
                    onAddNew: onAddNew,
                    ModalBodyComponent: EducationModalBody,
                    modalTitle: "Dodaj wykształcenie",
                    repository: repository,
                    makeValidationSchema: makeEducationValidationSchema,
                }}
                buttonProps={{
                    buttonCaption: "Dodaj wykształcenie",
                    buttonVariant: "outline-success",
                }}
            />
        );
    };
}
