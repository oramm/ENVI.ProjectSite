import React, { useEffect } from "react";
import { Col, Form, Row } from "react-bootstrap";
import { useFormContext } from "../../../View/Modals/FormContext";
import { ModalBodyProps } from "../../../View/Modals/ModalsTypes";
import { CarData } from "../../../../Typings/bussinesTypes";
import { ErrorMessage } from "../../../View/Modals/CommonFormComponents/GenericComponents";

export function CarModalBody({ isEditing, initialData }: ModalBodyProps<CarData>) {
    const {
        register,
        reset,
        formState: { errors },
        trigger,
    } = useFormContext();

    useEffect(() => {
        const resetData: any = {
            brand: initialData?.brand ?? "",
            model: initialData?.model ?? "",
            licensePlateNumber: initialData?.licensePlateNumber ?? "",
            mileageSpreadsheetId: initialData?.mileageSpreadsheetId ?? "",
            mileageSheetGid: initialData?.mileageSheetGid ?? "",
            // Nowe auto domyślnie aktywne - inaczej po dodaniu znikałoby z listy.
            isActive: initialData?.isActive ?? true,
            comment: initialData?.comment ?? "",
        };
        reset(resetData);
        trigger();
    }, [initialData, reset]);

    return (
        <>
            <Row>
                <Form.Group as={Col} md={6} controlId="brand">
                    <Form.Label>Marka</Form.Label>
                    <Form.Control
                        placeholder="np. Ford"
                        isInvalid={!!errors?.brand}
                        {...register("brand")}
                    />
                    <ErrorMessage name="brand" errors={errors} />
                </Form.Group>

                <Form.Group as={Col} md={6} controlId="model">
                    <Form.Label>Model</Form.Label>
                    <Form.Control placeholder="np. Focus" isInvalid={!!errors?.model} {...register("model")} />
                    <ErrorMessage name="model" errors={errors} />
                </Form.Group>
            </Row>

            <Form.Group controlId="licensePlateNumber" className="mt-2">
                <Form.Label>Numer rejestracyjny</Form.Label>
                <Form.Control
                    placeholder="np. OP 1001A"
                    isInvalid={!!errors?.licensePlateNumber}
                    {...register("licensePlateNumber")}
                />
                <ErrorMessage name="licensePlateNumber" errors={errors} />
                <Form.Text muted>Musi być unikalny. Zapisywany wielkimi literami.</Form.Text>
            </Form.Group>

            <hr />

            <Row>
                <Form.Group as={Col} md={8} controlId="mileageSpreadsheetId">
                    <Form.Label>Arkusz kilometrówki</Form.Label>
                    <Form.Control
                        placeholder="Identyfikator arkusza Google"
                        isInvalid={!!errors?.mileageSpreadsheetId}
                        {...register("mileageSpreadsheetId")}
                    />
                    <ErrorMessage name="mileageSpreadsheetId" errors={errors} />
                </Form.Group>

                <Form.Group as={Col} md={4} controlId="mileageSheetGid">
                    <Form.Label>Numer zakładki</Form.Label>
                    <Form.Control
                        placeholder="np. 118273"
                        isInvalid={!!errors?.mileageSheetGid}
                        {...register("mileageSheetGid")}
                    />
                    <ErrorMessage name="mileageSheetGid" errors={errors} />
                </Form.Group>
            </Row>
            <Form.Text muted>
                Bez obu tych pól auto nie pojawi się w kilometrówce, nawet jeśli jest aktywne.
            </Form.Text>

            <hr />

            <Form.Group controlId="isActive">
                <Form.Check
                    type="switch"
                    label="Aktywny"
                    {...register("isActive")}
                />
                <Form.Text muted>
                    Wycofanie auta z użytku to wyłączenie tej opcji, nie usunięcie wpisu - historia przejazdów
                    w arkuszu zostaje nienaruszona.
                </Form.Text>
            </Form.Group>

            <Form.Group controlId="comment" className="mt-3">
                <Form.Label>Uwagi</Form.Label>
                <Form.Control as="textarea" rows={2} isInvalid={!!errors?.comment} {...register("comment")} />
                <ErrorMessage name="comment" errors={errors} />
            </Form.Group>
        </>
    );
}
