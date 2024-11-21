import React, { useEffect, useState } from "react";
import { mailInvitationsRepository } from "../OffersController";
import { Button, Spinner } from "react-bootstrap";
import { SuccessToast } from "../../../View/Resultsets/CommonComponents";

export function LoadEmailsButton({ onError }: { onError: (error: Error) => void }) {
    const [requestPending, setRequestPending] = useState(false);
    const [showSuccessToast, setShowSuccessToast] = useState(false);

    async function handleClick() {
        try {
            setRequestPending(true);
            await mailInvitationsRepository.fetch("mailInvitations");
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
            <Button key="Exportuj do PDF" variant="outline-secondary" size="sm" onClick={handleClick}>
                Exportuj do PDF{" "}
                {requestPending && <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" />}
            </Button>
            <SuccessToast
                message="Eksport do PDF zakończył się powodzeniem!"
                show={showSuccessToast}
                onClose={() => setShowSuccessToast(false)}
            />
        </>
    );
}
