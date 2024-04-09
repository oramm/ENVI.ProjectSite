import React, { useEffect } from "react";
import { GeneralAddNewModalButton, GeneralEditModalButton } from "../../../View/Modals/GeneralModalButtons";
import { SpecificAddNewModalButtonProps, SpecificEditModalButtonProps } from "../../../View/Modals/ModalsTypes";
import { makeOtherLetterValidationSchema, ourLetterValidationSchema } from "./LetterValidationSchema";
import { IncomingLetterModalBody } from "./IncomingLetterModalBody";
import { OurLetterModalBody } from "./OurLetterModalBody";
import { IncomingLetterOffer, OurLetterOffer } from "../../../../Typings/bussinesTypes";
import { lettersRepository } from "../LettersController";

/** przycisk i modal edycji Letter */
export function LetterEditModalButton({
    modalProps: { onEdit, initialData },
    buttonProps,
}: SpecificEditModalButtonProps<OurLetterOffer | IncomingLetterOffer>) {
    useEffect(() => {
        console.log("LetterEditModalButton initialData", initialData);
    }, [initialData]);

    return initialData.isOur ? (
        <OurLetterEditModalButton modalProps={{ onEdit, initialData }} buttonProps={buttonProps} />
    ) : (
        <IncomingLetterEditModalButton modalProps={{ onEdit, initialData }} buttonProps={buttonProps} />
    );
}

export function OurLetterEditModalButton({
    modalProps: { onEdit, initialData },
}: SpecificEditModalButtonProps<OurLetterOffer | IncomingLetterOffer>) {
    return (
        <GeneralEditModalButton<OurLetterOffer | IncomingLetterOffer>
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
}: SpecificAddNewModalButtonProps<OurLetterOffer | IncomingLetterOffer>) {
    return (
        <GeneralAddNewModalButton<OurLetterOffer | IncomingLetterOffer>
            modalProps={{
                onAddNew: onAddNew,
                ModalBodyComponent: OurLetterModalBody,
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
}: SpecificEditModalButtonProps<OurLetterOffer | IncomingLetterOffer>) {
    return (
        <GeneralEditModalButton<OurLetterOffer | IncomingLetterOffer>
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
}: SpecificAddNewModalButtonProps<OurLetterOffer | IncomingLetterOffer>) {
    return (
        <GeneralAddNewModalButton<OurLetterOffer | IncomingLetterOffer>
            modalProps={{
                onAddNew: onAddNew,
                ModalBodyComponent: IncomingLetterModalBody,
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
