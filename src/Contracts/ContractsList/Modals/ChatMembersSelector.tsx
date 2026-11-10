import React from "react";
import { Form } from "react-bootstrap";
import { PersonSelector } from "../../../View/Modals/CommonFormComponents/BussinesObjectSelectors";

export const CHAT_MEMBERS_FIELD = "_chatSpacePersons";

export function ChatMembersSelector() {
    return (
        <Form.Group className="mt-2" controlId={`${CHAT_MEMBERS_FIELD}-asyncTypeahead`}>
            <Form.Label>Osoby do zaproszenia</Form.Label>
            <PersonSelector name={CHAT_MEMBERS_FIELD} multiple showValidationInfo={false} />
            <Form.Text>Wyszukaj i wybierz do 50 osób. Zaproszenia trafią na adresy ich aktywnych kont Google w PS.</Form.Text>
        </Form.Group>
    );
}
