import React, { useEffect, useState } from "react";
import { GeneralAddNewModalButton, GeneralEditModalButton } from "../../../View/Modals/GeneralModalButtons";
import { SpecificAddNewModalButtonProps, SpecificEditModalButtonProps } from "../../../View/Modals/ModalsTypes";
import { ProjectSelectorModalBody } from "./LetterModalBody";
import { makeOtherLetterValidationSchema, ourLetterValidationSchema } from "./LetterValidationSchema";
import { IncomingLetterModalBody } from "./IncomingLetterModalBody";
import { OurLetterModalBody } from "./OurLetterModalBody";
import { IncomingLetterContract, OurLetterContract } from "../../../../Typings/bussinesTypes";
import { lettersRepository } from "../LettersController";
import { Button, Spinner } from "react-bootstrap";
import { SuccessToast } from "../../../View/Resultsets/CommonComponents";

/** przycisk i modal edycji Letter */
export function LetterEditModalButton({
    modalProps: { onEdit, initialData },
    buttonProps,
}: SpecificEditModalButtonProps<OurLetterContract | IncomingLetterContract>) {
    useEffect(() => {}, [initialData]);

    return initialData.isOur ? (
        <OurLetterEditModalButton modalProps={{ onEdit, initialData }} buttonProps={buttonProps} />
    ) : (
        <IncomingLetterEditModalButton modalProps={{ onEdit, initialData }} buttonProps={buttonProps} />
    );
}

export function OurLetterEditModalButton({
    modalProps: { onEdit, initialData },
}: SpecificEditModalButtonProps<OurLetterContract | IncomingLetterContract>) {
    return (
        <GeneralEditModalButton<OurLetterContract | IncomingLetterContract>
            modalProps={{
                onEdit: onEdit,
                ModalBodyComponent: OurLetterModalBody,
                modalTitle: "Edycja pisma wychodzącego",
                repository: lettersRepository,
                initialData: initialData,
                makeValidationSchema: ourLetterValidationSchema,
            }}
            buttonProps={{
                buttonVariant: "outline-success",
            }}
        />
    );
}

export function OurLetterAddNewModalButton({
    modalProps: { onAddNew },
}: SpecificAddNewModalButtonProps<OurLetterContract | IncomingLetterContract>) {
    return (
        <GeneralAddNewModalButton<OurLetterContract | IncomingLetterContract>
            modalProps={{
                onAddNew: onAddNew,
                ModalBodyComponent: ProjectSelectorModalBody,
                additionalModalBodyProps: { SpecificLetterModalBody: OurLetterModalBody },
                modalTitle: "Rejestruj pismo wychodzące",
                repository: lettersRepository,
                makeValidationSchema: ourLetterValidationSchema,
            }}
            buttonProps={{
                buttonCaption: "Rejestruj wychodzące",
                buttonVariant: "outline-success",
            }}
        />
    );
}

export function IncomingLetterEditModalButton({
    modalProps: { onEdit, initialData },
}: SpecificEditModalButtonProps<OurLetterContract | IncomingLetterContract>) {
    return (
        <GeneralEditModalButton<OurLetterContract | IncomingLetterContract>
            modalProps={{
                onEdit: onEdit,
                ModalBodyComponent: IncomingLetterModalBody,
                modalTitle: "Edycja pisma przychodzącego",
                repository: lettersRepository,
                initialData: initialData,
                makeValidationSchema: makeOtherLetterValidationSchema,
            }}
            buttonProps={{}}
        />
    );
}

export function IncomingLetterAddNewModalButton({
    modalProps: { onAddNew },
}: SpecificAddNewModalButtonProps<OurLetterContract | IncomingLetterContract>) {
    return (
        <GeneralAddNewModalButton<OurLetterContract | IncomingLetterContract>
            modalProps={{
                onAddNew: onAddNew,
                ModalBodyComponent: ProjectSelectorModalBody,
                additionalModalBodyProps: { SpecificLetterModalBody: IncomingLetterModalBody }, // additional props for ProjectSelectorModalBody
                modalTitle: "Nowe pismo przychodzące",
                repository: lettersRepository,
                makeValidationSchema: makeOtherLetterValidationSchema,
            }}
            buttonProps={{
                buttonCaption: "Rejestruj przychodzące",
            }}
        />
    );
}

export function ExportOurLetterContractToPDFButton({
    onError,
    ourLetterContract,
}: {
    onError: (error: Error) => void;
    ourLetterContract: OurLetterContract;
}) {
    const [requestPending, setRequestPending] = useState(false);
    const [showSuccessToast, setShowSuccessToast] = useState(false);

    async function handleClick() {
        try {
            setRequestPending(true);
            await lettersRepository.fetch("exportOurLetterToPDF", ourLetterContract);
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
