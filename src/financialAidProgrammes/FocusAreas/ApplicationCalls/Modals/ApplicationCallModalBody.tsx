import React, { useEffect } from "react";
import { ErrorMessage, FocusAreaSelector } from "../../../../View/Modals/CommonFormComponents";
import { Col, Form, Row } from "react-bootstrap";
import { useFormContext } from "../../../../View/Modals/FormContext";
import { ModalBodyProps } from "../../../../View/Modals/ModalsTypes";
import { ApplicationCallData, FocusAreaData } from "../../../../../Typings/bussinesTypes";
import { focusAreasRepository } from "../../FocusAreasController";

export function ApplicationCallModalBody({ isEditing, initialData }: ModalBodyProps<ApplicationCallData>) {
    const {
        register,
        reset,
        formState: { errors },
        trigger,
    } = useFormContext();

    useEffect(() => {
        const resetData: any = {
            _focusArea: initialData?._focusArea,
            description: initialData?.description,
            url: initialData?.url,
            startDate: initialData?.startDate,
            endDate: initialData?.endDate,
            status: initialData?.status,
        };
        reset(resetData);
        trigger();
    }, [initialData, reset, trigger]);

    return (
        <>
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

            <Form.Group controlId="url">
                <Form.Label>URL</Form.Label>
                <Form.Control
                    type="text"
                    placeholder="Podaj URL"
                    isValid={!errors.url}
                    isInvalid={!!errors?.url}
                    {...register("url")}
                />
                <ErrorMessage name="url" errors={errors} />
            </Form.Group>
            <Row>
                <Form.Group as={Col} controlId="startDate">
                    <Form.Label>Data rozpoczęcia</Form.Label>
                    <Form.Control
                        type="date"
                        isValid={!errors.startDate}
                        isInvalid={!!errors?.startDate}
                        {...register("startDate")}
                    />
                    <ErrorMessage name="startDate" errors={errors} />
                </Form.Group>

                <Form.Group as={Col} controlId="endDate">
                    <Form.Label>Data zakończenia</Form.Label>
                    <Form.Control
                        type="date"
                        isValid={!errors.endDate}
                        isInvalid={!!errors?.endDate}
                        {...register("endDate")}
                    />
                    <ErrorMessage name="endDate" errors={errors} />
                </Form.Group>
            </Row>

            <Form.Group controlId="status">
                <Form.Label>Status</Form.Label>
                <Form.Control
                    type="text"
                    placeholder="Podaj status"
                    isInvalid={!!errors?.status}
                    {...register("status")}
                />
                <ErrorMessage name="status" errors={errors} />
            </Form.Group>

            <Form.Group controlId="_focusArea">
                <Form.Label>Obszar interwencji</Form.Label>
                <FocusAreaSelector repository={focusAreasRepository} showValidationInfo={true} />
            </Form.Group>
        </>
    );
}
