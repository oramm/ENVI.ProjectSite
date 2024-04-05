import React from "react";
import { ApplicationCallData } from "../../../../../Typings/bussinesTypes";
import { GeneralAddNewModalButton, GeneralEditModalButton } from "../../../../View/Modals/GeneralModalButtons";
import { SpecificAddNewModalButtonProps, SpecificEditModalButtonProps } from "../../../../View/Modals/ModalsTypes";
import { ApplicationCallModalBody } from "./ApplicationCallModalBody";
import { makeApplicationCallValidationSchema } from "../ApplicationCallValidationSchema";
import { applicationCallsRepository } from "../ApplicationCallsController";

export function ApplicationCallEditModalButton({
    modalProps: { onEdit, initialData },
}: SpecificEditModalButtonProps<ApplicationCallData>) {
    return (
        <GeneralEditModalButton<ApplicationCallData>
            modalProps={{
                onEdit: onEdit,
                ModalBodyComponent: ApplicationCallModalBody,
                modalTitle: "Edycja naboru",
                repository: applicationCallsRepository,
                initialData: initialData,
                makeValidationSchema: makeApplicationCallValidationSchema,
            }}
            buttonProps={{
                buttonVariant: "outline-success",
            }}
        />
    );
}

export function ApplicationCallAddNewModalButton({
    modalProps: { onAddNew },
}: SpecificAddNewModalButtonProps<ApplicationCallData>) {
    return (
        <GeneralAddNewModalButton<ApplicationCallData>
            modalProps={{
                onAddNew: onAddNew,
                ModalBodyComponent: ApplicationCallModalBody,
                modalTitle: "Dodaj nabór",
                repository: applicationCallsRepository,
                makeValidationSchema: makeApplicationCallValidationSchema,
            }}
            buttonProps={{
                buttonCaption: "Dodaj nabór",
                buttonVariant: "outline-success",
            }}
        />
    );
}
