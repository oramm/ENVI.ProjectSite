import React from "react";
import { CarData } from "../../../../Typings/bussinesTypes";
import { GeneralAddNewModalButton, GeneralEditModalButton } from "../../../View/Modals/GeneralModalButtons";
import { SpecificAddNewModalButtonProps, SpecificEditModalButtonProps } from "../../../View/Modals/ModalsTypes";
import { carsRepository } from "../CarsController";
import { CarModalBody } from "./CarModalBody";
import { makeCarValidationSchema } from "./CarValidationSchema";

export function CarEditModalButton({ modalProps: { onEdit, initialData } }: SpecificEditModalButtonProps<CarData>) {
    return (
        <GeneralEditModalButton<CarData>
            modalProps={{
                onEdit: onEdit,
                ModalBodyComponent: CarModalBody,
                modalTitle: "Edycja samochodu",
                repository: carsRepository,
                initialData: initialData,
                makeValidationSchema: makeCarValidationSchema,
            }}
            buttonProps={{
                buttonVariant: "outline-success",
            }}
        />
    );
}

export function CarAddNewModalButton({ modalProps: { onAddNew } }: SpecificAddNewModalButtonProps<CarData>) {
    return (
        <GeneralAddNewModalButton<CarData>
            modalProps={{
                onAddNew: onAddNew,
                ModalBodyComponent: CarModalBody,
                modalTitle: "Dodaj samochód",
                repository: carsRepository,
                makeValidationSchema: makeCarValidationSchema,
            }}
            buttonProps={{
                buttonCaption: "Dodaj samochód",
                buttonVariant: "outline-success",
            }}
        />
    );
}
