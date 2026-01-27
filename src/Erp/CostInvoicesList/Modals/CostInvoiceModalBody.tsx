import React, { useEffect } from "react";
import { Col, Form, Row } from "react-bootstrap";
import { useFormContext } from "../../../View/Modals/FormContext";
import { ModalBodyProps } from "../../../View/Modals/ModalsTypes";
import { CostInvoice } from "../../../../Typings/bussinesTypes";
import { CostInvoiceStatuses, CostCategories } from "../CostInvoicesController";
import { ErrorMessage } from "../../../View/Modals/CommonFormComponents/GenericComponents";
import { ContractSelector } from "../../../View/Modals/CommonFormComponents/BussinesObjectSelectors";

export function CostInvoiceModalBody({ isEditing, initialData }: ModalBodyProps<CostInvoice>) {
    const {
        register,
        reset,
        formState: { errors },
        trigger,
    } = useFormContext();

    useEffect(() => {
        const resetData = {
            status: initialData?.status || CostInvoiceStatuses.NEW,
            isCompanyCost: initialData?.isCompanyCost ?? true,
            isPaid: initialData?.isPaid ?? false,
            paidDate: initialData?.paidDate || null,
            paymentDeadline: initialData?.paymentDeadline || null,
            costCategory: initialData?.costCategory || "",
            comment: initialData?.comment || "",
            _contract: initialData?._contract || null,
        };
        reset(resetData);
        trigger();
    }, [initialData, reset, trigger]);

    return (
        <>
            {/* Informacje o fakturze - tylko do odczytu */}
            <div className="bg-light p-3 rounded mb-3">
                <h6>Dane faktury z KSeF</h6>
                <Row>
                    <Col md={6}>
                        <strong>Numer:</strong> {initialData?.number}
                    </Col>
                    <Col md={6}>
                        <strong>Data:</strong> {initialData?.issueDate}
                    </Col>
                </Row>
                <Row className="mt-2">
                    <Col md={12}>
                        <strong>Kontrahent:</strong> {initialData?.sellerName} (NIP: {initialData?.sellerNip})
                    </Col>
                </Row>
                <Row className="mt-2">
                    <Col md={4}>
                        <strong>Netto:</strong> {initialData?.netValue} zł
                    </Col>
                    <Col md={4}>
                        <strong>VAT:</strong> {initialData?.vatValue} zł
                    </Col>
                    <Col md={4}>
                        <strong>Brutto:</strong> {initialData?.grossValue} zł
                    </Col>
                </Row>
                <Row className="mt-2">
                    <Col md={12}>
                        <strong>Nr KSeF:</strong>{" "}
                        <code className="small">{initialData?.ksefNumber}</code>
                    </Col>
                </Row>
            </div>

            {/* Pola edytowalne */}
            <Row>
                <Form.Group as={Col} md={6} controlId="status">
                    <Form.Label>Status weryfikacji</Form.Label>
                    <Form.Select
                        isValid={!errors.status}
                        isInvalid={!!errors.status}
                        {...register("status")}
                    >
                        {Object.entries(CostInvoiceStatuses).map(([key, value]) => (
                            <option key={key} value={value}>
                                {value}
                            </option>
                        ))}
                    </Form.Select>
                    <ErrorMessage errors={errors} name="status" />
                </Form.Group>

                <Form.Group as={Col} md={6} controlId="costCategory">
                    <Form.Label>Kategoria kosztu</Form.Label>
                    <Form.Select {...register("costCategory")}>
                        <option value="">-- Wybierz kategorię --</option>
                        {Object.entries(CostCategories).map(([key, value]) => (
                            <option key={key} value={value}>
                                {value}
                            </option>
                        ))}
                    </Form.Select>
                </Form.Group>
            </Row>

            <Row className="mt-3">
                <Form.Group as={Col} md={6} controlId="isCompanyCost">
                    <Form.Check
                        type="switch"
                        id="isCompanyCost"
                        label="Faktura jest kosztem firmy"
                        {...register("isCompanyCost")}
                    />
                    <Form.Text className="text-muted">
                        Zaznacz, jeśli faktura ma być uwzględniona w kosztach firmy
                    </Form.Text>
                </Form.Group>

                <Form.Group as={Col} md={6} controlId="isPaid">
                    <Form.Check
                        type="switch"
                        id="isPaid"
                        label="Faktura została zapłacona"
                        {...register("isPaid")}
                    />
                </Form.Group>
            </Row>

            <Row className="mt-3">
                <Form.Group as={Col} md={6} controlId="paymentDeadline">
                    <Form.Label>Termin płatności</Form.Label>
                    <Form.Control type="date" {...register("paymentDeadline")} />
                </Form.Group>

                <Form.Group as={Col} md={6} controlId="paidDate">
                    <Form.Label>Data zapłaty</Form.Label>
                    <Form.Control type="date" {...register("paidDate")} />
                </Form.Group>
            </Row>

            <Form.Group controlId="_contract" className="mt-3">
                <Form.Label>Powiązany kontrakt (opcjonalnie)</Form.Label>
                <ContractSelector name="_contract" typesToInclude="our" showValidationInfo={false} />
                <Form.Text className="text-muted">
                    Możesz powiązać fakturę z kontraktem
                </Form.Text>
            </Form.Group>

            <Form.Group controlId="comment" className="mt-3">
                <Form.Label>Komentarz / Notatka</Form.Label>
                <Form.Control
                    as="textarea"
                    rows={3}
                    placeholder="Dodaj komentarz do faktury..."
                    {...register("comment")}
                />
            </Form.Group>
        </>
    );
}
