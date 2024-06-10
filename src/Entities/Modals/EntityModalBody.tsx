import React, { useEffect } from "react";
import { Form } from "react-bootstrap";
import { useFormContext } from "../../View/Modals/FormContext";
import { ModalBodyProps } from "../../View/Modals/ModalsTypes";
import { EntityData } from "../../../Typings/bussinesTypes";
import { ErrorMessage } from "../../View/Modals/CommonFormComponents/GenericComponents";

export function EntityModalBody({ isEditing, initialData }: ModalBodyProps<EntityData>) {
    const {
        register,
        reset,
        formState: { dirtyFields, errors, isValid },
        trigger,
    } = useFormContext();

    useEffect(() => {
        const resetData: any = {
            name: initialData?.name,
            address: initialData?.address,
            taxNumber: initialData?.taxNumber,
            www: initialData?.www,
            email: initialData?.email,
            phone: initialData?.phone,
        };
        reset(resetData);
        trigger();
    }, [initialData, reset]);

    return (
        <>
            <Form.Group controlId="name">
                <Form.Label>Nazwa</Form.Label>
                <Form.Control
                    as="textarea"
                    rows={2}
                    placeholder="Podaj nazwę"
                    isInvalid={!!errors?.name}
                    isValid={!errors?.name}
                    {...register("name")}
                />
                <ErrorMessage name="name" errors={errors} />
            </Form.Group>

            <Form.Group controlId="address">
                <Form.Label>Adres</Form.Label>
                <Form.Control
                    placeholder="Podaj adres"
                    isInvalid={!!errors?.address}
                    isValid={!errors?.address}
                    {...register("address")}
                />
                <ErrorMessage name="address" errors={errors} />
            </Form.Group>

            <Form.Group controlId="taxNumber">
                <Form.Label>NIP</Form.Label>
                <Form.Control
                    placeholder="Podaj numer podatkowy"
                    isInvalid={!!errors?.taxNumber}
                    isValid={!errors?.taxNumber}
                    {...register("taxNumber")}
                />
                <ErrorMessage name="taxNumber" errors={errors} />
            </Form.Group>

            <Form.Group controlId="www">
                <Form.Label>WWW</Form.Label>
                <Form.Control
                    placeholder="Podaj adres strony www"
                    isInvalid={!!errors?.www}
                    isValid={!errors?.www}
                    {...register("www")}
                />
                <ErrorMessage name="www" errors={errors} />
            </Form.Group>

            <Form.Group controlId="email">
                <Form.Label>Email</Form.Label>
                <Form.Control
                    type="email"
                    placeholder="Podaj adres email"
                    isInvalid={!!errors?.email}
                    isValid={!errors?.email}
                    {...register("email")}
                />
                <ErrorMessage name="email" errors={errors} />
            </Form.Group>

            <Form.Group controlId="phone">
                <Form.Label>Telefon</Form.Label>
                <Form.Control
                    placeholder="Podaj numer telefonu"
                    isInvalid={!!errors?.phone}
                    isValid={!errors?.phone}
                    {...register("phone")}
                />
                <ErrorMessage name="phone" errors={errors} />
            </Form.Group>
        </>
    );
}
