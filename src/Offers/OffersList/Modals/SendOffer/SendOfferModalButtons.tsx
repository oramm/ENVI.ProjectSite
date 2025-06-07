import React, { useEffect } from "react";
import { SpecificEditModalButtonProps } from "../../../../View/Modals/ModalsTypes";
import { OurOffer } from "../../../../../Typings/bussinesTypes";
import { useFilterableTableContext } from "../../../../View/Resultsets/FilterableTable/FilterableTableContext";
import { GeneralEditModalButton } from "../../../../View/Modals/GeneralModalButtons";
import { SendOfferModalBody } from "./SendOfferModalBody";
import { offersRepository } from "../../OffersController";
import { makeSendAnotherOfferValidationSchema, makeSendOfferValidationSchema } from "./SendOfferValidationSchema";
import RepositoryReact from "../../../../React/RepositoryReact";

export function SendOfferModalButton({ modalProps: { initialData } }: SpecificEditModalButtonProps<OurOffer>) {
    const { handleEditObject } = useFilterableTableContext<OurOffer>();
    return (
        <GeneralEditModalButton<OurOffer>
            modalProps={{
                onEdit: handleEditObject,
                ModalBodyComponent: SendOfferModalBody,
                modalTitle: "Wyślij ofertę mailem",
                repository: offersRepository as RepositoryReact<OurOffer>,
                initialData,
                makeValidationSchema: makeSendOfferValidationSchema,
                specialActionRoute: "sendOffer",
            }}
            buttonProps={{
                buttonCaption: "Wyślij mailem",
                buttonVariant: "outline-success",
            }}
        />
    );
}

export function SendAnotherOfferModalButton({ modalProps: { initialData } }: SpecificEditModalButtonProps<OurOffer>) {
    const { handleEditObject } = useFilterableTableContext<OurOffer>();
    return (
        <GeneralEditModalButton<OurOffer>
            modalProps={{
                onEdit: handleEditObject,
                ModalBodyComponent: SendOfferModalBody,
                modalTitle: "Wyślij kolejną wersję oferty mailem",
                repository: offersRepository as RepositoryReact<OurOffer>,
                initialData,
                makeValidationSchema: makeSendAnotherOfferValidationSchema,
                specialActionRoute: "sendOffer",
            }}
            buttonProps={{
                buttonCaption: "Wyślij kolejną wersję mailem",
                buttonVariant: "outline-success",
            }}
        />
    );
}
