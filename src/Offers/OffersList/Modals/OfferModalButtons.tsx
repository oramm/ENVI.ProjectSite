import React, { useEffect, useState } from "react";
import { GeneralAddNewModalButton, GeneralEditModalButton } from "../../../View/Modals/GeneralModalButtons";
import { SpecificAddNewModalButtonProps, SpecificEditModalButtonProps } from "../../../View/Modals/ModalsTypes";
import { makeOtherOfferValidationSchema, makeOurOfferValidationSchema } from "./OfferValidationSchema";
import { ExternalOfferModalBody } from "./ExternalOfferModalBody";
import { OurOfferModalBody } from "./OurOfferModalBody";
import { ExternalOffer, OurOffer } from "../../../../Typings/bussinesTypes";
import { offersRepository } from "../OffersController";
import { Button, Spinner } from "react-bootstrap";
import { SuccessToast } from "../../../View/Resultsets/CommonComponents";

/** przycisk i modal edycji Offer */
export function OfferEditModalButton({
    modalProps: { onEdit, initialData },
    buttonProps,
}: SpecificEditModalButtonProps<OurOffer | ExternalOffer>) {
    useEffect(() => {
        console.log("OfferEditModalButton initialData", initialData);
    }, [initialData]);

    return initialData.isOur ? (
        <OurOfferEditModalButton modalProps={{ onEdit, initialData }} buttonProps={buttonProps} />
    ) : (
        <ExternalOfferEditModalButton modalProps={{ onEdit, initialData }} buttonProps={buttonProps} />
    );
}

export function OurOfferEditModalButton({
    modalProps: { onEdit, initialData },
}: SpecificEditModalButtonProps<OurOffer>) {
    return (
        <GeneralEditModalButton<OurOffer>
            modalProps={{
                onEdit: onEdit,
                ModalBodyComponent: OurOfferModalBody,
                modalTitle: "Edycja oferty - szablon ENVI",
                repository: offersRepository,
                initialData: initialData,
                makeValidationSchema: makeOurOfferValidationSchema,
            }}
            buttonProps={{
                buttonVariant: "outline-success",
            }}
        />
    );
}

export function OurOfferAddNewModalButton({ modalProps: { onAddNew } }: SpecificAddNewModalButtonProps<OurOffer>) {
    return (
        <GeneralAddNewModalButton<OurOffer>
            modalProps={{
                onAddNew: onAddNew,
                ModalBodyComponent: OurOfferModalBody,
                modalTitle: "Rejestruj ofertę - szablon ENVI",
                repository: offersRepository,
                makeValidationSchema: makeOurOfferValidationSchema,
            }}
            buttonProps={{
                buttonCaption: "Rejestruj ENVI",
                buttonVariant: "outline-success",
            }}
        />
    );
}

export function ExternalOfferEditModalButton({
    modalProps: { onEdit, initialData },
}: SpecificEditModalButtonProps<ExternalOffer>) {
    return (
        <GeneralEditModalButton<ExternalOffer>
            modalProps={{
                onEdit: onEdit,
                ModalBodyComponent: ExternalOfferModalBody,
                modalTitle: "Edycja oferty - formularz Zamawiającego",
                repository: offersRepository,
                initialData: initialData,
                makeValidationSchema: makeOtherOfferValidationSchema,
            }}
            buttonProps={{}}
        />
    );
}

export function ExternalOfferAddNewModalButton({
    modalProps: { onAddNew },
}: SpecificAddNewModalButtonProps<ExternalOffer>) {
    return (
        <GeneralAddNewModalButton<ExternalOffer>
            modalProps={{
                onAddNew: onAddNew,
                ModalBodyComponent: ExternalOfferModalBody,
                modalTitle: "Nowa oferta - formularz Zamawiającego",
                repository: offersRepository,
                makeValidationSchema: makeOtherOfferValidationSchema,
            }}
            buttonProps={{
                buttonCaption: "Rejestruj ofertę",
            }}
        />
    );
}

export function ExportOurOfferToPDFButton({
    onError,
    ourOffer,
}: {
    onError: (error: Error) => void;
    ourOffer: OurOffer;
}) {
    const [requestPending, setRequestPending] = useState(false);
    const [showSuccessToast, setShowSuccessToast] = useState(false);

    async function handleClick() {
        try {
            setRequestPending(true);
            await offersRepository.fetch("exportOurOfferToPDF", ourOffer);
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
