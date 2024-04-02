import React, { useEffect } from "react";
import { ErrorMessage, FinancialAidProgrammeSelector } from "../../../View/Modals/CommonFormComponents";
import { Form } from "react-bootstrap";
import { useFormContext } from "../../../View/Modals/FormContext";
import { ModalBodyProps } from "../../../View/Modals/ModalsTypes";
import { FocusAreaData } from "../../../../Typings/bussinesTypes";
import { financialAidProgrammesRepository } from "../../FinancialAidProgrammesController";

export function FocusAreaModalBody({ isEditing, initialData }: ModalBodyProps<FocusAreaData>) {
    const {
        register,
        reset,
        formState: { errors },
        trigger,
    } = useFormContext();

    useEffect(() => {
        const resetData: any = {
            name: initialData?.name,
            alias: initialData?.alias,
            description: initialData?.description,
            _programme: initialData?._programme,
        };
        reset(resetData);
        trigger();
    }, [initialData, reset, trigger]);

    return (
        <>
            <Form.Group controlId="name">
                <Form.Label>Nazwa</Form.Label>
                <Form.Control
                    type="text"
                    placeholder="Podaj nazwę"
                    isValid={!errors?.name}
                    isInvalid={!!errors?.name}
                    {...register("name")}
                />
                <ErrorMessage name="name" errors={errors} />
            </Form.Group>
            <Form.Group controlId="alias">
                <Form.Label>Alias</Form.Label>
                <Form.Control
                    type="text"
                    placeholder="Podaj alias"
                    isValid={!errors?.alias}
                    isInvalid={!!errors?.alias}
                    {...register("alias")}
                />
                <ErrorMessage name="alias" errors={errors} />
            </Form.Group>
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
                <ErrorMessage name="description" errors={errors} />
            </Form.Group>

            <Form.Group controlId="_programme">
                <Form.Label>Program wsparcia</Form.Label>
                <FinancialAidProgrammeSelector
                    repository={financialAidProgrammesRepository}
                    showValidationInfo={true}
                />
            </Form.Group>
        </>
    );
}
