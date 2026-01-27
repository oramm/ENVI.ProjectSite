import React from "react";
import { GeneralEditModalButton } from "../../../View/Modals/GeneralModalButtons";
import { SpecificEditModalButtonProps } from "../../../View/Modals/ModalsTypes";
import { CostInvoiceModalBody } from "./CostInvoiceModalBody";
import { makeCostInvoiceValidationSchema } from "./CostInvoiceValidationSchema";
import { CostInvoice } from "../../../../Typings/bussinesTypes";
import RepositoryReact from "../../../React/RepositoryReact";

/**
 * Przycisk i modal edycji faktury kosztowej
 */
export function CostInvoiceEditModalButton({
    modalProps: { onEdit, initialData, shouldRetrieveDataBeforeEdit, repository },
    buttonProps,
}: SpecificEditModalButtonProps<CostInvoice>) {
    return (
        <GeneralEditModalButton<CostInvoice>
            modalProps={{
                onEdit: onEdit,
                ModalBodyComponent: CostInvoiceModalBody,
                modalTitle: "Edycja faktury kosztowej",
                repository: repository as RepositoryReact<CostInvoice>,
                initialData: initialData,
                makeValidationSchema: makeCostInvoiceValidationSchema,
                shouldRetrieveDataBeforeEdit,
            }}
            buttonProps={{
                ...buttonProps,
                buttonVariant: "outline-success",
            }}
        />
    );
}
