import React, { useEffect, useRef, useState } from "react";
import { ErrorMessage, MyAsyncTypeahead } from "../../../View/Modals/CommonFormComponents";
import { OfferModalBody } from "./OfferModalBody";
import { useFormContext } from "../../../View/Modals/FormContext";
import { Col, Form, Row } from "react-bootstrap";
import { ModalBodyProps } from "../../../View/Modals/ModalsTypes";
import { ExternalOffer, OurOffer } from "../../../../Typings/bussinesTypes";
import { entitiesRepository } from "../OffersController";

export function OurOfferModalBody(props: ModalBodyProps<OurOffer | ExternalOffer>) {
    const { initialData, isEditing } = props;
    const {
        setValue,
        watch,
        register,
        formState: { errors },
    } = useFormContext();

    useEffect(() => {
        setValue("isOur", true);
    }, [initialData, setValue]);

    return (
        <>
            <OfferModalBody {...props} />
            <input type="hidden" {...register("isOur")} value="true" />
        </>
    );
}
