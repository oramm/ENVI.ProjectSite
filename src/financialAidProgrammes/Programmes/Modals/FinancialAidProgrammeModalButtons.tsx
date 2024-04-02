import React from "react";
import { FinancialAidProgrammeData } from "../../../../Typings/bussinesTypes";
import { GeneralAddNewModalButton, GeneralEditModalButton } from "../../../View/Modals/GeneralModalButtons";
import { SpecificAddNewModalButtonProps, SpecificEditModalButtonProps } from "../../../View/Modals/ModalsTypes";
import { FinancialAidProgrammeModalBody } from "./FinancialAidProgrammeModalBody";
import { financialAidProgrammesRepository } from "../../FinancialAidProgrammesController";
import { makeFinancialAidProgrammeValidationSchema } from "../FinancialAidProgrammeValidationSchema";

export function FinancialAidProgrammeEditModalButton({
    modalProps: { onEdit, initialData },
}: SpecificEditModalButtonProps<FinancialAidProgrammeData>) {
    return (
        <GeneralEditModalButton<FinancialAidProgrammeData>
            modalProps={{
                onEdit: onEdit,
                ModalBodyComponent: FinancialAidProgrammeModalBody,
                modalTitle: "Edycja programu dotacji",
                repository: financialAidProgrammesRepository,
                initialData: initialData,
                makeValidationSchema: makeFinancialAidProgrammeValidationSchema,
            }}
            buttonProps={{
                buttonVariant: "outline-success",
            }}
        />
    );
}

export function FinancialAidProgrammeAddNewModalButton({
    modalProps: { onAddNew },
}: SpecificAddNewModalButtonProps<FinancialAidProgrammeData>) {
    return (
        <GeneralAddNewModalButton<FinancialAidProgrammeData>
            modalProps={{
                onAddNew: onAddNew,
                ModalBodyComponent: FinancialAidProgrammeModalBody,
                modalTitle: "Dodaj program dotacji",
                repository: financialAidProgrammesRepository,
                makeValidationSchema: makeFinancialAidProgrammeValidationSchema,
            }}
            buttonProps={{
                buttonCaption: "Dodaj program",
                buttonVariant: "outline-success",
            }}
        />
    );
}
