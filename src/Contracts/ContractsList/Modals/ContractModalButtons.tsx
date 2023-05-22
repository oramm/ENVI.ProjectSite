import React from 'react';
import { GeneralAddNewModalButton, GeneralDeleteModalButton, GeneralEditModalButton } from '../../../View/Modals/GeneralModalButtons';
import { SpecificAddNewModalButtonProps, SpecificDeleteModalButtonProps, SpecificEditModalButtonProps } from "../../../View/Modals/ModalsTypes";
import { contractsRepository } from '../ContractsSearch';
import { ProjectSelectorModalBody } from './ContractModalBody';
import { otherContractValidationSchema, ourContractValidationSchema } from './ContractValidationSchema';
import { OtherContractModalBody } from './OtherContractModalBody';
import { OurContractModalBody } from './OurContractModalBody';


/** przycisk i modal edycji OurCOntract lub OtherContract */
export function ContractEditModalButton({
    modalProps: { onEdit, initialData },
    buttonProps,
}: SpecificEditModalButtonProps) {
    return (
        initialData.ourId
            ? <OurContractEditModalButton
                modalProps={{ onEdit, initialData }}
                buttonProps={buttonProps}
            />
            : <OtherContractEditModalButton
                modalProps={{ onEdit, initialData }}
                buttonProps={buttonProps}
            />
    );
}

export function OurContractEditModalButton({
    modalProps: { onEdit, initialData, },
}: SpecificEditModalButtonProps) {
    return (
        <GeneralEditModalButton
            modalProps={{
                onEdit: onEdit,
                ModalBodyComponent: OurContractModalBody,
                modalTitle: "Edycja umowy",
                repository: contractsRepository,
                initialData: initialData,
                makeValidationSchema: ourContractValidationSchema
            }}
            buttonProps={{
                buttonVariant: "outline-success",
            }}
        />
    );
}

export function OurContractAddNewModalButton({
    modalProps: { onAddNew },
}: SpecificAddNewModalButtonProps) {
    return (
        <GeneralAddNewModalButton
            modalProps={{
                onAddNew: onAddNew,
                ModalBodyComponent: ProjectSelectorModalBody,
                additionalModalBodyProps: { SpecificContractModalBody: OurContractModalBody },
                modalTitle: "Nowa umowa ENVI",
                repository: contractsRepository,
                makeValidationSchema: ourContractValidationSchema
            }}
            buttonProps={{
                buttonCaption: "Rejestruj umowę ENVI",
                buttonVariant: "outline-success",
            }}
        />
    );
}

export function OtherContractEditModalButton({
    modalProps: { onEdit, initialData },
}: SpecificEditModalButtonProps) {
    return (
        <GeneralEditModalButton
            modalProps={{
                onEdit: onEdit,
                ModalBodyComponent: OtherContractModalBody,
                modalTitle: "Edycja umowy",
                repository: contractsRepository,
                initialData: initialData,
                makeValidationSchema: otherContractValidationSchema
            }}
            buttonProps={{}}
        />
    );
}

export function OtherContractAddNewModalButton({
    modalProps: { onAddNew },
}: SpecificAddNewModalButtonProps) {
    return (
        <GeneralAddNewModalButton
            modalProps={{
                onAddNew: onAddNew,
                ModalBodyComponent: ProjectSelectorModalBody,
                additionalModalBodyProps: { SpecificContractModalBody: OtherContractModalBody, },// additional props for ProjectSelectorModalBody
                modalTitle: "Nowa umowa zewnętrzna",
                repository: contractsRepository,
                makeValidationSchema: otherContractValidationSchema
            }}
            buttonProps={{
                buttonCaption: "Rejestruj umowę zewnętrzną",
            }}
        />
    );
}