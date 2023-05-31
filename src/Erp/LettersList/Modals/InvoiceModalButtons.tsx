import React, { useEffect } from 'react';
import { GeneralAddNewModalButton, GeneralEditModalButton } from '../../../View/Modals/GeneralModalButtons';
import { SpecificAddNewModalButtonProps, SpecificEditModalButtonProps } from "../../../View/Modals/ModalsTypes";
import { InvoiceModalBody, ProjectSelectorModalBody } from './InvoiceModalBody';
import { ourLetterValidationSchema } from './InvoiceValidationSchema';
import { invoicesRepository } from '../InvoicesSearch';
import { Invoice } from '../../../../Typings/bussinesTypes';


/** przycisk i modal edycji Invoice */
export function InvoiceEditModalButton({
    modalProps: { onEdit, initialData, },
}: SpecificEditModalButtonProps<Invoice>) {
    return (
        <GeneralEditModalButton<Invoice>
            modalProps={{
                onEdit: onEdit,
                ModalBodyComponent: InvoiceModalBody,
                modalTitle: "Edycja faktury",
                repository: invoicesRepository,
                initialData: initialData,
                makeValidationSchema: ourLetterValidationSchema
            }}
            buttonProps={{
                buttonVariant: "outline-success",
            }}
        />
    );
}

export function InvoiceAddNewModalButton({
    modalProps: { onAddNew },
}: SpecificAddNewModalButtonProps<Invoice>) {
    return (
        <GeneralAddNewModalButton<Invoice>
            modalProps={{
                onAddNew: onAddNew,
                ModalBodyComponent: ProjectSelectorModalBody,
                additionalModalBodyProps: { SpecificLetterModalBody: InvoiceModalBody },
                modalTitle: "Rejestruj fakturę",
                repository: invoicesRepository,
                makeValidationSchema: ourLetterValidationSchema
            }}
            buttonProps={{
                buttonCaption: "Rejestruj fakturę",
                buttonVariant: "outline-success",
            }}
        />
    );
}