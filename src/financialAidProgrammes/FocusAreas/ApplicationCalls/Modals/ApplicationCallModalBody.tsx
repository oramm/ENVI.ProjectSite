import React, { useEffect } from "react";
import { ErrorMessage, FocusAreaSelector } from "../../../../View/Modals/CommonFormComponents";
import { Form } from "react-bootstrap";
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
            focusAreaId: initialData?._focusArea?.focusAreaId,
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
                    isInvalid={!!errors?.description}
                    {...register("description")}
                />
                <ErrorMessage name="description" errors={errors} />
            </Form.Group>

            <Form.Group controlId="url">
                <Form.Label>URL</Form.Label>
                <Form.Control type="text" placeholder="Podaj URL" isInvalid={!!errors?.url} {...register("url")} />
                <ErrorMessage name="url" errors={errors} />
            </Form.Group>

            <Form.Group controlId="startDate">
                <Form.Label>Data rozpoczęcia</Form.Label>
                <Form.Control type="date" isInvalid={!!errors?.startDate} {...register("startDate")} />
                <ErrorMessage name="startDate" errors={errors} />
            </Form.Group>

            <Form.Group controlId="endDate">
                <Form.Label>Data zakończenia</Form.Label>
                <Form.Control type="date" isInvalid={!!errors?.endDate} {...register("endDate")} />
                <ErrorMessage name="endDate" errors={errors} />
            </Form.Group>

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

            <Form.Group controlId="focusAreaId">
                <Form.Label>Obszar interwencji</Form.Label>
                <FocusAreaSelector
                    repository={focusAreasRepository}
                    showValidationInfo={true}
                    {...register("focusAreaId")}
                />
                <ErrorMessage name="focusAreaId" errors={errors} />
            </Form.Group>
        </>
    );
}
