import React from "react";
import { MilestoneData } from "../../../../Typings/bussinesTypes";
import { GeneralAddNewModalButton, GeneralEditModalButton } from "../../../View/Modals/GeneralModalButtons";
import { SpecificAddNewModalButtonProps, SpecificEditModalButtonProps } from "../../../View/Modals/ModalsTypes";
import { milestonesRepository } from "../../TasksGlobalController";
import { ContractMilestoneModalBody } from "./MilestoneModalBody";
import { makeMilestoneValidationSchema } from "./MilestoneValidationSchema";

export function MilestoneEditModalButton({
    modalProps: { onEdit, initialData },
    buttonProps,
}: SpecificEditModalButtonProps<MilestoneData>) {
    return (
        <GeneralEditModalButton<MilestoneData>
            modalProps={{
                onEdit: onEdit,
                ModalBodyComponent: ContractMilestoneModalBody,
                modalTitle: "Edycja kamienia milowego",
                repository: milestonesRepository,
                initialData: initialData,
                makeValidationSchema: makeMilestoneValidationSchema,
            }}
            buttonProps={{
                ...buttonProps,
                buttonVariant: "outline-success",
            }}
        />
    );
}

export function MilestoneAddNewModalButton({
    modalProps: { onAddNew, contextData },
    buttonProps,
}: SpecificAddNewModalButtonProps<MilestoneData>) {
    return (
        <GeneralAddNewModalButton
            modalProps={{
                onAddNew: onAddNew,
                contextData,
                ModalBodyComponent: ContractMilestoneModalBody,
                additionalModalBodyProps: { SpecificContractModalBody: ContractMilestoneModalBody },
                modalTitle: "Nowy kamień milowy",
                repository: milestonesRepository,
                makeValidationSchema: makeMilestoneValidationSchema,
            }}
            buttonProps={{
                buttonCaption: "Dodaj kamień milowy",
                buttonVariant: "outline-success",
                ...buttonProps,
            }}
        />
    );
}
