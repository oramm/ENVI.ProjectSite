import React, { useEffect, useRef, useState } from "react";
import { Form } from "react-bootstrap";
import { OfferModalBody } from "./OfferModalBody";
import { useFormContext } from "../../../View/Modals/FormContext";
import { ModalBodyProps } from "../../../View/Modals/ModalsTypes";
import { ExternalOffer, OurOffer } from "../../../../Typings/bussinesTypes";
import { ErrorMessage } from "../../../View/Modals/CommonFormComponents/GenericComponents";

/**Wywoływana w ProjectsSelector jako props  */
export function ExternalOfferModalBody(props: ModalBodyProps<ExternalOffer>) {
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
        setValue("tenderUrl", initialData?.tenderUrl || null, { shouldValidate: true });
    }, [initialData, setValue]);

    return (
        <>
            <OfferModalBody {...props} />
            <Form.Group>
                <Form.Label>Link do ogłoszenia</Form.Label>
                <Form.Control
                    type="text"
                    placeholder="Wklej link"
                    isInvalid={!!errors?.tenderUrl}
                    isValid={!errors?.tenderUrl}
                    {...register("tenderUrl")}
                />
                <ErrorMessage errors={errors} name="tenderUrl" />
            </Form.Group>
        </>
    );
}
