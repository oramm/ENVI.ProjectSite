import React, { useEffect } from 'react';
import { Case } from '../../../../Typings/bussinesTypes';
import { GeneralAddNewModalButton, GeneralEditModalButton } from '../../../View/Modals/GeneralModalButtons';
import { SpecificAddNewModalButtonProps, SpecificEditModalButtonProps } from "../../../View/Modals/ModalsTypes";
import { casesRepository } from '../../TasksGlobalController';
import { CaseModalBody } from './CaseModalBody';
import { makeMultipleCaseValidationSchema, makeUniqueCaseValidationSchema } from './CaseValidationSchema';

export function CaseEditModalButton({
    modalProps: { onEdit, initialData },
    buttonProps,
}: SpecificEditModalButtonProps<Case>) {

    return (
        <GeneralEditModalButton<Case>
            modalProps={{
                onEdit: onEdit,
                ModalBodyComponent: CaseModalBody,
                modalTitle: "Edycja sprawy",
                repository: casesRepository,
                initialData: initialData,
                makeValidationSchema: initialData._type.isUniquePerMilestone ?
                    makeUniqueCaseValidationSchema : makeMultipleCaseValidationSchema
            }}
            buttonProps={{
                ...buttonProps,
                buttonVariant: "outline-success",
            }}
        />
    );
}

export function CaseAddNewModalButton({
    modalProps: { onAddNew, contextData },
    buttonProps
}: SpecificAddNewModalButtonProps<Case>) {
    return (
        <GeneralAddNewModalButton
            modalProps={{
                onAddNew: onAddNew,
                contextData,
                ModalBodyComponent: CaseModalBody,
                additionalModalBodyProps: { SpecificContractModalBody: CaseModalBody },
                modalTitle: "Nowa sprawa",
                repository: casesRepository,
                makeValidationSchema: makeMultipleCaseValidationSchema,
            }}
            buttonProps={{
                buttonCaption: "Dodaj sprawę",
                buttonVariant: "outline-success",
                ...buttonProps,
            }}
        />
    );
}