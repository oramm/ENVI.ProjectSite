import React, { useEffect } from 'react';
import { GeneralAddNewModalButton, GeneralEditModalButton } from '../../../View/Modals/GeneralModalButtons';
import { SpecificAddNewModalButtonProps, SpecificEditModalButtonProps } from "../../../View/Modals/ModalsTypes";
import { invoiceItemsRepository } from '../InvoicesSearch';
import { Invoice, InvoiceItem } from '../../../../Typings/bussinesTypes';
import { InvoiceItemModalBody } from './InvoiceItemModalBody';
import { InvoiceItemValidationSchema } from './InvoiceItemValidationSchema';


/** przycisk i modal edycji Invoice */
export function InvoiceItemEditModalButton({
    modalProps: { onEdit, initialData, },
}: SpecificEditModalButtonProps<InvoiceItem>) {
    return (
        <GeneralEditModalButton<InvoiceItem>
            modalProps={{
                onEdit: onEdit,
                ModalBodyComponent: InvoiceItemModalBody,
                modalTitle: "Edycja pozycji faktury",
                repository: invoiceItemsRepository,
                initialData: initialData,
                makeValidationSchema: InvoiceItemValidationSchema
            }}
            buttonProps={{
                buttonVariant: "outline-success",
            }}
        />
    );
}

export function InvoiceItemAddNewModalButton({
    modalProps: { onAddNew },
}: SpecificAddNewModalButtonProps<InvoiceItem>) {
    return (
        <GeneralAddNewModalButton<InvoiceItem>
            modalProps={{
                onAddNew: onAddNew,
                ModalBodyComponent: InvoiceItemModalBody,
                modalTitle: "Dpdaj pozycję faktury",
                repository: invoiceItemsRepository,
                makeValidationSchema: InvoiceItemValidationSchema
            }}
            buttonProps={{
                buttonCaption: "Dodaj pozycję",
                buttonVariant: "outline-success",
            }}
        />
    );
}