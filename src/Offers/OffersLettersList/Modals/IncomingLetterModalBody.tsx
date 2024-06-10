import React, { useEffect, useRef, useState } from "react";
import { Form } from "react-bootstrap";
import { LetterModalBody } from "./LetterModalBody";
import { useFormContext } from "../../../View/Modals/FormContext";
import { ModalBodyProps } from "../../../View/Modals/ModalsTypes";
import { IncomingLetterOffer, OurLetterOffer } from "../../../../Typings/bussinesTypes";
import { entitiesRepository } from "../LettersController";
import { ErrorMessage, MyAsyncTypeahead } from "../../../View/Modals/CommonFormComponents/GenericComponents";
import { EntitySelector } from "../../../View/Modals/CommonFormComponents/BussinesObjectSelectors";

/**Wywoływana w ProjectsSelector jako props  */
export function IncomingLetterModalBody(props: ModalBodyProps<OurLetterOffer | IncomingLetterOffer>) {
    const initialData = props.initialData;
    const {
        register,
        setValue,
        watch,
        formState: { errors },
        control,
    } = useFormContext();

    useEffect(() => {
        setValue("_entitiesMain", initialData?._entitiesMain, { shouldDirty: false, shouldValidate: true });
        setValue("number", initialData?.number || "", { shouldDirty: false, shouldValidate: true });
    }, [initialData, setValue]);

    return (
        <>
            <Form.Group controlId="number">
                <Form.Label>Numer pisma</Form.Label>
                <Form.Control
                    type="text"
                    placeholder="Podaj numer"
                    isInvalid={!!errors?.number}
                    isValid={!errors?.number}
                    {...register("number")}
                />
                <ErrorMessage errors={errors} name={"number"} />
            </Form.Group>
            <LetterModalBody {...props} />
            <Form.Group>
                <Form.Label>Nadawca</Form.Label>
                <EntitySelector name="_entitiesMain" repository={entitiesRepository} multiple={true} />
            </Form.Group>
        </>
    );
}
