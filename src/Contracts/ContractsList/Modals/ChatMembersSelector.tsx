import React, { useEffect } from "react";
import { PersonData } from "../../../../Typings/bussinesTypes";
import { useFormContext } from "../../../View/Modals/FormContext";
import { Form } from "react-bootstrap";
import { PersonSelector } from "../../../View/Modals/CommonFormComponents/BussinesObjectSelectors";

export const CHAT_MEMBERS_FIELD = "_chatSpacePersons";

export function ChatMembersSelector({ contract = false }: { contract?: boolean }) {
    const { watch, setValue } = useFormContext();
    const persons = watch(CHAT_MEMBERS_FIELD) as PersonData[] | undefined;
    useEffect(() => {
        if (contract && persons !== undefined) setValue("_selectedPersonIds", persons.map(person => person.id));
    }, [contract, persons, setValue]);
    return (
        <Form.Group className="mt-2" controlId={`${CHAT_MEMBERS_FIELD}-asyncTypeahead`}>
            <Form.Label>{contract ? "Dodatkowe osoby przy kontrakcie" : "Osoby do zaproszenia"}</Form.Label>
            <PersonSelector name={CHAT_MEMBERS_FIELD} multiple showValidationInfo={false} />
            <Form.Text>{contract
                ? "Wybrane osoby dostaną dostęp do skrzynki. Jeśli zakładasz pokój Google Chat, zostaną też do niego zaproszone."
                : "Wyszukaj i wybierz do 50 osób. Zaproszenia trafią na adresy ich aktywnych kont Google w PS."}</Form.Text>
        </Form.Group>
    );
}
