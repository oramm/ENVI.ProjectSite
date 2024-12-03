import React, { useEffect, useState } from "react";
import { mailsToCheckRepository } from "../OffersController";
import { Button, Spinner } from "react-bootstrap";
import { SuccessToast } from "../../../View/Resultsets/CommonComponents";
import MailsToCheckList from "./MailsToCheckList";

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
