import React, { useState } from "react";
import { Button, Modal, Spinner } from "react-bootstrap";
import { AlertComponent } from "../Resultsets/CommonComponents";

export default function ConfirmModal({ show, onClose, title, prompt, onConfirm }: { show: boolean, onClose: () => void, title: string, prompt: string, onConfirm: () => Promise<void> }) {
    const [isWaiting, setIsWaiting] = useState(false);
    const [isError, setIsError] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    async function handleConfirmAndClose() {
        setIsWaiting(true);
        try {
            await onConfirm();
        }
        catch (e) {
            if (e instanceof Error) {
                setIsError(true);
                setErrorMessage(e.message);
            }
            console.log(e);
        }
        setIsWaiting(false);
        onClose();
    }

    return (
        <Modal show={show} onHide={onClose}>
            <Modal.Header closeButton>
                <Modal.Title>{title}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {prompt}
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={onClose}>
                    Anuluj
                </Button>
                <Button variant="primary" onClick={handleConfirmAndClose}>
                    Ok
                    {isWaiting && <Spinner
                        as="span"
                        animation="grow"
                        size="sm"
                        role="status"
                        aria-hidden="true"
                    />}
                </Button>
                {isError && (
                    <AlertComponent
                        message={errorMessage}
                        type='danger'
                        timeout={5000}
                    />
                )}
            </Modal.Footer>
        </Modal>
    );
}
