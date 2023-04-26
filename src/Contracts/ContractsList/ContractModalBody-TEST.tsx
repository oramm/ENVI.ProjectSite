import React, { useEffect, useRef, useState } from 'react';
import { GeneralDeleteModalButton, GeneralDeleteModalButtonProps, GeneralEditModalButtonProps, ModalBodyProps, SpecificAddNewModalButtonProps, SpecificDeleteModalButtonProps, SpecificEditModalButtonProps } from '../../View/GeneralModal';
import { ContractTypeSelectFormElement, MyAsyncTypeahead, PersonSelectFormElement, ValueInPLNInput } from '../../View/Resultsets/CommonComponents';
import { Form } from 'react-bootstrap';
import ContractsController from './ContractsController';
import { OurContractEditModalButton, OurContractModalBody } from './OurContractModalBody';
import { OtherContractEditModalButton, OtherContractModalBody } from './OtherContractModalBody';
import { contractsRepository, entitiesRepository, projectsRepository } from './ContractsSearch';
import { RepositoryDataItem } from '../../React/RepositoryReact';
import MainSetup from '../../React/MainSetupReact';
import { useFormContext } from '../../View/FormContext';

export function ContractModalBody({ isEditing, initialData, onValidationChange }: ModalBodyProps) {

    const { register, setValue, watch, formState, control } = useFormContext();

    useEffect(() => {
        setValue('_contractors', initialData?._contractors || [], { shouldValidate: true });

        setValue('_manager', initialData?.status || '', { shouldValidate: true });
        setValue('_contractType', initialData?.type || [], { shouldValidate: true });

        // Ustaw inne wartości domyślne dla pozostałych pól formularza
    }, [initialData, setValue]);


    return (
        <Form.Group>
            <Form.Label>Wykonawcy</Form.Label>
            <MyAsyncTypeahead
                name='_contractors'
                labelKey='name'
                repository={entitiesRepository}
                multiple={false}
                isRequired={true}
            />
        </Form.Group>
    );
}

type ProjectSelectorProps = ModalBodyProps & {
    SpecificContractModalBody?: React.ComponentType<ModalBodyProps>;
};
/** przełęcza widok pomiędzy wyborem projektu a formularzem kontraktu
 * SpecificContractModalBody - komponent formularza kontraktu (OurContractModalBody lub OtherContractModalBody)
 * @param additionalProps - dodatkowe propsy przekazywane do SpecificContractModalBody - ustawiane w Otjer lub OurContractModalBody
 * w tym przypadku jest additionalProps zawiera tylko parametr SpecificContractModalBody - komponent formularza kontraktu (OurContractModalBody lub OtherContractModalBody)
 * 
 */
export function ProjectSelectorModalBody({
    isEditing,
    onAdditionalFieldsKeysValuesChange,
    additionalProps,
    onValidationChange
}: ProjectSelectorProps) {
    return (
        <ContractModalBody
            isEditing={isEditing}
            additionalProps={additionalProps}
            onAdditionalFieldsKeysValuesChange={onAdditionalFieldsKeysValuesChange}
            onValidationChange={onValidationChange}
        />
    );
};

/** przycisk i modal edycji OurCOntract lub OtherContract */
export function ContractEditModalButton({
    modalProps: { onEdit, onIsReadyChange, initialData },
    buttonProps,
    isOurContract,
}: SpecificEditModalButtonProps & { isOurContract: boolean }) {

    return (
        isOurContract
            ? <OurContractEditModalButton
                modalProps={{ onEdit, onIsReadyChange, initialData }}
                buttonProps={buttonProps}
            />
            : <OtherContractEditModalButton
                modalProps={{ onEdit, onIsReadyChange, initialData }}
                buttonProps={buttonProps}
            />
    );
}

export function ContractDeleteModalButton({
    modalProps: { onDelete } }: SpecificDeleteModalButtonProps) {
    const currentContract = contractsRepository.currentItems[0];
    const modalTitle = 'Usuwanie kontraktu ' + (currentContract?.ourId || currentContract?._number || '');

    return (
        <GeneralDeleteModalButton
            modalProps={{
                onDelete,
                modalTitle,
                repository: contractsRepository,
                initialData: contractsRepository.currentItems[0],
            }}
        />
    );
}