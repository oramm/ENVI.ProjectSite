import React, { useEffect, useRef, useState } from "react";
import { Form } from "react-bootstrap";
import { ErrorMessage, MyAsyncTypeahead } from "../../../View/Modals/CommonFormComponents";
import { OfferModalBody } from "./OfferModalBody";
import { useFormContext } from "../../../View/Modals/FormContext";
import { ModalBodyProps } from "../../../View/Modals/ModalsTypes";
import { ExternalOffer, OurOffer } from "../../../../Typings/bussinesTypes";
import { entitiesRepository } from "../OffersController";

/**Wywoływana w ProjectsSelector jako props  */
export function ExternalOfferModalBody(props: ModalBodyProps<OurOffer | ExternalOffer>) {
    const { initialData, isEditing } = props;
    const {
        register,
        setValue,
        watch,
        formState: { errors },
        control,
    } = useFormContext();

    useEffect(() => {
        setValue("isOur", false);
    }, [initialData, setValue]);

    return (
        <>
            <OfferModalBody {...props} />
        </>
    );
}
