import React from 'react';
import { ContractMeetingNoteData } from '../../../../../../Typings/bussinesTypes';
import { SpecificEditModalButtonProps } from '../../../../../View/Modals/ModalsTypes';
import { GeneralEditModalButton } from '../../../../../View/Modals/GeneralModalButtons';
import { meetingNotesRepository } from '../../../ContractsController';
import { MeetingNoteModalBody } from './MeetingNoteModalBody';
import { makeMeetingNoteValidationSchema } from './MeetingNoteValidationSchema';

export function MeetingNoteEditModalButton({
    modalProps: { onEdit, initialData },
    buttonProps,
}: SpecificEditModalButtonProps<ContractMeetingNoteData>) {
    return (
        <GeneralEditModalButton<ContractMeetingNoteData>
            modalProps={{
                onEdit,
                ModalBodyComponent: MeetingNoteModalBody,
                modalTitle: 'Edycja notatki ze spotkania',
                repository: meetingNotesRepository,
                initialData,
                makeValidationSchema: makeMeetingNoteValidationSchema,
            }}
            buttonProps={{ ...buttonProps, buttonVariant: 'outline-success' }}
        />
    );
}
