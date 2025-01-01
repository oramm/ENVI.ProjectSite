import React, { useEffect, useState } from "react";
import { mailInvitationsRepository, mailsToCheckRepository } from "../../OffersController";
import { Button, Spinner } from "react-bootstrap";
import { SuccessToast } from "../../../../View/Resultsets/CommonComponents";
import MailsToCheckList from "../MailsToCheckList";
import { OurOfferAddNewModalButton } from "../../Modals/OfferModalButtons";
import ToolsDate from "../../../../React/ToolsDate";

export function SetAsGoodToOfferButton({ onError }: { onError: (error: Error) => void }) {
    const [requestPending, setRequestPending] = useState(false);
    const [showSuccessToast, setShowSuccessToast] = useState(false);

    async function handleClick() {
        try {
            setRequestPending(true);
            const currentItem = { ...mailsToCheckRepository.currentItems[0] };
            await mailsToCheckRepository.addNewItem(currentItem);
            setRequestPending(false);
            setShowSuccessToast(true);
        } catch (error) {
            if (error instanceof Error) {
                setRequestPending(false);
                onError(error);
            }
        }
    }

    return (
        <>
            <Button key="Do ofertowania" variant="outline-secondary" size="sm" onClick={handleClick}>
                Do ofertowania{" "}
                {requestPending && <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" />}
            </Button>
            <SuccessToast
                message="Mail przypisany do ofertowania"
                show={showSuccessToast}
                onClose={() => setShowSuccessToast(false)}
            />
        </>
    );
}

export function AddOurOfferFromMailButton({ onError }: { onError: (error: Error) => void }) {
    const mailData = mailInvitationsRepository.currentItems[0];
    if (!mailData) {
        console.log("mailInvitationsRepository.currentItems[0] is null");
        return null;
    }

    const modalSubtitle = `na podstawie maila od <strong>${mailData.from}</strong> z <strong>${ToolsDate.formatTime(
        mailData.date
    )}</strong><br>${mailData.subject}`;
    async function handleClick() {
        try {
            const currentItem = { ...mailInvitationsRepository.currentItems[0] };
            await mailsToCheckRepository.editItem(currentItem);
        } catch (error) {
            if (error instanceof Error) {
                onError(error);
            }
        }
    }

    return (
        <OurOfferAddNewModalButton
            modalProps={{
                contextData: { mail: { ...mailInvitationsRepository.currentItems[0] } },
                onAddNew: handleClick,
                modalSubtitle,
            }}
            buttonProps={{ buttonCaption: "Rejestruj ofertę" }}
        />
    );
}

export function ShowMailsToCheckButton() {
    const [showForm, setShowForm] = useState(false);

    function handleOpen() {
        setShowForm(true);
    }
    function handleClose() {
        setShowForm(false);
    }

    return (
        <>
            <Button key="Sprawdź pocztę" variant="outline-secondary" size="sm" onClick={handleOpen}>
                Sprawdź pocztę
            </Button>
            <MailsToCheckList show={showForm} handleClose={handleClose} />
        </>
    );
}
