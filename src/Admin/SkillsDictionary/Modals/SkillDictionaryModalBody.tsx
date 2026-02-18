import React, { useEffect } from "react";
import { Form } from "react-bootstrap";
import { SkillDictionaryRecord } from "../../../../Typings/bussinesTypes";
import { ErrorMessage } from "../../../View/Modals/CommonFormComponents/GenericComponents";
import { useFormContext } from "../../../View/Modals/FormContext";
import { ModalBodyProps } from "../../../View/Modals/ModalsTypes";

export function SkillDictionaryModalBody({ initialData }: ModalBodyProps<SkillDictionaryRecord>) {
    const {
        register,
        reset,
        formState: { errors },
        trigger,
    } = useFormContext();

    useEffect(() => {
        reset({
            name: initialData?.name || "",
            description: initialData?.description || "",
        });
        trigger();
    }, [initialData, reset, trigger]);

    return (
        <>
            <Form.Group controlId="name">
                <Form.Label>Nazwa</Form.Label>
                <Form.Control
                    type="text"
                    placeholder="Podaj nazwe specjalizacji"
                    isInvalid={!!errors?.name}
                    isValid={!errors?.name}
                    {...register("name")}
                />
                <ErrorMessage name="name" errors={errors} />
            </Form.Group>

            <Form.Group controlId="description" className="mt-3">
                <Form.Label>Opis (opcjonalnie)</Form.Label>
                <Form.Control
                    as="textarea"
                    rows={3}
                    placeholder="Podaj opis specjalizacji"
                    isInvalid={!!errors?.description}
                    isValid={!errors?.description}
                    {...register("description")}
                />
                <ErrorMessage name="description" errors={errors} />
            </Form.Group>
        </>
    );
}
