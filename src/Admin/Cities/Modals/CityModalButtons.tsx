import React, { useEffect } from "react";
import { CityData } from "../../../../Typings/bussinesTypes";
import { GeneralAddNewModalButton, GeneralEditModalButton } from "../../../View/Modals/GeneralModalButtons";
import { SpecificAddNewModalButtonProps, SpecificEditModalButtonProps } from "../../../View/Modals/ModalsTypes";
import { citiesRepository } from "../CitiesController";
import { CityModalBody } from "./CityModalBody";
import { makeCityValidationSchema } from "./CityValidationSchema";

export function CityEditModalButton({ modalProps: { onEdit, initialData } }: SpecificEditModalButtonProps<CityData>) {
    return (
        <GeneralEditModalButton<CityData>
            modalProps={{
                onEdit: onEdit,
                ModalBodyComponent: CityModalBody,
                modalTitle: "Edycja danych miasta",
                repository: citiesRepository,
                initialData: initialData,
                makeValidationSchema: makeCityValidationSchema,
            }}
            buttonProps={{
                buttonVariant: "outline-success",
            }}
        />
    );
}

export function CityAddNewModalButton({ modalProps: { onAddNew } }: SpecificAddNewModalButtonProps<CityData>) {
    return (
        <GeneralAddNewModalButton<CityData>
            modalProps={{
                onAddNew: onAddNew,
                ModalBodyComponent: CityModalBody,
                modalTitle: "Dodaj miasto",
                repository: citiesRepository,
                makeValidationSchema: makeCityValidationSchema,
            }}
            buttonProps={{
                buttonCaption: "Dodaj miasto",
                buttonVariant: "outline-success",
            }}
        />
    );
}
