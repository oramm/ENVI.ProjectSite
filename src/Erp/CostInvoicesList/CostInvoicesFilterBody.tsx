import React, { useEffect, useState } from "react";
import { Col, Form, Row } from "react-bootstrap";
import { useFormContext } from "../../View/Modals/FormContext";
import { DateRangeInput } from "../../View/Modals/CommonFormComponents/GenericComponents";
import { CostInvoiceStatuses, fetchCategories } from "./CostInvoicesController";
import { CostInvoiceCategory } from "../../../Typings/bussinesTypes";

export function CostInvoicesFilterBody() {
    const { register } = useFormContext();
    const [categories, setCategories] = useState<CostInvoiceCategory[]>([]);

    useEffect(() => {
        fetchCategories().then(setCategories).catch(console.error);
    }, []);

    return (
        <Row>
            <Form.Group as={Col} sm={12} md={3}>
                <Form.Label>Szukana fraza</Form.Label>
                <Form.Control type="text" placeholder="Nr faktury, dostawca" {...register("searchText")} />
            </Form.Group>
            <Form.Group as={Col} sm={12} md={3}>
                <Form.Label>NIP dostawcy</Form.Label>
                <Form.Control type="text" placeholder="NIP" {...register("supplierNip")} />
            </Form.Group>
            <DateRangeInput
                as={Col}
                sm={12}
                md={3}
                label="Data faktury"
                fromName="dateFrom"
                toName="dateTo"
                showValidationInfo={false}
            />
            <Form.Group as={Col} sm={12} md={2}>
                <Form.Label>Status</Form.Label>
                <Form.Select {...register("status")}>
                    <option value="">Wszystkie</option>
                    {Object.entries(CostInvoiceStatuses).map(([key, value]) => (
                        <option key={key} value={value}>
                            {value === "NEW"
                                ? "Nowa"
                                : value === "EXCLUDED"
                                ? "Poza kosztami"
                                : value === "BOOKED"
                                ? "Zaksięgowana"
                                : value}
                        </option>
                    ))}
                </Form.Select>
            </Form.Group>
            <Form.Group as={Col} sm={12} md={3} className="mt-2">
                <Form.Label>Kategoria</Form.Label>
                <Form.Select {...register("categoryId")}>
                    <option value="">Wszystkie kategorie</option>
                    {categories.map((cat) => (
                        <option key={cat.id} value={cat.id}>
                            {cat.name}
                        </option>
                    ))}
                </Form.Select>
            </Form.Group>
        </Row>
    );
}
