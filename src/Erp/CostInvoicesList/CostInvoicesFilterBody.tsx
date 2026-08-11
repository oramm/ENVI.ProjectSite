import React from "react";
import { Col, Form, Row } from "react-bootstrap";
import { useFormContext } from "../../View/Modals/FormContext";
import { DateRangeInput } from "../../View/Modals/CommonFormComponents/GenericComponents";
import { paymentMethodFilterOptions, paymentStatusFilterOptions } from "./costInvoicePaymentFilters";

export function CostInvoicesFilterBody() {
    const { register } = useFormContext();

    return (
        <Row className="g-3 cost-invoices-filter-grid">
            <Form.Group as={Col} sm={12} md={4}>
                <Form.Label>Szukana fraza</Form.Label>
                <Form.Control type="text" placeholder="Nr faktury, dostawca" {...register("searchText")} />
            </Form.Group>
            <Form.Group as={Col} sm={12} md={2}>
                <Form.Label>NIP dostawcy</Form.Label>
                <Form.Control type="text" placeholder="NIP" {...register("supplierNip")} />
            </Form.Group>
            <DateRangeInput
                as={Col}
                sm={12}
                md={6}
                label="Data faktury"
                fromName="dateFrom"
                toName="dateTo"
                showValidationInfo={false}
            />
            <Form.Group as={Col} sm={12} md={3}>
                <Form.Label>Stan platnosci</Form.Label>
                <Form.Select {...register("paymentStatus")}>
                    <option value="">Wszystkie</option>
                    {paymentStatusFilterOptions.map(({ value, label }) => (
                        <option key={value} value={value}>
                            {label}
                        </option>
                    ))}
                </Form.Select>
            </Form.Group>
            <Form.Group as={Col} sm={12} md={3}>
                <Form.Label>Forma platnosci</Form.Label>
                <Form.Select {...register("paymentMethod")}>
                    <option value="">Wszystkie</option>
                    {paymentMethodFilterOptions.map(({ value, label }) => (
                        <option key={value} value={value}>
                            {label}
                        </option>
                    ))}
                </Form.Select>
            </Form.Group>
        </Row>
    );
}
