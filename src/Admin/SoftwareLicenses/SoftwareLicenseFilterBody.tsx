import React from "react";
import { Form } from "react-bootstrap";
import { useFormContext } from "../../View/Modals/FormContext";

export function SoftwareLicensesFilterBody() {
    const { register } = useFormContext();
    return <Form.Group controlId="licenseSearchText">
        <Form.Label>Szukana fraza</Form.Label>
        <Form.Control placeholder="Producent, produkt, przypisanie lub uwagi" maxLength={255} {...register("searchText")} />
    </Form.Group>;
}
