import React from "react";
import { FocusAreaData } from "../../../../Typings/bussinesTypes";
import { GeneralAddNewModalButton, GeneralEditModalButton } from "../../../View/Modals/GeneralModalButtons";
import { SpecificAddNewModalButtonProps, SpecificEditModalButtonProps } from "../../../View/Modals/ModalsTypes";
import { FocusAreaModalBody } from "./FocusAreaModalBody";
import { makeFocusAreaValidationSchema } from "../FocusAreaValidationSchema";
import { focusAreasRepository } from "../FocusAreasController";

export function FocusAreaEditModalButton({
    modalProps: { onEdit, initialData },
}: SpecificEditModalButtonProps<FocusAreaData>) {
    return (
        <GeneralEditModalButton<FocusAreaData>
            modalProps={{
                onEdit: onEdit,
                ModalBodyComponent: FocusAreaModalBody,
                modalTitle: "Edycja obszaru interwencji",
                repository: focusAreasRepository,
                initialData: initialData,
                makeValidationSchema: makeFocusAreaValidationSchema,
            }}
            buttonProps={{
                buttonVariant: "outline-success",
            }}
        />
    );
}

export function FocusAreaAddNewModalButton({
    modalProps: { onAddNew },
}: SpecificAddNewModalButtonProps<FocusAreaData>) {
    return (
        <GeneralAddNewModalButton<FocusAreaData>
            modalProps={{
                onAddNew: onAddNew,
                ModalBodyComponent: FocusAreaModalBody,
                modalTitle: "Dodaj obszar interwencji",
                repository: focusAreasRepository,
                makeValidationSchema: makeFocusAreaValidationSchema,
            }}
            buttonProps={{
                buttonCaption: "Dodaj obszar",
                buttonVariant: "outline-success",
            }}
        />
    );
}
