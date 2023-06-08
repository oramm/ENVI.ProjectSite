import React, { useEffect } from 'react';
import { GeneralAddNewModalButton, GeneralEditModalButton } from '../../../View/Modals/GeneralModalButtons';
import { SpecificAddNewModalButtonProps, SpecificEditModalButtonProps } from "../../../View/Modals/ModalsTypes";
import { InvoiceModalBody } from './InvoiceModalBody';
import { makeInvoiceIssueValidationSchema, makeInvoiceSetAsSentValidationSchema, makeInvoiceValidationSchema } from './InvoiceValidationSchema';
import { invoicesRepository } from '../InvoicesSearch';
import { Invoice } from '../../../../Typings/bussinesTypes';
import { useInvoice } from '../InvoiceDetails/InvoiceDetails';
import { Button } from 'react-bootstrap';
import MainSetup from '../../../React/MainSetupReact';
import { InvoiceIssueModalBody } from './InvoiceIssueModalBody';
import { InvoiceSetAsSentModalBody } from './InvoiceSetAsSentModalBody';


/** przycisk i modal edycji Invoice */
export function InvoiceEditModalButton({
    modalProps: { onEdit, initialData, },
    buttonProps
}: SpecificEditModalButtonProps<Invoice>) {
    return (
        <GeneralEditModalButton<Invoice>
            modalProps={{
                onEdit: onEdit,
                ModalBodyComponent: InvoiceModalBody,
                modalTitle: "Edycja faktury",
                repository: invoicesRepository,
                initialData: initialData,
                makeValidationSchema: makeInvoiceValidationSchema
            }}
            buttonProps={{
                ...buttonProps,
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
                ModalBodyComponent: InvoiceModalBody,
                modalTitle: "Rejestruj fakturę",
                repository: invoicesRepository,
                makeValidationSchema: makeInvoiceValidationSchema
            }}
            buttonProps={{
                buttonCaption: "Rejestruj fakturę",
                buttonVariant: "outline-success",
            }}
        />
    );
}

export function ChangeStatusButton({ specialActionRoute, newStatus }: { specialActionRoute: string, newStatus: string }) {
    const { invoice, setInvoice } = useInvoice();

    async function handleChangeStatus() {
        const editedInvoice = await invoicesRepository.editItemNodeJS(invoice, specialActionRoute);
        setInvoice(editedInvoice);
    }

    return (
        <Button
            key={`Ustaw jako ${newStatus}`}
            variant='primary'
            size='sm'
            onClick={handleChangeStatus}
        >
            {`Ustaw jako ${newStatus}`}
        </Button>);
}

export function InvoiceIssueModalButton() {
    const { invoice, setInvoice } = useInvoice();

    return (
        <GeneralEditModalButton<Invoice>
            modalProps={{
                onEdit: setInvoice,
                specialActionRoute: 'issueInvoice',
                ModalBodyComponent: InvoiceIssueModalBody,
                modalTitle: "Wystaw fakturę",
                repository: invoicesRepository,
                initialData: invoice,
                makeValidationSchema: makeInvoiceIssueValidationSchema
            }}
            buttonProps={{
                buttonCaption: "Wystaw fakturę",
                buttonVariant: "primary"
            }}
        />
    );
}

export function InvoiceSetAsSentModalButton() {
    const { invoice, setInvoice } = useInvoice();

    return (
        <GeneralEditModalButton<Invoice>
            modalProps={{
                onEdit: setInvoice,
                specialActionRoute: 'setAsSentInvoice',
                ModalBodyComponent: InvoiceSetAsSentModalBody,
                modalTitle: "Ustaw jako Wysłana",
                repository: invoicesRepository,
                initialData: invoice,
                makeValidationSchema: makeInvoiceSetAsSentValidationSchema
            }}
            buttonProps={{
                buttonCaption: "Ustaw jako 'Wysłana'",
                buttonVariant: "primary"
            }}
        />
    );
}

export function ActionButton() {
    const { invoice, setInvoice } = useInvoice();

    switch (invoice.status) {
        case MainSetup.invoiceStatusNames[0]: //'Na później'
            return (
                <ChangeStatusButton
                    specialActionRoute='setAsToMakeInvoice'
                    newStatus={MainSetup.invoiceStatusNames[1]}
                />
            );
        case MainSetup.invoiceStatusNames[1]: //'Do zrobienia'
            return <InvoiceIssueModalButton />;
        case MainSetup.invoiceStatusNames[2]: //'Zrobiona'
            return <InvoiceSetAsSentModalButton />;
        case MainSetup.invoiceStatusNames[3]: //'Wysłana'
            return (
                <ChangeStatusButton
                    specialActionRoute='setAsPaidInvoice'
                    newStatus={MainSetup.invoiceStatusNames[4]}
                />
            );
        case MainSetup.invoiceStatusNames[4]: //'Zapłacona'

        case MainSetup.invoiceStatusNames[5]: //'Do korekty'
        case MainSetup.invoiceStatusNames[6]: //'Wycofana'
        default:
            return <></>
    }
}