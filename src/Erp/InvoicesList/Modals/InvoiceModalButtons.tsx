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
import { Button } from "react-bootstrap";
import MainSetup from "../../../React/MainSetupReact";
import { InvoiceIssueModalBody } from "./InvoiceIssueModalBody";
import { InvoiceSetAsSentModalBody } from "./InvoiceSetAsSentModalBody";
import { invoicesRepository } from "../InvoicesController";

/** przycisk i modal edycji Invoice */
export function InvoiceEditModalButton({
    modalProps: { onEdit, initialData },
    buttonProps,
}: SpecificEditModalButtonProps<Invoice>) {
    return (
        <GeneralEditModalButton<Invoice>
            modalProps={{
                onEdit: onEdit,
                ModalBodyComponent: InvoiceModalBody,
                modalTitle: "Edycja faktury",
                repository: invoicesRepository,
                initialData: initialData,
                makeValidationSchema: makeInvoiceValidationSchema,
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

export function CopyButton({ onError }: { onError: (error: Error) => void }) {
    const { invoice } = useInvoice();

    async function handleClick() {
        try {
            await invoicesRepository.copyItem(invoice);
        } catch (error) {
            if (error instanceof Error) {
                onError(error);
            }
        }
    }

    return (
        <Button key="Kopiuj" variant="outline-secondary" size="sm" onClick={handleClick}>
            Kopiuj
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
                modalTitle: "Ustaw jako Wysłana",
                repository: invoicesRepository,
                initialData: invoice,
                makeValidationSchema: makeInvoiceSetAsSentValidationSchema,
            }}
            buttonProps={{
                buttonCaption: "Ustaw jako 'Wysłana'",
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
            return <InvoiceSetAsSentModalButton />;
        case MainSetup.InvoiceStatuses.SENT:
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
