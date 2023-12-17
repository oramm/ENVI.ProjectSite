import React, { useEffect } from "react";
import {
    GeneralAddNewModalButton,
    GeneralEditModalButton,
} from "../../View/Modals/GeneralModalButtons";
import {
    SpecificAddNewModalButtonProps,
    SpecificEditModalButtonProps,
} from "../../View/Modals/ModalsTypes";
import {
    makeOtherOfferValidationSchema,
    makeOurOfferValidationSchema,
} from "./OfferValidationSchema";
import { ExternalOfferModalBody } from "./ExternalOfferModalBody";
import { OurOfferModalBody } from "./OurOfferModalBody";
import { ExternalOffer, OurOffer } from "../../../Typings/bussinesTypes";
import { OffersRepository } from "../OffersController";

/** przycisk i modal edycji Offer */
export function OfferEditModalButton({
    modalProps: { onEdit, initialData },
    buttonProps,
}: SpecificEditModalButtonProps<OurOffer | ExternalOffer>) {
    useEffect(() => {
        console.log("OfferEditModalButton initialData", initialData);
    }, [initialData]);

    return initialData.isOur ? (
        <OurOfferEditModalButton
            modalProps={{ onEdit, initialData }}
            buttonProps={buttonProps}
        />
    ) : (
        <ExternalOfferEditModalButton
            modalProps={{ onEdit, initialData }}
            buttonProps={buttonProps}
        />
    );
}

export function OurOfferEditModalButton({
    modalProps: { onEdit, initialData },
}: SpecificEditModalButtonProps<OurOffer | ExternalOffer>) {
    return (
        <GeneralEditModalButton<OurOffer | ExternalOffer>
            modalProps={{
                onEdit: onEdit,
                ModalBodyComponent: OurOfferModalBody,
                modalTitle: "Edycja oferty - szablon ENVI",
                repository: OffersRepository,
                initialData: initialData,
                makeValidationSchema: makeOurOfferValidationSchema,
            }}
            buttonProps={{
                buttonVariant: "outline-success",
            }}
        />
    );
}

export function OurOfferAddNewModalButton({
    modalProps: { onAddNew },
}: SpecificAddNewModalButtonProps<OurOffer | ExternalOffer>) {
    return (
        <GeneralAddNewModalButton<OurOffer | ExternalOffer>
            modalProps={{
                onAddNew: onAddNew,
                ModalBodyComponent: OurOfferModalBody,
                modalTitle: "Rejestruj ofertę - szablon ENVI",
                repository: OffersRepository,
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
}: SpecificEditModalButtonProps<OurOffer | ExternalOffer>) {
    return (
        <GeneralEditModalButton<OurOffer | ExternalOffer>
            modalProps={{
                onEdit: onEdit,
                ModalBodyComponent: ExternalOfferModalBody,
                modalTitle: "Edycja oferty - formularz Zamawiającego",
                repository: OffersRepository,
                initialData: initialData,
                makeValidationSchema: makeOtherOfferValidationSchema,
            }}
            buttonProps={{}}
        />
    );
}

export function ExternalOfferAddNewModalButton({
    modalProps: { onAddNew },
}: SpecificAddNewModalButtonProps<OurOffer | ExternalOffer>) {
    return (
        <GeneralAddNewModalButton<OurOffer | ExternalOffer>
            modalProps={{
                onAddNew: onAddNew,
                ModalBodyComponent: ExternalOfferModalBody,
                modalTitle: "Nowa oferta - formularz Zamawiającego",
                repository: OffersRepository,
                makeValidationSchema: makeOtherOfferValidationSchema,
            }}
            buttonProps={{
                buttonCaption: "Rejestruj ofertę",
            }}
        />
    );
}
