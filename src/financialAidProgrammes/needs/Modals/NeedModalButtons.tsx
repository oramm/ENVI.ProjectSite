import React from "react";
import { NeedData } from "../../../../Typings/bussinesTypes";
import { GeneralAddNewModalButton, GeneralEditModalButton } from "../../../View/Modals/GeneralModalButtons";
import { SpecificAddNewModalButtonProps, SpecificEditModalButtonProps } from "../../../View/Modals/ModalsTypes";
import { NeedModalBody } from "./NeedModalBody";
import { makeNeedValidationSchema } from "../NeedValidationSchema";
import { needsRepository } from "../../FinancialAidProgrammesController";

export function NeedEditModalButton({
    modalProps: { onEdit, initialData, shouldRetrieveDataBeforeEdit },
}: SpecificEditModalButtonProps<NeedData>) {
    return (
        <GeneralEditModalButton<NeedData>
            modalProps={{
                onEdit: onEdit,
                ModalBodyComponent: NeedModalBody,
                modalTitle: "Edycja potrzeby",
                repository: needsRepository,
                initialData: initialData,
                makeValidationSchema: makeNeedValidationSchema,
                shouldRetrieveDataBeforeEdit,
                // NeedModalBody używa InlineCreateDrawer — modal musi puścić focus do panelu
                enforceFocus: false,
            }}
            buttonProps={{
                buttonVariant: "outline-success",
            }}
        />
    );
}

export function NeedAddNewModalButton({ modalProps: { onAddNew } }: SpecificAddNewModalButtonProps<NeedData>) {
    return (
        <GeneralAddNewModalButton<NeedData>
            modalProps={{
                onAddNew: onAddNew,
                ModalBodyComponent: NeedModalBody,
                modalTitle: "Dodaj potrzebę",
                repository: needsRepository,
                makeValidationSchema: makeNeedValidationSchema,
                // NeedModalBody używa InlineCreateDrawer — modal musi puścić focus do panelu
                enforceFocus: false,
            }}
            buttonProps={{
                buttonCaption: "Dodaj potrzebę",
                buttonVariant: "outline-success",
            }}
        />
    );
}
