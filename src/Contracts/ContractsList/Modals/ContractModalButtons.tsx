import React, { useState } from 'react';
import { OtherContract, OurContract, RepositoryDataItem } from '../../../../Typings/bussinesTypes';
import { GeneralModal } from '../../../View/Modals/GeneralModal';
import { GeneralAddNewModalButton, GeneralEditModalButton } from '../../../View/Modals/GeneralModalButtons';
import { GeneralEditModalButtonProps, SpecificAddNewModalButtonProps, SpecificDeleteModalButtonProps, SpecificEditModalButtonProps } from "../../../View/Modals/ModalsTypes";
import { contractsRepository } from '../ContractsController';
import { ProjectSelectorModalBody } from './ContractModalBody';
import { otherContractValidationSchema, ourContractValidationSchema } from './ContractValidationSchema';
import { OtherContractModalBody } from './OtherContractModalBody';
import { OurContractModalBody } from './OurContractModalBody';


/** przycisk i modal edycji OurCOntract lub OtherContract */
export function ContractEditModalButtonGeneric({
    modalProps: { onEdit, initialData, repository },
    buttonProps,
}: SpecificEditModalButtonProps<OurContract | OtherContract>) {
    if (!repository) throw new Error('repository is required');
    return (
        initialData.ourId
            ? <GeneralEditModalButton<OurContract | OtherContract>
                modalProps={{
                    onEdit: onEdit,
                    ModalBodyComponent: OurContractModalBody,
                    modalTitle: "Edycja umowy",
                    repository: repository,
                    initialData: initialData,
                    makeValidationSchema: ourContractValidationSchema
                }}
                buttonProps={{
                    ...buttonProps,
                    buttonVariant: "outline-success",
                }}
            />
            : <GeneralEditModalButton<OurContract | OtherContract>
                modalProps={{
                    onEdit: onEdit,
                    ModalBodyComponent: OtherContractModalBody,
                    modalTitle: "Edycja umowy",
                    repository: repository,
                    initialData: initialData,
                    makeValidationSchema: otherContractValidationSchema
                }}
                buttonProps={{ ...buttonProps }}
            />
    );
}

export function ContractEditModalButton({
    modalProps: { onEdit, initialData },
    buttonProps,
}: SpecificEditModalButtonProps<OurContract | OtherContract>) {
    return (
        <ContractEditModalButtonGeneric
            modalProps={{
                onEdit,
                initialData,
                repository: contractsRepository
            }}
            buttonProps={buttonProps}
        />
    );
}

export function OurContractAddNewModalButtonGeneric({
    modalProps: { onAddNew, repository },
    buttonProps
}: SpecificAddNewModalButtonProps<OurContract | OtherContract>) {
    if (!repository) throw new Error('repository is required');

    return (
        <GeneralAddNewModalButton<OurContract | OtherContract>
            modalProps={{
                onAddNew: onAddNew,
                ModalBodyComponent: ProjectSelectorModalBody,
                additionalModalBodyProps: { SpecificContractModalBody: OurContractModalBody },
                modalTitle: "Nowa umowa ENVI",
                repository: repository,
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

export function OurContractAddNewModalButton({
    modalProps: { onAddNew },
    buttonProps
}: SpecificAddNewModalButtonProps<OurContract | OtherContract>) {
    return (
        <OurContractAddNewModalButtonGeneric
            modalProps={{
                onAddNew,
                repository: contractsRepository
            }}
            buttonProps={buttonProps}
        />
    );
}

export function OtherContractAddNewModalButtonGeneric({
    modalProps: { onAddNew, repository },
}: SpecificAddNewModalButtonProps<OurContract | OtherContract>) {
    if (!repository) throw new Error('repository is required');
    return (
        <GeneralAddNewModalButton<OurContract | OtherContract>
            modalProps={{
                onAddNew: onAddNew,
                ModalBodyComponent: ProjectSelectorModalBody,
                additionalModalBodyProps: { SpecificContractModalBody: OtherContractModalBody, },// additional props for ProjectSelectorModalBody
                modalTitle: "Nowa umowa zewnętrzna",
                repository: repository,
                makeValidationSchema: otherContractValidationSchema
            }}
            buttonProps={{
                buttonCaption: "Rejestruj umowę zewnętrzną",
            }}
        />
    );
}

export function OtherContractAddNewModalButton({
    modalProps: { onAddNew },
    buttonProps
}: SpecificAddNewModalButtonProps<OurContract | OtherContract>) {
    return (
        <OtherContractAddNewModalButtonGeneric
            modalProps={{
                onAddNew,
                repository: contractsRepository
            }}
            buttonProps={buttonProps}
        />
    );
}