import React, { useEffect, useRef, useState } from 'react';
import { GeneralDeleteModalButton, GeneralDeleteModalButtonProps, GeneralEditModalButtonProps, ModalBodyProps, SpecificAddNewModalButtonProps, SpecificDeleteModalButtonProps, SpecificEditModalButtonProps } from '../../../View/GeneralModal';
import { ContractTypeSelectFormElement, MyAsyncTypeahead, PersonSelectFormElement, ProjectSelector, ValueInPLNInput } from '../../../View/Resultsets/CommonComponents';
import { Form } from 'react-bootstrap';
import { OurContractEditModalButton, OurContractModalBody } from './OurContractModalBody';
import { OtherContractEditModalButton, OtherContractModalBody } from './OtherContractModalBody';
import { contractsRepository, entitiesRepository, projectsRepository } from '../ContractsSearch';
import MainSetup from '../../../React/MainSetupReact';
import { useFormContext } from '../../../View/FormContext';
import * as yup from 'yup';

const validationSchema: yup.ObjectSchema<any> = yup.object().shape({
    // definicja schematu walidacji
});

export function ContractModalBody({ isEditing, initialData }: ModalBodyProps) {

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
let initialData: any = null;
export function ProjectSelectorModalBody({
    isEditing,
    additionalProps,
}: ProjectSelectorProps) {
    const { register, setValue, watch, formState, control } = useFormContext();

    useEffect(() => {
        setValue('value', initialData?.value || 0, { shouldValidate: true });

    }, [initialData, setValue]);
    return (
        <>
            <ValueInPLNInput />
        </>

    );
};

/** przycisk i modal edycji OurCOntract lub OtherContract */
export function ContractEditModalButton({
    modalProps: { onEdit, initialData },
    buttonProps,
    isOurContract,
}: SpecificEditModalButtonProps & { isOurContract: boolean }) {

    return (
        isOurContract
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