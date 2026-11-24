import React, { useState } from "react";
import { Button, Modal, Spinner } from "react-bootstrap";
import { AlertComponent } from "../Resultsets/CommonComponents";

type ConfirmModalProps = {
    show: boolean;
    onClose: () => void;
    title: string;
    subtitle?: string;
    prompt: React.ReactNode;
    confirmLabel?: string;
    cancelLabel?: string;
    confirmVariant?: React.ComponentProps<typeof Button>["variant"];
    lockWhileWaiting?: boolean;
    onConfirm: () => Promise<void>;
};

export default function ConfirmModal({ show, onClose, title, subtitle, prompt, onConfirm, confirmLabel = "Ok", cancelLabel = "Anuluj", confirmVariant = "primary", lockWhileWaiting = false }: ConfirmModalProps) {
    const [isWaiting, setIsWaiting] = useState(false);
    const [isError, setIsError] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const canClose = !lockWhileWaiting || !isWaiting;

    async function handleConfirmAndClose() {
        setIsWaiting(true);
        try {
            setIsError(false);
            await onConfirm();
            onClose();
        } catch (e) {
            setIsError(true);
            if (e instanceof Error) {
                setErrorMessage(e.message);
            }
            console.log(e);
        }
        setIsWaiting(false);
    }

    return (
        <Modal show={show} onHide={canClose ? onClose : undefined} keyboard={canClose} backdrop={canClose ? true : "static"}>
            <Modal.Header closeButton={canClose}>
                <Modal.Title>{title}</Modal.Title>
                {subtitle && <small>{subtitle}</small>}
            </Modal.Header>
            <Modal.Body>{prompt}</Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={onClose} disabled={!canClose}>
                    {cancelLabel}
                </Button>
                <Button variant={confirmVariant} disabled={isWaiting} onClick={handleConfirmAndClose}>
                    {confirmLabel}
                    {isWaiting && <Spinner as="span" animation="grow" size="sm" role="status" aria-hidden="true" />}
                </Button>
                {isError && <AlertComponent message={errorMessage} type="danger" />}
            </Modal.Footer>
        </Modal>
    );
}
