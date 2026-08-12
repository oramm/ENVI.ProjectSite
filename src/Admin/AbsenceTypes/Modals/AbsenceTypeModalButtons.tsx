import React from "react";
import { AbsenceTypeData } from "../../../../Typings/bussinesTypes";
import { GeneralAddNewModalButton, GeneralEditModalButton } from "../../../View/Modals/GeneralModalButtons";
import { SpecificAddNewModalButtonProps, SpecificEditModalButtonProps } from "../../../View/Modals/ModalsTypes";
import { absenceTypesRepository } from "../AbsenceTypesController";
import { AbsenceTypeModalBody } from "./AbsenceTypeModalBody";
import { makeAbsenceTypeValidationSchema } from "./AbsenceTypeValidationSchema";

export function AbsenceTypeEditModalButton({
    modalProps: { onEdit, initialData },
}: SpecificEditModalButtonProps<AbsenceTypeData>) {
    return (
        <GeneralEditModalButton<AbsenceTypeData>
            modalProps={{
                onEdit: onEdit,
                ModalBodyComponent: AbsenceTypeModalBody,
                modalTitle: "Edycja typu nieobecności",
                repository: absenceTypesRepository,
                initialData: initialData,
                makeValidationSchema: makeAbsenceTypeValidationSchema,
            }}
            buttonProps={{
                buttonVariant: "outline-success",
            }}
        />
    );
}

export function AbsenceTypeAddNewModalButton({
    modalProps: { onAddNew },
}: SpecificAddNewModalButtonProps<AbsenceTypeData>) {
    return (
        <GeneralAddNewModalButton<AbsenceTypeData>
            modalProps={{
                onAddNew: onAddNew,
                ModalBodyComponent: AbsenceTypeModalBody,
                modalTitle: "Dodaj typ nieobecności",
                repository: absenceTypesRepository,
                makeValidationSchema: makeAbsenceTypeValidationSchema,
            }}
            buttonProps={{
                buttonCaption: "Dodaj typ",
                buttonVariant: "outline-success",
            }}
        />
    );
}
