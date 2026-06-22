import React, { useEffect, useState } from "react";
import { GeneralAddNewModalButton, GeneralEditModalButton } from "../../../View/Modals/GeneralModalButtons";
import { SpecificAddNewModalButtonProps, SpecificEditModalButtonProps } from "../../../View/Modals/ModalsTypes";
import { makeOtherOfferValidationSchema, makeOurOfferValidationSchema } from "./OfferValidationSchema";
import { ExternalOfferModalBody } from "./ExternalOfferModalBody";
import { OurOfferModalBody } from "./OurOfferModalBody";
import { ExternalOffer, OurOffer } from "../../../../Typings/bussinesTypes";
import { Button, Spinner } from "react-bootstrap";
import { SuccessToast } from "../../../View/Resultsets/CommonComponents";
import { offersRepository } from "../OffersController"; // tylko dla ExportOurOfferToPDFButton
import RepositoryReact from "../../../React/RepositoryReact";

/** przycisk i modal edycji Offer */
export function OfferEditModalButton({
    modalProps: { onEdit, initialData, repository },
    buttonProps,
}: SpecificEditModalButtonProps<OurOffer | ExternalOffer>) {
    useEffect(() => {
        console.log("OfferEditModalButton initialData", initialData);
    }, [initialData]);

    return initialData.isOur ? (
        <OurOfferEditModalButton modalProps={{ onEdit, initialData, repository }} buttonProps={buttonProps} />
    ) : (
        <ExternalOfferEditModalButton modalProps={{ onEdit, initialData, repository }} buttonProps={buttonProps} />
    );
}

export function OurOfferEditModalButton({
    modalProps: { onEdit, initialData, repository },
    buttonProps,
}: SpecificEditModalButtonProps<OurOffer | ExternalOffer>) {
    return (
        <GeneralEditModalButton<OurOffer>
            modalProps={{
                onEdit: onEdit,
                ModalBodyComponent: OurOfferModalBody,
                modalTitle: "Edycja oferty - szablon ENVI",
                repository: repository as RepositoryReact<OurOffer>,
                initialData: initialData as OurOffer,
                makeValidationSchema: makeOurOfferValidationSchema,
                // OfferModalBody używa InlineCreateDrawer — modal musi puścić focus do panelu
                enforceFocus: false,
            }}
            buttonProps={{
                buttonVariant: "outline-success",
                ...buttonProps,
            }}
        />
    );
}

export function OurOfferAddNewModalButton({
    modalProps: { onAddNew, contextData, modalSubtitle, repository },
    buttonProps,
}: SpecificAddNewModalButtonProps<OurOffer | ExternalOffer>) {
    return (
        <GeneralAddNewModalButton<OurOffer>
            modalProps={{
                onAddNew: onAddNew,
                ModalBodyComponent: OurOfferModalBody,
                modalTitle: "Rejestruj ofertę - szablon ENVI",
                modalSubtitle,
                repository: repository as RepositoryReact<OurOffer>,
                makeValidationSchema: makeOurOfferValidationSchema,
                contextData,
                // OfferModalBody używa InlineCreateDrawer — modal musi puścić focus do panelu
                enforceFocus: false,
            }}
            buttonProps={{
                buttonCaption: "Rejestruj ENVI",
                buttonVariant: "outline-success",
                ...buttonProps,
            }}
        />
    );
}

export function ExternalOfferEditModalButton({
    modalProps: { onEdit, initialData, repository },
    buttonProps,
}: SpecificEditModalButtonProps<OurOffer | ExternalOffer>) {
    return (
        <GeneralEditModalButton<ExternalOffer>
            modalProps={{
                onEdit: onEdit,
                ModalBodyComponent: ExternalOfferModalBody,
                modalTitle: "Edycja oferty - formularz Zamawiającego",
                repository: repository as RepositoryReact<ExternalOffer>,
                initialData: initialData as ExternalOffer,
                makeValidationSchema: makeOtherOfferValidationSchema,
                // OfferModalBody używa InlineCreateDrawer — modal musi puścić focus do panelu
                enforceFocus: false,
            }}
            buttonProps={{
                ...buttonProps,
            }}
        />
    );
}

export function ExternalOfferAddNewModalButton({
    modalProps: { onAddNew, repository },
    buttonProps,
}: SpecificAddNewModalButtonProps<OurOffer | ExternalOffer>) {
    return (
        <GeneralAddNewModalButton<ExternalOffer>
            modalProps={{
                onAddNew,
                ModalBodyComponent: ExternalOfferModalBody,
                modalTitle: "Nowa oferta - formularz Zamawiającego",
                repository: repository as RepositoryReact<ExternalOffer>,
                makeValidationSchema: makeOtherOfferValidationSchema,
                // OfferModalBody używa InlineCreateDrawer — modal musi puścić focus do panelu
                enforceFocus: false,
            }}
            buttonProps={{
                buttonCaption: "Rejestruj ofertę",
                ...buttonProps,
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
            // UWAGA: tu nadal używamy offersRepository z OffersController, bo to nie jest modal edycji
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
