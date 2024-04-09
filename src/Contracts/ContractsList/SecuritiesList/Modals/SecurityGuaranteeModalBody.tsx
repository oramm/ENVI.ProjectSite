import React, { useEffect, useRef, useState } from "react";
import { Col, Form, Row } from "react-bootstrap";
import { ErrorMessage } from "../../../../View/Modals/CommonFormComponents";
import { SecurityModalBody } from "./SecurityModalBody";
import { useFormContext } from "../../../../View/Modals/FormContext";
import { ModalBodyProps } from "../../../../View/Modals/ModalsTypes";
import { Security } from "../../../../../Typings/bussinesTypes";

/**Wywoływana w ProjectsSelector jako props  */
export function SecurityGuaranteeModalBody(props: ModalBodyProps<Security>) {
    const { initialData, isEditing, additionalProps, contextData } = props;

    const {
        register,
        setValue,
        watch,
        formState: { errors },
        control,
    } = useFormContext();

    useEffect(() => {
        setValue("isCash", false);
        if (isEditing) {
            setValue(
                "firstPartExpiryDate",
                initialData?.firstPartExpiryDate || initialData?._contract.endDate || undefined,
                { shouldValidate: true }
            );
            setValue("secondPartExpiryDate", initialData?.secondPartExpiryDate || undefined, { shouldValidate: true });
        }
    }, [initialData, setValue]);

    return (
        <>
            <SecurityModalBody {...props} />
            <Row>
                <Form.Group as={Col} controlId="firstPartExpiryDate">
                    <Form.Label>Termin wygaśnięcia 70%</Form.Label>
                    <Form.Control
                        type="date"
                        isValid={!errors.firstPartExpiryDate}
                        isInvalid={!!errors.firstPartExpiryDate}
                        {...register("firstPartExpiryDate")}
                    />
                    <ErrorMessage errors={errors} name="firstPartExpiryDate" />
                </Form.Group>
                <Form.Group as={Col} controlId="secondPartExpiryDate">
                    <Form.Label>Termin wygaśnięcia 30%</Form.Label>
                    <Form.Control
                        type="date"
                        isValid={!errors.secondPartExpiryDate}
                        isInvalid={!!errors.secondPartExpiryDate}
                        {...register("secondPartExpiryDate")}
                    />
                    <ErrorMessage errors={errors} name="secondPartExpiryDate" />
                </Form.Group>
            </Row>
        </>
    );
}
