import React from 'react';
import { OtherContract, OurContract } from '../../../../Typings/bussinesTypes';
import { GeneralAddNewModalButton, GeneralDeleteModalButton, GeneralEditModalButton } from '../../../View/Modals/GeneralModalButtons';
import { SpecificAddNewModalButtonProps, SpecificDeleteModalButtonProps, SpecificEditModalButtonProps } from "../../../View/Modals/ModalsTypes";
import { contractsRepository } from '../ContractsController';
import { ProjectSelectorModalBody } from './ContractModalBody';
import { otherContractValidationSchema, ourContractValidationSchema } from './ContractValidationSchema';
import { OtherContractModalBody } from './OtherContractModalBody';
import { OurContractModalBody } from './OurContractModalBody';


/** przycisk i modal edycji OurCOntract lub OtherContract */
export function ContractEditModalButton({
    modalProps: { onEdit, initialData },
    buttonProps,
}: SpecificEditModalButtonProps<OurContract | OtherContract>) {
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
    buttonProps
}: SpecificEditModalButtonProps<OurContract | OtherContract>) {
    return (
        <GeneralEditModalButton<OurContract | OtherContract>
            modalProps={{
                onEdit: onEdit,
                ModalBodyComponent: OurContractModalBody,
                modalTitle: "Edycja umowy",
                repository: contractsRepository,
                initialData: initialData,
                makeValidationSchema: ourContractValidationSchema
            }}
            buttonProps={{
                ...buttonProps,
                buttonVariant: "outline-success",
            }}
        />
    );
}

export function OurContractAddNewModalButton({
    modalProps: { onAddNew },
    buttonProps
}: SpecificAddNewModalButtonProps<OurContract | OtherContract>) {
    return (
        <GeneralAddNewModalButton<OurContract | OtherContract>
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
                ...buttonProps,
            }}
        />
    );
}

export function OtherContractEditModalButton({
    modalProps: { onEdit, initialData },
    buttonProps,
}: SpecificEditModalButtonProps<OurContract | OtherContract>) {
    return (
        <GeneralEditModalButton<OurContract | OtherContract>
            modalProps={{
                onEdit: onEdit,
                ModalBodyComponent: OtherContractModalBody,
                modalTitle: "Edycja umowy",
                repository: contractsRepository,
                initialData: initialData,
                makeValidationSchema: otherContractValidationSchema
            }}
            buttonProps={{ ...buttonProps }}
        />
    );
}

export function OtherContractAddNewModalButton({
    modalProps: { onAddNew },
}: SpecificAddNewModalButtonProps<OurContract | OtherContract>) {
    return (
        <GeneralAddNewModalButton<OurContract | OtherContract>
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