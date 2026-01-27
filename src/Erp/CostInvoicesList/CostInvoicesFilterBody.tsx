import React from "react";
import { Col, Form, Row } from "react-bootstrap";
import { useFormContext } from "../../View/Modals/FormContext";
import { DateRangeInput } from "../../View/Modals/CommonFormComponents/GenericComponents";
import { CostInvoiceStatuses, CostCategories } from "./CostInvoicesController";

export function CostInvoicesFilterBody() {
    const { register } = useFormContext();

    return (
        <Row>
            <Form.Group as={Col} sm={12} md={4}>
                <Form.Label>Szukana fraza</Form.Label>
                <Form.Control type="text" placeholder="Wpisz tekst" {...register("searchText")} />
            </Form.Group>
            <DateRangeInput
                as={Col}
                sm={12}
                md={4}
                label="Data faktury"
                fromName="issueDateFrom"
                toName="issueDateTo"
                showValidationInfo={false}
            />
            <Form.Group as={Col} sm={12} md={2}>
                <Form.Label>Status</Form.Label>
                <Form.Select {...register("status")}>
                    <option value="">Wszystkie</option>
                    {Object.entries(CostInvoiceStatuses).map(([key, value]) => (
                        <option key={key} value={value}>
                            {value}
                        </option>
                    ))}
                </Form.Select>
            </Form.Group>
            <Form.Group as={Col} sm={12} md={2}>
                <Form.Label>Kategoria kosztu</Form.Label>
                <Form.Select {...register("costCategory")}>
                    <option value="">Wszystkie</option>
                    {Object.entries(CostCategories).map(([key, value]) => (
                        <option key={key} value={value}>
                            {value}
                        </option>
                    ))}
                </Form.Select>
            </Form.Group>
            <Form.Group as={Col} sm={12} md={3} className="mt-2">
                <Form.Check
                    type="checkbox"
                    label="Tylko do kosztów"
                    {...register("onlyCompanyCosts")}
                />
            </Form.Group>
            <Form.Group as={Col} sm={12} md={3} className="mt-2">
                <Form.Check
                    type="checkbox"
                    label="Tylko niezapłacone"
                    {...register("onlyUnpaid")}
                />
            </Form.Group>
        </Row>
    );
}
