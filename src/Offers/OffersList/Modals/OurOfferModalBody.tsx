import React, { useEffect, useRef, useState } from "react";
import { OfferModalBody } from "./OfferModalBody";
import { useFormContext } from "../../../View/Modals/FormContext";
import { ModalBodyProps } from "../../../View/Modals/ModalsTypes";
import { ExternalOffer, OurOffer } from "../../../../Typings/bussinesTypes";

export function OurOfferModalBody(props: ModalBodyProps<OurOffer>) {
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
