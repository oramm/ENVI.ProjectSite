import React from "react";
import { GeneralModalButtonButtonProps, SpecificEditModalButtonProps } from "../../../../View/Modals/ModalsTypes";
import { GeneralEditModalButton } from "../../../../View/Modals/GeneralModalButtons";
import { ExternalOffer, RepositoryDataItem } from "../../../../../Typings/bussinesTypes";
import { offersRepository } from "../../OffersController";
import { OfferBondModalBody } from "./OfferBondModalBody";
import makeOfferBondValidationSchema from "./OfferBondValidationSchema";
import { useFilterableTableContext } from "../../../../View/Resultsets/FilterableTable/FilterableTableContext";

export function OfferBondEditModalButton({ modalProps: { initialData } }: SpecificEditModalButtonProps<ExternalOffer>) {
    const { handleEditObject } = useFilterableTableContext<ExternalOffer>();

    return (
        <GeneralEditModalButton<ExternalOffer>
            modalProps={{
                onEdit: handleEditObject,
                ModalBodyComponent: OfferBondModalBody,
                modalTitle: "Edycja wadium",
                repository: offersRepository,
                initialData: initialData,
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
    modalProps: { initialData },
}: Omit<SpecificEditModalButtonProps<ExternalOffer>, "onEdit">) {
    const { handleEditObject } = useFilterableTableContext<ExternalOffer>();

    return (
        <GeneralEditModalButton<ExternalOffer>
            modalProps={{
                onEdit: handleEditObject,
                ModalBodyComponent: OfferBondModalBody,
                modalTitle: "Dodaj wadium",
                repository: offersRepository,
                initialData: initialData,
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
    modalProps: { initialData },
}: Omit<SpecificEditModalButtonProps<ExternalOffer>, "onEdit">) {
    const { handleEditObject } = useFilterableTableContext<ExternalOffer>();

    return (
        <GeneralEditModalButton<ExternalOffer>
            modalProps={{
                onEdit: handleEditObject,
                ModalBodyComponent: OfferBondModalBody,
                modalTitle: "Usuń wadium",
                repository: offersRepository,
                initialData: initialData,
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
