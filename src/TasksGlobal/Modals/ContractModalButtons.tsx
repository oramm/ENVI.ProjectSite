import React, { useEffect } from 'react';
import { SpecificAddNewModalButtonProps, SpecificEditModalButtonProps } from '../../View/Modals/ModalsTypes';
import { OtherContract, OurContract, Project } from '../../../Typings/bussinesTypes';
import { ContractEditModalButtonGeneric, OtherContractAddNewModalButtonGeneric, OurContractAddNewModalButtonGeneric } from '../../Contracts/ContractsList/Modals/ContractModalButtons';
import { contractsRepository } from '../TasksGlobalController';


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