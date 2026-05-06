import React, { useEffect } from "react";
import { useFormContext } from "../../../View/Modals/FormContext";
import { ModalBodyProps } from "../../../View/Modals/ModalsTypes";
import { MilestoneDateData } from "../../../../Typings/bussinesTypes";
import { Col, Form, Row } from "react-bootstrap";
import { ErrorMessage } from "../../../View/Modals/CommonFormComponents/GenericComponents";
import { FieldErrors } from "react-hook-form";
import { hasError } from "../../../View/Resultsets/CommonComponentsController";

export function MilestoneDateModalBody(props: ModalBodyProps<MilestoneDateData>) {
    const { isEditing, initialData } = props;
    const {
        register,
        reset,
        setValue,
        formState: { dirtyFields, errors, isValid },
        trigger,
    } = useFormContext();

    useEffect(() => {
        const resetData: Partial<MilestoneDateData> = {
            id: initialData?.id,
            _milestone: initialData?._milestone,
            description: initialData?.description || "",
            startDate: initialData?.startDate.split("T")[0] || "",
            endDate: initialData?.endDate.split("T")[0] || "",
        };
        reset(resetData);
        trigger();
    }, [initialData, reset]);

    function hasAnyDateError(errors: FieldErrors): boolean {
        return hasError(errors, `startDate`) || hasError(errors, `endDate`);
    }

    return (
        <>
            <Form.Group controlId="description">
                <Form.Label>Opis</Form.Label>
                <Form.Control
                    as="textarea"
                    rows={2}
                    placeholder="Podaj opis do tego terminu"
                    isInvalid={!!errors?.description}
                    isValid={!errors?.description}
                    {...register("description")}
                />
                <ErrorMessage name="description" errors={errors} />
            </Form.Group>
            <Row className="mb-2">
                <Col>
                    <Form.Group controlId={`startDate`}>
                        <Form.Label>Data rozpoczęcia</Form.Label>
                        <Form.Control
                            type="date"
                            isInvalid={hasAnyDateError(errors)}
                            isValid={!hasAnyDateError(errors)}
                            {...register(`startDate`, { onChange: () => trigger(`endDate`) })}
                        />
                        <ErrorMessage name={`startDate`} errors={errors} />
                    </Form.Group>
                </Col>
                <Col>
                    <Form.Group controlId={`endDate`}>
                        <Form.Label>Data zakończenia</Form.Label>
                        <Form.Control
                            type="date"
                            isInvalid={hasAnyDateError(errors)}
                            isValid={!hasAnyDateError(errors)}
                            {...register(`endDate`, { onChange: () => trigger(`startDate`) })}
                        />
                        <ErrorMessage name={`endDate`} errors={errors} />
                    </Form.Group>
                </Col>
            </Row>
        </>
    );
}
