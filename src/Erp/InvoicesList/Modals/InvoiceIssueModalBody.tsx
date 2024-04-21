import React, { useEffect } from "react";
import { Form } from "react-bootstrap";
import { useFormContext } from "../../../View/Modals/FormContext";
import { ModalBodyProps } from "../../../View/Modals/ModalsTypes";
import { Invoice } from "../../../../Typings/bussinesTypes";
import { ErrorMessage, FileInput } from "../../../View/Modals/CommonFormComponents/GenericComponents";

export function InvoiceIssueModalBody({ initialData }: ModalBodyProps<Invoice>) {
    const {
        register,
        reset,
        setValue,
        watch,
        formState: { dirtyFields, errors, isValid },
        trigger,
    } = useFormContext();

    useEffect(() => {
        console.log("InvoiceModalBody useEffect", initialData);
        const resetData = {
            number: initialData?.number,
        };
        reset(resetData);
        trigger();
    }, [initialData, reset]);

    return (
        <>
            <Form.Group controlId="number">
                <Form.Label>Numer</Form.Label>
                <Form.Control
                    as="input"
                    isValid={!errors?.number}
                    isInvalid={!!errors?.number}
                    {...register("number")}
                />
                <ErrorMessage name="number" errors={errors} />
            </Form.Group>
            <Form.Group controlId="file">
                <Form.Label>Plik</Form.Label>
                <FileInput
                    acceptedFileTypes="application/msword, application/vnd.ms-excel, application/pdf"
                    {...register("file")}
                    multiple={false}
                />
            </Form.Group>
        </>
    );
}
