import React from 'react';
import { MeetingData } from '../../../../../../Typings/bussinesTypes';
import { SpecificAddNewModalButtonProps, SpecificEditModalButtonProps } from '../../../../../View/Modals/ModalsTypes';
import { GeneralAddNewModalButton, GeneralEditModalButton } from '../../../../../View/Modals/GeneralModalButtons';
import { meetingsRepository } from '../../../ContractsController';
import { MeetingModalBody } from './MeetingModalBody';
import { makeMeetingValidationSchema } from './MeetingValidationSchema';
import { useContractDetails } from '../../ContractDetailsContext';

export function MeetingEditModalButton({
    modalProps: { onEdit, initialData },
    buttonProps,
}: SpecificEditModalButtonProps<MeetingData>) {
    return (
        <GeneralEditModalButton<MeetingData>
            modalProps={{
                onEdit,
                ModalBodyComponent: MeetingModalBody,
                modalTitle: 'Edycja spotkania',
                repository: meetingsRepository,
                initialData,
                makeValidationSchema: makeMeetingValidationSchema,
            }}
            buttonProps={{ ...buttonProps, buttonVariant: 'outline-success' }}
        />
    );
}

export function MeetingAddNewModalButton({
    modalProps: { onAddNew },
}: SpecificAddNewModalButtonProps<MeetingData>) {
    const { contract } = useContractDetails();

    return (
        <GeneralAddNewModalButton<MeetingData>
            modalProps={{
                onAddNew,
                ModalBodyComponent: MeetingModalBody,
                modalTitle: 'Dodaj spotkanie',
                repository: meetingsRepository,
                makeValidationSchema: makeMeetingValidationSchema,
                contextData: contract?.id,
            }}
            buttonProps={{
                buttonCaption: 'Dodaj spotkanie',
                buttonVariant: 'outline-success',
            }}
        />
    );
}
