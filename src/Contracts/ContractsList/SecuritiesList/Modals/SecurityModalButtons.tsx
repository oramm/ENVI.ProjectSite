import React from "react";
import { Security } from "../../../../../Typings/bussinesTypes";
import { GeneralAddNewModalButton, GeneralEditModalButton } from "../../../../View/Modals/GeneralModalButtons";
import { SpecificAddNewModalButtonProps, SpecificEditModalButtonProps } from "../../../../View/Modals/ModalsTypes";
import { securitiesRepository } from "../../ContractsController";
import { SecurityCashModalBody } from "./SecurityCashModalBody";
import { SecurityGuaranteeModalBody } from "./SecurityGuaranteeModalBody";
import { ProjectSelectorModalBody } from "./SecurityModalBody";
import { securityCashValidationSchema, securityGuaranteeValidationSchema } from "./SecurityValidationSchema";

/** przycisk i modal edycji SecurityCash */
export function SecurityEditModalButtonGeneric({
    modalProps: { onEdit, initialData, repository },
    buttonProps,
}: SpecificEditModalButtonProps<Security>) {
    if (!repository) throw new Error("repository is required");
    return initialData.isCash ? (
        <GeneralEditModalButton<Security>
            modalProps={{
                onEdit: onEdit,
                ModalBodyComponent: SecurityCashModalBody,
                modalTitle: "Edycja ZNWU",
                repository: repository,
                initialData: initialData,
                makeValidationSchema: securityCashValidationSchema,
            }}
            buttonProps={{
                ...buttonProps,
                buttonVariant: "outline-success",
            }}
        />
    ) : (
        <GeneralEditModalButton<Security>
            modalProps={{
                onEdit: onEdit,
                ModalBodyComponent: SecurityGuaranteeModalBody,
                modalTitle: "Edycja ZNWU",
                repository: repository,
                initialData: initialData,
                makeValidationSchema: securityGuaranteeValidationSchema,
            }}
            buttonProps={{ ...buttonProps }}
        />
    );
}

export function SecurityEditModalButton({
    modalProps: { onEdit, initialData },
    buttonProps,
}: SpecificEditModalButtonProps<Security>) {
    return (
        <SecurityEditModalButtonGeneric
            modalProps={{
                onEdit,
                initialData,
                repository: securitiesRepository,
            }}
            buttonProps={buttonProps}
        />
    );
}

export function SecurityCashAddNewModalButtonGeneric({
    modalProps: { onAddNew, repository },
    buttonProps,
}: SpecificAddNewModalButtonProps<Security>) {
    if (!repository) throw new Error("repository is required");

    return (
        <GeneralAddNewModalButton<Security>
            modalProps={{
                onAddNew: onAddNew,
                ModalBodyComponent: ProjectSelectorModalBody,
                additionalModalBodyProps: { SpecificContractModalBody: SecurityCashModalBody },
                modalTitle: "Nowe ZNWU - gotówka",
                repository: repository,
                makeValidationSchema: securityCashValidationSchema,
            }}
            buttonProps={{
                buttonCaption: "Dodaj ZNWU - gotówka",
                buttonVariant: "outline-success",
                ...buttonProps,
            }}
        />
    );
}

export function SecurityCashAddNewModalButton({
    modalProps: { onAddNew },
    buttonProps,
}: SpecificAddNewModalButtonProps<Security>) {
    return (
        <SecurityCashAddNewModalButtonGeneric
            modalProps={{
                onAddNew,
                repository: securitiesRepository,
            }}
            buttonProps={buttonProps}
        />
    );
}

export function SecurityGuaranteeAddNewModalButtonGeneric({
    modalProps: { onAddNew, repository },
}: SpecificAddNewModalButtonProps<Security>) {
    if (!repository) throw new Error("repository is required");
    return (
        <GeneralAddNewModalButton<Security>
            modalProps={{
                onAddNew: onAddNew,
                ModalBodyComponent: ProjectSelectorModalBody,
                additionalModalBodyProps: { SpecificContractModalBody: SecurityGuaranteeModalBody }, // additional props for ProjectSelectorModalBody
                modalTitle: "Nowa gwarancja ZNWU",
                repository: repository,
                makeValidationSchema: securityGuaranteeValidationSchema,
            }}
            buttonProps={{
                buttonCaption: "Dodaj ZNWU",
            }}
        />
    );
}

export function SecurityGuaranteeAddNewModalButton({
    modalProps: { onAddNew },
    buttonProps,
}: SpecificAddNewModalButtonProps<Security>) {
    return (
        <SecurityGuaranteeAddNewModalButtonGeneric
            modalProps={{
                onAddNew,
                repository: securitiesRepository,
            }}
            buttonProps={buttonProps}
        />
    );
}
