import React, { useEffect } from "react";
import { Form } from "react-bootstrap";
import { useFormContext } from "../../../View/Modals/FormContext";
import { ModalBodyProps } from "../../../View/Modals/ModalsTypes";
import { City } from "../../../../Typings/bussinesTypes";
import { ErrorMessage } from "../../../View/Modals/CommonFormComponents/GenericComponents";

export function CityModalBody({ isEditing, initialData }: ModalBodyProps<City>) {
    const {
        register,
        reset,
        formState: { dirtyFields, errors, isValid },
        trigger,
    } = useFormContext();

    useEffect(() => {
        const resetData: any = {
            name: initialData?.name,
            code: initialData?.code,
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

            <Form.Group controlId="code">
                <Form.Label>Oznaczenie</Form.Label>
                <Form.Control
                    placeholder="Podaj adres"
                    isInvalid={!!errors?.code}
                    isValid={!errors?.code}
                    {...register("code")}
                />
                <ErrorMessage name="code" errors={errors} />
            </Form.Group>
        </>
    );
}
