import React from 'react';
import { MeetingArrangementData } from '../../../../../../Typings/bussinesTypes';
import { SpecificAddNewModalButtonProps, SpecificEditModalButtonProps } from '../../../../../View/Modals/ModalsTypes';
import { GeneralAddNewModalButton, GeneralEditModalButton } from '../../../../../View/Modals/GeneralModalButtons';
import { meetingArrangementsRepository } from '../../../ContractsController';
import { MeetingArrangementModalBody } from './MeetingArrangementModalBody';
import { makeMeetingArrangementValidationSchema } from './MeetingArrangementValidationSchema';

export function MeetingArrangementEditModalButton({
    modalProps: { onEdit, initialData },
    buttonProps,
}: SpecificEditModalButtonProps<MeetingArrangementData>) {
    return (
        <GeneralEditModalButton<MeetingArrangementData>
            modalProps={{
                onEdit,
                ModalBodyComponent: MeetingArrangementModalBody,
                modalTitle: 'Edycja punktu agendy',
                repository: meetingArrangementsRepository,
                initialData,
                makeValidationSchema: makeMeetingArrangementValidationSchema,
            }}
            buttonProps={{ ...buttonProps, buttonVariant: 'outline-success' }}
        />
    );
}

export function MeetingArrangementAddNewModalButton({
    modalProps: { onAddNew },
    contextData,
}: SpecificAddNewModalButtonProps<MeetingArrangementData> & { contextData?: number }) {
    return (
        <GeneralAddNewModalButton<MeetingArrangementData>
            modalProps={{
                onAddNew,
                ModalBodyComponent: MeetingArrangementModalBody,
                modalTitle: 'Dodaj punkt agendy',
                repository: meetingArrangementsRepository,
                makeValidationSchema: makeMeetingArrangementValidationSchema,
                contextData,
            }}
            buttonProps={{
                buttonCaption: 'Dodaj punkt agendy',
                buttonVariant: 'outline-success',
            }}
        />
    );
}
