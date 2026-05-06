import React, { useEffect } from "react";
import { Form } from "react-bootstrap";
import { useFormContext } from "../../../View/Modals/FormContext";
import { ModalBodyProps } from "../../../View/Modals/ModalsTypes";
import { Invoice } from "../../../../Typings/bussinesTypes";
import { ErrorMessage } from "../../../View/Modals/CommonFormComponents/GenericComponents";
import MainSetup from "../../../React/MainSetupReact";
import ToolsFetch from "../../../React/Tools/ToolsFetch";

export function InvoiceIssueModalBody({ initialData }: ModalBodyProps<Invoice>) {
    const {
        register,
        reset,
        setValue,
        formState: { errors },
        trigger,
    } = useFormContext();

    useEffect(() => {
        console.log("InvoiceModalBody useEffect", initialData);
        const resetData = {
            number: initialData?.number,
            sentDate: initialData?.sentDate || new Date().toISOString().slice(0, 10),
        };
        reset(resetData);
        trigger();
    }, [initialData, reset, trigger]);

    useEffect(() => {
        let isCancelled = false;

        async function loadNextNumber() {
            try {
                if (initialData?.number) {
                    return;
                }

                const response = await ToolsFetch.fetchWithRetry(
                    `${MainSetup.serverUrl}invoice/nextNumber`,
                    {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify({
                            year:
                                typeof initialData?.issueDate === "string"
                                    ? Number(initialData.issueDate.slice(0, 4))
                                    : undefined,
                        }),
                        credentials: "include",
                    }
                );

                const nextNumber = response?.number;
                if (!isCancelled && typeof nextNumber === "string" && nextNumber.trim()) {
                    setValue("number", nextNumber, {
                        shouldDirty: false,
                        shouldValidate: true,
                    });
                }
            } catch (error) {
                console.error("Nie udało się pobrać kolejnego numeru faktury", error);
            }
        }

        loadNextNumber();

        return () => {
            isCancelled = true;
        };
    }, [initialData?.id, initialData?.issueDate, initialData?.number, setValue]);

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
            <Form.Group controlId="sentDate" className="mt-3">
                <Form.Label>Data wysłania</Form.Label>
                <Form.Control
                    type="date"
                    isValid={!errors?.sentDate}
                    isInvalid={!!errors?.sentDate}
                    {...register("sentDate")}
                />
                <ErrorMessage name="sentDate" errors={errors} />
            </Form.Group>
        </>
    );
}
