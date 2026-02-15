import React from "react";
import { SkillDictionaryRecord } from "../../../../Typings/bussinesTypes";
import { GeneralAddNewModalButton, GeneralEditModalButton } from "../../../View/Modals/GeneralModalButtons";
import { SpecificAddNewModalButtonProps, SpecificEditModalButtonProps } from "../../../View/Modals/ModalsTypes";
import { skillsDictionaryRepository } from "../SkillsDictionaryController";
import { SkillDictionaryModalBody } from "./SkillDictionaryModalBody";
import { makeSkillDictionaryValidationSchema } from "./SkillDictionaryValidationSchema";

export function SkillDictionaryEditModalButton({ modalProps: { onEdit, initialData } }: SpecificEditModalButtonProps<SkillDictionaryRecord>) {
    return (
        <GeneralEditModalButton<SkillDictionaryRecord>
            modalProps={{
                onEdit: onEdit,
                ModalBodyComponent: SkillDictionaryModalBody,
                modalTitle: "Edycja specjalizacji",
                repository: skillsDictionaryRepository,
                initialData: initialData,
                makeValidationSchema: makeSkillDictionaryValidationSchema,
            }}
            buttonProps={{
                buttonVariant: "outline-success",
            }}
        />
    );
}

export function SkillDictionaryAddNewModalButton({ modalProps: { onAddNew } }: SpecificAddNewModalButtonProps<SkillDictionaryRecord>) {
    return (
        <GeneralAddNewModalButton<SkillDictionaryRecord>
            modalProps={{
                onAddNew: onAddNew,
                ModalBodyComponent: SkillDictionaryModalBody,
                modalTitle: "Dodaj specjalizację",
                repository: skillsDictionaryRepository,
                makeValidationSchema: makeSkillDictionaryValidationSchema,
            }}
            buttonProps={{
                buttonCaption: "Dodaj specjalizację",
                buttonVariant: "outline-success",
            }}
        />
    );
}
