import React, { useEffect } from "react";
import { Col, Form, Row } from "react-bootstrap";
import { useFormContext } from "../../View/Modals/FormContext";
import MainSetup from "../../React/MainSetupReact";
import { EntitySelector } from "../../View/Modals/CommonFormComponents/BussinesObjectSelectors";

/** Trzy zakresy listy (D-PER-7) w kolejności listy rozwijanej; pierwszy jest domyślny. */
export const STAFF_MEMBERS_SCOPES = ["permissions", "users", "all"] as const;
export type StaffMembersScope = (typeof STAFF_MEMBERS_SCOPES)[number];

/**
 * Nieznana wartość = zakres domyślny - dokładnie tak, jak rozstrzyga serwer. Skąd nieznane
 * wartości: przeglądarka pamięta kryteria filtra, więc po zamianie checkboxa na listę
 * rozwijaną (PER-7) w polu lądowało `false` z dawnego checkboxa, a po „Wyczyść" pusty string.
 * Lista była wtedy już „z uprawnieniami", a pole pokazywało pustkę (uwaga ownera, PER-8).
 */
export function normalizeStaffMembersScope(value: unknown): StaffMembersScope {
    return (STAFF_MEMBERS_SCOPES as readonly unknown[]).includes(value)
        ? (value as StaffMembersScope)
        : "permissions";
}

export function StaffMembersFilterBody() {
    const { register, watch, setValue } = useFormContext();
    const scope = watch("scope");

    // Pole ma pokazywać zakres, którego serwer faktycznie użyje - nigdy pustkę.
    useEffect(() => {
        const normalized = normalizeStaffMembersScope(scope);
        if (normalized !== scope) setValue("scope", normalized);
    }, [scope, setValue]);

    return (
        <Row xl={12} md={6} xs={12}>
            <Form.Group as={Col} md={3}>
                <Form.Label>Szukana fraza</Form.Label>
                <Form.Control type="text" placeholder="Imię, nazwisko lub e-mail" {...register("searchText")} />
            </Form.Group>

            <Form.Group as={Col} md={2}>
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

            <Form.Group as={Col} md={4}>
                <Form.Label>Podmiot</Form.Label>
                <EntitySelector name="_entities" multiple={true} showValidationInfo={false} />
            </Form.Group>

            {/* Trzy zakresy (D-PER-7, 2026-09-04): domyślnie osoby z nadanymi uprawnieniami -
                dawny widok panelu, do którego owner wrócił, gdy zakres „z kontem" pokazał mu
                domyślnie 180 osób. „Z kontem" dokłada każdego, kto może się logować (e-mail
                systemowy), „Wszystkie osoby" otwiera całą książkę adresową.

                Pierwsza opcja jest domyślna także po „Wyczyść" (formularz wraca do pierwszej
                pozycji), a serwer traktuje wszystko poza „users" i „all" jako „z uprawnieniami",
                więc pusty formularz nie otworzy listy szerzej przez przypadek. */}
            <Form.Group as={Col} md={3}>
                <Form.Label>Zakres</Form.Label>
                <Form.Select id="staffScope" {...register("scope")}>
                    <option value="permissions">Z uprawnieniami</option>
                    <option value="users">Z kontem</option>
                    <option value="all">Wszystkie osoby</option>
                </Form.Select>
            </Form.Group>
        </Row>
    );
}
