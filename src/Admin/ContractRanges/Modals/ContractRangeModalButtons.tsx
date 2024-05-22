import React, { useEffect } from "react";
import { ContractRangeData } from "../../../../Typings/bussinesTypes";
import { GeneralAddNewModalButton, GeneralEditModalButton } from "../../../View/Modals/GeneralModalButtons";
import { SpecificAddNewModalButtonProps, SpecificEditModalButtonProps } from "../../../View/Modals/ModalsTypes";
import { contractRangesRepository } from "../ContractRangesController";
import { ContractRangeModalBody } from "./ContractRangeModalBody";
import { makeContractRangeValidationSchema } from "./ContractRangeValidationSchema";

export function ContractRangeEditModalButton({
    modalProps: { onEdit, initialData },
}: SpecificEditModalButtonProps<ContractRangeData>) {
    return (
        <GeneralEditModalButton<ContractRangeData>
            modalProps={{
                onEdit: onEdit,
                ModalBodyComponent: ContractRangeModalBody,
                modalTitle: "Edycja zakresu kontraktu",
                repository: contractRangesRepository,
                initialData: initialData,
                makeValidationSchema: makeContractRangeValidationSchema,
            }}
            buttonProps={{
                buttonVariant: "outline-success",
            }}
        />
    );
}

export function ContractRangeAddNewModalButton({
    modalProps: { onAddNew },
}: SpecificAddNewModalButtonProps<ContractRangeData>) {
    return (
        <GeneralAddNewModalButton<ContractRangeData>
            modalProps={{
                onAddNew: onAddNew,
                ModalBodyComponent: ContractRangeModalBody,
                modalTitle: "Dodaj zakres kontraktu",
                repository: contractRangesRepository,
                makeValidationSchema: makeContractRangeValidationSchema,
            }}
            buttonProps={{
                buttonCaption: "Dodaj zakres kontraktu",
                buttonVariant: "outline-success",
            }}
        />
    );
}
