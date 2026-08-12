import React from "react";
import { Col, Form, Row } from "react-bootstrap";
import { useFormContext } from "../../View/Modals/FormContext";
import MainSetup from "../../React/MainSetupReact";

export function StaffMembersFilterBody() {
    const { register } = useFormContext();

    return (
        <Row xl={12} md={6} xs={12}>
            <Form.Group as={Col} md={4}>
                <Form.Label>Szukana fraza</Form.Label>
                <Form.Control type="text" placeholder="Imię, nazwisko lub e-mail" {...register("searchText")} />
            </Form.Group>

            <Form.Group as={Col} md={3}>
                <Form.Label>Rola systemowa</Form.Label>
                <Form.Select {...register("systemRoleId")}>
                    <option value="">Wszystkie</option>
                    {Object.entries(MainSetup.SystemRoles).map(([roleName, role]: [string, any]) => (
                        <option key={role.id} value={role.id}>
                            {roleName}
                        </option>
                    ))}
                </Form.Select>
            </Form.Group>

            {/* Wyłączone (także po wyczyszczeniu filtrów) = tylko personel z nadanymi
                uprawnieniami. Zaznaczenie dokłada osoby, które nie mają jeszcze wiersza. */}
            <Form.Group as={Col} md={4} className="d-flex align-items-end">
                <Form.Check
                    type="checkbox"
                    label="Pokaż osoby bez uprawnień"
                    id="staffIncludeWithoutPermissions"
                    {...register("includeWithoutPermissions")}
                />
            </Form.Group>
        </Row>
    );
}
