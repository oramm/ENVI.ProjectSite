import React from "react";
import { GeneralModalButtonButtonProps, SpecificEditModalButtonProps } from "../../../../View/Modals/ModalsTypes";
import { GeneralEditModalButton } from "../../../../View/Modals/GeneralModalButtons";
import { ExternalOffer, OurOffer, RepositoryDataItem } from "../../../../../Typings/bussinesTypes";
import { OfferBondModalBody } from "./OfferBondModalBody";
import makeOfferBondValidationSchema from "./OfferBondValidationSchema";
import { useFilterableTableContext } from "../../../../View/Resultsets/FilterableTable/FilterableTableContext";
import RepositoryReact from "../../../../React/RepositoryReact";

export function OfferBondEditModalButton({
    modalProps: { initialData, repository },
}: SpecificEditModalButtonProps<OurOffer | ExternalOffer>) {
    const { handleEditObject } = useFilterableTableContext<ExternalOffer>();

    return (
        <GeneralEditModalButton<ExternalOffer>
            modalProps={{
                onEdit: handleEditObject,
                ModalBodyComponent: OfferBondModalBody,
                modalTitle: "Edycja wadium",
                repository: repository as RepositoryReact<ExternalOffer>,
                initialData: initialData as ExternalOffer,
                makeValidationSchema: makeOfferBondValidationSchema,
                specialActionRoute: "editOfferBond",
            }}
            buttonProps={{
                buttonCaption: "Edytuj wadium",
                buttonVariant: "outline-success",
            }}
        />
    );
}

export function OfferBondAddNewModalButton({
    modalProps: { initialData, repository },
}: SpecificEditModalButtonProps<OurOffer | ExternalOffer>) {
    const { handleEditObject } = useFilterableTableContext<ExternalOffer>();

    return (
        <GeneralEditModalButton<ExternalOffer>
            modalProps={{
                onEdit: handleEditObject,
                ModalBodyComponent: OfferBondModalBody,
                modalTitle: "Dodaj wadium",
                repository: repository as RepositoryReact<ExternalOffer>,
                initialData: initialData as ExternalOffer,
                makeValidationSchema: makeOfferBondValidationSchema,
                specialActionRoute: "addNewOfferBond",
            }}
            buttonProps={{
                buttonVariant: "outline-success",
                buttonCaption: "Dodaj wadium",
            }}
        />
    );
}

export function OfferBondDeleteModalButton({
    modalProps: { initialData, repository },
}: SpecificEditModalButtonProps<OurOffer | ExternalOffer>) {
    const { handleEditObject } = useFilterableTableContext<ExternalOffer>();

    return (
        <GeneralEditModalButton<ExternalOffer>
            modalProps={{
                onEdit: handleEditObject,
                ModalBodyComponent: OfferBondModalBody,
                modalTitle: "Usuń wadium",
                repository: repository as RepositoryReact<ExternalOffer>,
                initialData: initialData as ExternalOffer,
                //makeValidationSchema: makeOfferBondValidationSchema,
                specialActionRoute: "deleteOfferBond",
            }}
            buttonProps={{
                buttonVariant: "outline-danger",
                buttonCaption: "Usuń wadium",
            }}
        />
    );
}
