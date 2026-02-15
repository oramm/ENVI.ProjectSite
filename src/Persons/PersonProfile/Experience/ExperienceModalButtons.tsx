import React from "react";
import { PersonProfileExperienceV2Record } from "../../../../Typings/bussinesTypes";
import { GeneralAddNewModalButton, GeneralEditModalButton } from "../../../View/Modals/GeneralModalButtons";
import { SpecificAddNewModalButtonProps, SpecificEditModalButtonProps } from "../../../View/Modals/ModalsTypes";
import RepositoryReact from "../../../React/RepositoryReact";
import { ExperienceModalBody } from "./ExperienceModalBody";
import { makeExperienceValidationSchema } from "./ExperienceValidationSchema";

export function createExperienceEditModalButton(repository: RepositoryReact<PersonProfileExperienceV2Record>) {
    return function ExperienceEditModalButton({ modalProps: { onEdit, initialData } }: SpecificEditModalButtonProps<PersonProfileExperienceV2Record>) {
        return (
            <GeneralEditModalButton<PersonProfileExperienceV2Record>
                modalProps={{
                    onEdit: onEdit,
                    ModalBodyComponent: ExperienceModalBody,
                    modalTitle: "Edycja doświadczenia",
                    repository: repository,
                    initialData: initialData,
                    makeValidationSchema: makeExperienceValidationSchema,
                }}
                buttonProps={{
                    buttonVariant: "outline-success",
                }}
            />
        );
    };
}

export function createExperienceAddNewModalButton(repository: RepositoryReact<PersonProfileExperienceV2Record>) {
    return function ExperienceAddNewModalButton({ modalProps: { onAddNew } }: SpecificAddNewModalButtonProps<PersonProfileExperienceV2Record>) {
        return (
            <GeneralAddNewModalButton<PersonProfileExperienceV2Record>
                modalProps={{
                    onAddNew: onAddNew,
                    ModalBodyComponent: ExperienceModalBody,
                    modalTitle: "Dodaj doświadczenie",
                    repository: repository,
                    makeValidationSchema: makeExperienceValidationSchema,
                }}
                buttonProps={{
                    buttonCaption: "Dodaj doświadczenie",
                    buttonVariant: "outline-success",
                }}
            />
        );
    };
}
