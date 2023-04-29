import React, { useEffect, useRef, useState } from 'react';
import MainSetup from '../../React/MainSetupReact';
import { ContractTypeSelectFormElement, FileInput, PersonSelectFormElement } from '../../View/Resultsets/CommonComponents';
import { ContractModalBody, ProjectSelectorModalBody } from './ContractModalBody';
import { GeneralEditModalButton, ModalBodyProps, SpecificEditModalButtonProps, SpecificAddNewModalButtonProps, GeneralAddNewModalButton } from '../../View/GeneralModal';
import { contractsRepository, projectsRepository } from './ContractsSearch';
import { useFormContext } from '../../View/FormContext';

export function OurContractModalBody(props: ModalBodyProps) {
    const initialData = props.initialData;
    const { register, setValue, watch, formState, control } = useFormContext();

    useEffect(() => {
        setValue('_contractType', initialData?._type, { shouldValidate: true });
        setValue('_admin', initialData?._admin, { shouldValidate: true });
        setValue('_manager', initialData?._manager, { shouldValidate: true });
    }, [initialData, setValue]);

    return (
        <>
            {
                (!props.isEditing) ?
                    <ContractTypeSelectFormElement
                        typesToInclude='our'
                        required={true}
                    />
                    : null
            }
            <ContractModalBody
                {...props}
            />
            <PersonSelectFormElement
                label='Koordynator'
                name='_manager'
                repository={MainSetup.personsEnviRepository}
                required={true}
            />
            <PersonSelectFormElement
                label='Administrator'
                name='_admin'
                repository={MainSetup.personsEnviRepository}
                required={true}
            />
            <FileInput
                fieldName="exampleFile"
                acceptedFileTypes="application/msword, application/vnd.ms-excel, application/pdf"
            />
        </>
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
            }}
            buttonProps={{
                buttonCaption: "Rejestruj umowę ENVI",
                buttonVariant: "outline-success",
            }}
        />
    );
}