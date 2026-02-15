import React, { useEffect } from "react";
import { Form } from "react-bootstrap";
import { ContractMeetingNoteData } from "../../../../../../Typings/bussinesTypes";
import { ModalBodyProps } from "../../../../../View/Modals/ModalsTypes";
import { useFormContext } from "../../../../../View/Modals/FormContext";
import { ErrorMessage } from "../../../../../View/Modals/CommonFormComponents/GenericComponents";

export function MeetingNoteModalBody({ isEditing, initialData, contextData }: ModalBodyProps<ContractMeetingNoteData>) {
    const {
        register,
        reset,
        formState: { errors },
        trigger,
    } = useFormContext();

    useEffect(() => {
        const resetData = {
            contractId: contextData,
            title: initialData?.title || "",
            meetingDate: initialData?.meetingDate || new Date().toISOString().slice(0, 10),
        };
        reset(resetData);
        trigger();
    }, [initialData, reset]);

    return (
        <>
            <Form.Group controlId="title">
                <Form.Label>Nazwa / temat spotkania</Form.Label>
                <Form.Control
                    as="textarea"
                    rows={2}
                    placeholder="Podaj temat spotkania"
                    isInvalid={!!errors?.title}
                    isValid={!errors?.title}
                    {...register("title")}
                />
                <ErrorMessage name="title" errors={errors} />
            </Form.Group>
            <Form.Group controlId="meetingDate">
                <Form.Label>Data spotkania</Form.Label>
                <Form.Control
                    type="date"
                    isValid={!errors?.meetingDate}
                    isInvalid={!!errors?.meetingDate}
                    {...register("meetingDate")}
                />
                <ErrorMessage name="meetingDate" errors={errors} />
            </Form.Group>
        </>
    );
}
