import React from "react";
import { PersonProfileSkillV2Record } from "../../../../Typings/bussinesTypes";
import { GeneralAddNewModalButton, GeneralEditModalButton } from "../../../View/Modals/GeneralModalButtons";
import { SpecificAddNewModalButtonProps, SpecificEditModalButtonProps } from "../../../View/Modals/ModalsTypes";
import RepositoryReact from "../../../React/RepositoryReact";
import { ProfileSkillModalBody } from "./ProfileSkillModalBody";
import { makeProfileSkillValidationSchema } from "./ProfileSkillValidationSchema";

export function createProfileSkillEditModalButton(repository: RepositoryReact<PersonProfileSkillV2Record>) {
    return function ProfileSkillEditModalButton({ modalProps: { onEdit, initialData } }: SpecificEditModalButtonProps<PersonProfileSkillV2Record>) {
        return (
            <GeneralEditModalButton<PersonProfileSkillV2Record>
                modalProps={{
                    onEdit: onEdit,
                    ModalBodyComponent: ProfileSkillModalBody,
                    modalTitle: "Edycja specjalizacji",
                    repository: repository,
                    initialData: initialData,
                    makeValidationSchema: makeProfileSkillValidationSchema,
                }}
                buttonProps={{
                    buttonVariant: "outline-success",
                }}
            />
        );
    };
}

export function createProfileSkillAddNewModalButton(repository: RepositoryReact<PersonProfileSkillV2Record>) {
    return function ProfileSkillAddNewModalButton({ modalProps: { onAddNew } }: SpecificAddNewModalButtonProps<PersonProfileSkillV2Record>) {
        return (
            <GeneralAddNewModalButton<PersonProfileSkillV2Record>
                modalProps={{
                    onAddNew: onAddNew,
                    ModalBodyComponent: ProfileSkillModalBody,
                    modalTitle: "Dodaj specjalizację",
                    repository: repository,
                    makeValidationSchema: makeProfileSkillValidationSchema,
                }}
                buttonProps={{
                    buttonCaption: "Dodaj specjalizację",
                    buttonVariant: "outline-success",
                }}
            />
        );
    };
}
