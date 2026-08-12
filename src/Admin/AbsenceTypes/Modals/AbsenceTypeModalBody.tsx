import React, { useEffect } from "react";
import { Col, Form, Row } from "react-bootstrap";
import { useFormContext } from "../../../View/Modals/FormContext";
import { ModalBodyProps } from "../../../View/Modals/ModalsTypes";
import { AbsenceTypeData } from "../../../../Typings/bussinesTypes";
import { ErrorMessage } from "../../../View/Modals/CommonFormComponents/GenericComponents";

export function AbsenceTypeModalBody({ isEditing, initialData }: ModalBodyProps<AbsenceTypeData>) {
    const {
        register,
        reset,
        formState: { errors },
        trigger,
    } = useFormContext();

    useEffect(() => {
        const resetData: any = {
            name: initialData?.name ?? "",
            color: initialData?.color ?? "#0d6efd",
            countsAgainstLimit: initialData?.countsAgainstLimit ?? true,
            countsAsCare: initialData?.countsAsCare ?? false,
        };
        reset(resetData);
        trigger();
    }, [initialData, reset]);

    const usageCount = initialData?._usageCount ?? 0;

    return (
        <>
            <Row>
                <Form.Group as={Col} md={8} controlId="name">
                    <Form.Label>Nazwa</Form.Label>
                    <Form.Control placeholder="np. Wypoczynkowy" isInvalid={!!errors?.name} {...register("name")} />
                    <ErrorMessage name="name" errors={errors} />
                </Form.Group>

                <Form.Group as={Col} md={4} controlId="color">
                    <Form.Label>Kolor</Form.Label>
                    <Form.Control type="color" title="Wybierz kolor" {...register("color")} />
                    <ErrorMessage name="color" errors={errors} />
                </Form.Group>
            </Row>

            <hr />

            <Form.Group controlId="countsAgainstLimit">
                <Form.Check type="switch" label="Schodzi z limitu urlopu" {...register("countsAgainstLimit")} />
            </Form.Group>

            <Form.Group controlId="countsAsCare" className="mt-2">
                <Form.Check type="switch" label="Schodzi z puli opieki" {...register("countsAsCare")} />
            </Form.Group>

            <Form.Text muted className="d-block mt-2">
                Te dwa przełączniki są regułą, a nie opisem - kod wylicza na ich podstawie, z której puli schodzi
                nieobecność.
                {isEditing && usageCount > 0 && (
                    <>
                        {" "}
                        Ten typ jest użyty <strong>{usageCount}</strong> raz(y), więc zmiana przeliczy salda wstecz.
                    </>
                )}
            </Form.Text>
        </>
    );
}
