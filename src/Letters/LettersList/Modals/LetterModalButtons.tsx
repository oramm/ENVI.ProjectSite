import React, { useEffect } from 'react';
import { GeneralAddNewModalButton, GeneralEditModalButton } from '../../../View/Modals/GeneralModalButtons';
import { SpecificAddNewModalButtonProps, SpecificEditModalButtonProps } from "../../../View/Modals/ModalsTypes";
import { ProjectSelectorModalBody } from './LetterModalBody';
import { otherLetterValidationSchema, ourLetterValidationSchema } from './LetterValidationSchema';
import { IncomingLetterModalBody } from './IncomingLetterModalBody';
import { OurLetterModalBody } from './OurLetterModalBody TEST';
import { lettersRepository } from '../LettersSearch';


/** przycisk i modal edycji Letter */
export function LetterEditModalButton({
    modalProps: { onEdit, initialData },
    buttonProps,
}: SpecificEditModalButtonProps) {

    useEffect(() => {
        console.log("LetterEditModalButton initialData", initialData);
    }, [initialData]);

    return (
        initialData.ourId
            ? <OurLetterEditModalButton
                modalProps={{ onEdit, initialData }}
                buttonProps={buttonProps}
            />
            : <IncomingLetterEditModalButton
                modalProps={{ onEdit, initialData }}
                buttonProps={buttonProps}
            />
    );
}

export function OurLetterEditModalButton({
    modalProps: { onEdit, initialData, },
}: SpecificEditModalButtonProps) {
    return (
        <GeneralEditModalButton
            modalProps={{
                onEdit: onEdit,
                ModalBodyComponent: OurLetterModalBody,
                modalTitle: "Edycja pisma wychodzącego",
                repository: lettersRepository,
                initialData: initialData,
                validationSchema: ourLetterValidationSchema
            }}
            buttonProps={{
                buttonVariant: "outline-success",
            }}
        />
    );
}

export function OurLetterAddNewModalButton({
    modalProps: { onAddNew },
}: SpecificAddNewModalButtonProps) {
    return (
        <GeneralAddNewModalButton
            modalProps={{
                onAddNew: onAddNew,
                ModalBodyComponent: ProjectSelectorModalBody,
                additionalModalBodyProps: { SpecificLetterModalBody: OurLetterModalBody },
                modalTitle: "Rejestruj pismo wychodzące",
                repository: lettersRepository,
                validationSchema: ourLetterValidationSchema
            }}
            buttonProps={{
                buttonCaption: "Rejestruj wychodzące",
                buttonVariant: "outline-success",
            }}
        />
    );
}

export function IncomingLetterEditModalButton({
    modalProps: { onEdit, initialData },
}: SpecificEditModalButtonProps) {
    return (
        <GeneralEditModalButton
            modalProps={{
                onEdit: onEdit,
                ModalBodyComponent: IncomingLetterModalBody,
                modalTitle: "Edycja pisma przychodzącego",
                repository: lettersRepository,
                initialData: initialData,
                validationSchema: otherLetterValidationSchema
            }}
            buttonProps={{}}
        />
    );
}

export function IncomingLetterAddNewModalButton({
    modalProps: { onAddNew },
}: SpecificAddNewModalButtonProps) {
    return (
        <GeneralAddNewModalButton
            modalProps={{
                onAddNew: onAddNew,
                ModalBodyComponent: ProjectSelectorModalBody,
                additionalModalBodyProps: { SpecificLetterModalBody: IncomingLetterModalBody, },// additional props for ProjectSelectorModalBody
                modalTitle: "Nowe pismo przychodzące",
                repository: lettersRepository,
                validationSchema: otherLetterValidationSchema
            }}
            buttonProps={{
                buttonCaption: "Rejestruj przychodzące",
            }}
        />
    );
}