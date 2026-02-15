import React from "react";
import { ContractMeetingNoteData } from "../../../../../../Typings/bussinesTypes";
import { SpecificAddNewModalButtonProps } from "../../../../../View/Modals/ModalsTypes";
import { GeneralAddNewModalButton } from "../../../../../View/Modals/GeneralModalButtons";
import { MeetingNoteModalBody } from "./MeetingNoteModalBody";
import { meetingNotesRepository } from "../../../ContractsController";
import { makeMeetingNoteValidationSchema } from "./MeetingNoteValidationSchema";
import { useContractDetails } from "../../ContractDetailsContext";

export function MeetingNoteAddNewModalButton({
    modalProps: { onAddNew },
}: SpecificAddNewModalButtonProps<ContractMeetingNoteData>) {
    const { contract } = useContractDetails();

    return (
        <GeneralAddNewModalButton<ContractMeetingNoteData>
            modalProps={{
                onAddNew: onAddNew,
                ModalBodyComponent: MeetingNoteModalBody,
                modalTitle: "Dodaj notatkę ze spotkania",
                repository: meetingNotesRepository,
                makeValidationSchema: makeMeetingNoteValidationSchema,
                contextData: contract?.id,
            }}
            buttonProps={{
                buttonCaption: "Dodaj notatkę",
                buttonVariant: "outline-success",
            }}
        />
    );
}
