import React, { useEffect } from "react";
import { Col, Form, Row } from "react-bootstrap";
import { useFormContext } from "../../../../View/Modals/FormContext";
import { ModalBodyProps } from "../../../../View/Modals/ModalsTypes";
import { Security } from "../../../../../Typings/bussinesTypes";
import { SecurityStatusSelectFormElement } from "../../../../View/Modals/CommonFormComponents/StatusSelectors";
import { ErrorMessage, ValueInPLNInput } from "../../../../View/Modals/CommonFormComponents/GenericComponents";

export function SecurityModalBodyStatus({ initialData }: ModalBodyProps<Security>) {
    const {
        setValue,
        register,
        formState: { errors },
    } = useFormContext();

    useEffect(() => {
        setValue("status", initialData?.status || "", { shouldValidate: true });
    }, [initialData, setValue]);

    return <SecurityStatusSelectFormElement />;
}

export function SecurityModalBodyDescritpion({ initialData }: ModalBodyProps<Security>) {
    const {
        setValue,
        register,
        formState: { errors },
    } = useFormContext();

    useEffect(() => {
        setValue("description", initialData?.description || "", { shouldValidate: true });
    }, [initialData, setValue]);

    return (
        <Form.Group controlId="description">
            <Form.Label>Opis</Form.Label>
            <Form.Control
                as="textarea"
                rows={3}
                placeholder="Podaj opis"
                isValid={!errors?.description}
                isInvalid={!!errors?.description}
                {...register("description")}
            />
            <ErrorMessage errors={errors} name="description" />
        </Form.Group>
    );
}

export function SecurityModalBodyValue({ initialData }: ModalBodyProps<Security>) {
    const {
        setValue,
        register,
        formState: { errors },
    } = useFormContext();

    useEffect(() => {
        setValue("value", initialData?.value || "", { shouldValidate: true });
    }, [initialData, setValue]);

    return (
        <Form.Group controlId="valueInPLN">
            <Form.Label>Wartość</Form.Label>
            <ValueInPLNInput />
        </Form.Group>
    );
}

export function SecurityModalBodyDates({ initialData }: ModalBodyProps<Security>) {
    const {
        setValue,
        register,
        formState: { errors },
        trigger,
        watch,
    } = useFormContext();

    useEffect(() => {
        setValue(
            "firstPartExpiryDate",
            initialData?.firstPartExpiryDate || initialData?._contract.endDate || undefined,
            { shouldValidate: true }
        );
        setValue("secondPartExpiryDate", initialData?.secondPartExpiryDate || undefined, { shouldValidate: true });
    }, [initialData, setValue]);

    return (
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
    );
}
