import React, { useEffect } from "react";
import { GeneralAddNewModalButton, GeneralEditModalButton } from "../../../View/Modals/GeneralModalButtons";
import { SpecificAddNewModalButtonProps, SpecificEditModalButtonProps } from "../../../View/Modals/ModalsTypes";
import { InvoiceModalBody } from "./InvoiceModalBody";
import {
    makeInvoiceIssueValidationSchema,
    makeInvoiceSetAsSentValidationSchema,
    makeInvoiceValidationSchema,
} from "./InvoiceValidationSchema";
import { Invoice } from "../../../../Typings/bussinesTypes";
import { useInvoice } from "../InvoiceDetails/InvoiceDetails";
import { Button, Spinner } from "react-bootstrap";
import MainSetup from "../../../React/MainSetupReact";
import { InvoiceIssueModalBody } from "./InvoiceIssueModalBody";
import { InvoiceSetAsSentModalBody } from "./InvoiceSetAsSentModalBody";
import { invoicesRepository } from "../InvoicesController";
import RepositoryReact from "../../../React/RepositoryReact";

/** przycisk i modal edycji Invoice */
export function InvoiceEditModalButton({
    modalProps: { onEdit, initialData, shouldRetrieveDataBeforeEdit, repository },
    buttonProps,
}: SpecificEditModalButtonProps<Invoice>) {
    return (
        <GeneralEditModalButton<Invoice>
            modalProps={{
                onEdit: onEdit,
                ModalBodyComponent: InvoiceModalBody,
                modalTitle: "Edycja faktury",
                repository: repository as RepositoryReact<Invoice>,
                initialData: initialData,
                makeValidationSchema: makeInvoiceValidationSchema,
                shouldRetrieveDataBeforeEdit,
            }}
            buttonProps={{
                ...buttonProps,
                buttonVariant: "outline-success",
            }}
        />
    );
}

export function InvoiceAddNewModalButton({
    modalProps: { onAddNew, contextData },
}: SpecificAddNewModalButtonProps<Invoice>) {
    return (
        <GeneralAddNewModalButton<Invoice>
            modalProps={{
                onAddNew: onAddNew,
                ModalBodyComponent: InvoiceModalBody,
                modalTitle: "Rejestruj fakturę",
                repository: invoicesRepository,
                makeValidationSchema: makeInvoiceValidationSchema,
                contextData,
            }}
            buttonProps={{
                buttonCaption: "Rejestruj fakturę",
                buttonVariant: "outline-success",
            }}
        />
    );
}

export function CopyButton({
    onError,
    invoice: passedInvoice,
}: {
    onError: (error: Error) => void;
    invoice?: Invoice;
}) {
    const [requestPending, setRequestPending] = React.useState(false);

    // Spróbuj uzyskać fakturę z kontekstu, ale nie rzucaj błędem jeśli nie jest dostępna
    let contextInvoice: Invoice | null = null;
    try {
        const invoiceContext = useInvoice();
        contextInvoice = invoiceContext.invoice;
    } catch {
        // Hook nie jest dostępny w tym kontekście
    }
    const invoice = passedInvoice || contextInvoice;

    if (!invoice) {
        console.error("CopyButton: Brak faktury do skopiowania");
        return null;
    }

    async function handleClick() {
        try {
            setRequestPending(true);
            // Usuń pola KSeF przed kopiowaniem
            const invoiceToCopy = {
                ...invoice,
                ksefNumber: null,
                ksefStatus: null,
                ksefSessionId: null,
                ksefUpo: null,
                originalKsefNumber: null,
                correctedInvoiceId: null,
                correctionReason: null,
            };
            await invoicesRepository.copyItem(invoiceToCopy);
            setRequestPending(false);
        } catch (error) {
            if (error instanceof Error) {
                onError(error);
            }
        }
    }

    return (
        <Button key="Kopiuj" variant="outline-secondary" size="sm" onClick={handleClick}>
            <span className="d-inline-flex align-items-center">
                Kopiuj
                {requestPending && (
                    <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" className="ms-2" />
                )}
            </span>
        </Button>
    );
}

export function ChangeStatusButton({
    specialActionRoute,
    newStatus,
}: {
    specialActionRoute: string;
    newStatus: string;
}) {
    const { invoice, setInvoice } = useInvoice();

    async function handleChangeStatus() {
        const editedInvoice = await invoicesRepository.editItem(invoice, specialActionRoute);
        setInvoice(editedInvoice);
    }

    return (
        <Button key={`Ustaw jako ${newStatus}`} variant="primary" size="sm" onClick={handleChangeStatus}>
            {`Ustaw jako ${newStatus}`}
        </Button>
    );
}

export function InvoiceIssueModalButton() {
    const { invoice, setInvoice } = useInvoice();

    return (
        <GeneralEditModalButton<Invoice>
            modalProps={{
                onEdit: setInvoice,
                specialActionRoute: "issueInvoice",
                ModalBodyComponent: InvoiceIssueModalBody,
                modalTitle: "Wystaw fakturę",
                repository: invoicesRepository,
                initialData: invoice,
                makeValidationSchema: makeInvoiceIssueValidationSchema,
            }}
            buttonProps={{
                buttonCaption: "Wystaw fakturę",
                buttonVariant: "primary",
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
                specialActionRoute: "setAsSentInvoice",
                ModalBodyComponent: InvoiceSetAsSentModalBody,
                modalTitle: "Nadaj datę wystawienia",
                repository: invoicesRepository,
                initialData: invoice,
                makeValidationSchema: makeInvoiceSetAsSentValidationSchema,
            }}
            buttonProps={{
                buttonCaption: "Nadaj datę wystawienia",
                buttonVariant: "primary",
            }}
        />
    );
}

export function ActionButton() {
    const { invoice, setInvoice } = useInvoice();

    switch (invoice.status) {
        case MainSetup.InvoiceStatuses.FOR_LATER:
            return (
                <ChangeStatusButton
                    specialActionRoute="setAsToMakeInvoice"
                    newStatus={MainSetup.InvoiceStatuses.TO_DO}
                />
            );
        case MainSetup.InvoiceStatuses.TO_DO:
            return <InvoiceIssueModalButton />;
        case MainSetup.InvoiceStatuses.DONE:
            // Zachowanie dla starych faktur w statusie "Zrobiona"
            return <InvoiceSetAsSentModalButton />;
        case MainSetup.InvoiceStatuses.SENT:
        case MainSetup.InvoiceStatuses.SENT_TO_KSEF:
            return (
                <ChangeStatusButton specialActionRoute="setAsPaidInvoice" newStatus={MainSetup.InvoiceStatuses.PAID} />
            );
        case MainSetup.InvoiceStatuses.PAID:
        case MainSetup.InvoiceStatuses.TO_CORRECT:
        case MainSetup.InvoiceStatuses.WITHDRAWN:
        default:
            return <></>;
    }
}
