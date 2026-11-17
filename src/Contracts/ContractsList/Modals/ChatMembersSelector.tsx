import React, { useEffect, useState } from "react";
import { PersonData } from "../../../../Typings/bussinesTypes";
import { useFormContext } from "../../../View/Modals/FormContext";
import { Form } from "react-bootstrap";
import { PersonSelector } from "../../../View/Modals/CommonFormComponents/BussinesObjectSelectors";
import MainSetup from "../../../React/MainSetupReact";
import ToolsFetch from "../../../React/Tools/ToolsFetch";

export const CHAT_MEMBERS_FIELD = "_chatSpacePersons";

export function ChatMembersSelector({ contract = false, contractId }: { contract?: boolean; contractId?: number }) {
    const { watch, setValue } = useFormContext();
    const [loadedId, setLoadedId] = useState<number>();
    const [error, setError] = useState("");
    const persons = watch(CHAT_MEMBERS_FIELD) as PersonData[] | undefined;
    useEffect(() => {
        if (!contractId) return;
        let cancelled = false;
        setValue(CHAT_MEMBERS_FIELD, undefined);
        setValue("_selectedPersonIds", undefined);
        setLoadedId(undefined);
        setError("");
        ToolsFetch.fetchJsonWithSafeError(`${MainSetup.serverUrl}contract/${contractId}/selectedPersons`, { credentials: "include" })
            .then((selected: PersonData[]) => {
                if (!cancelled) {
                    setValue(CHAT_MEMBERS_FIELD, selected);
                    setLoadedId(contractId);
                }
            })
            .catch(() => { if (!cancelled) setError("Nie udało się wczytać dodatkowych osób. Zamknij i otwórz formularz ponownie. Zapis pozostałych danych nie zmieni tej listy."); });
        return () => { cancelled = true; };
    }, [contractId, setValue]);
    useEffect(() => {
        if (contract && persons !== undefined && (!contractId || loadedId === contractId))
            setValue("_selectedPersonIds", persons.map(person => person.id));
    }, [contract, contractId, loadedId, persons, setValue]);
    return (
        <Form.Group className="mt-2" controlId={`${CHAT_MEMBERS_FIELD}-asyncTypeahead`}>
            <Form.Label>{contract ? "Dodatkowe osoby przy kontrakcie" : "Osoby do zaproszenia"}</Form.Label>
            {contractId && loadedId !== contractId
                ? <div role={error ? "alert" : "status"}>{error || "Wczytywanie dodatkowych osób…"}</div>
                : <PersonSelector name={CHAT_MEMBERS_FIELD} multiple showValidationInfo={false}
                    filterBy={contractId ? person => !MainSetup.isProjectScopedRoleId(person.systemRoleId) : undefined} />}
            <Form.Text>{contract
                ? contractId ? "Wybrane osoby dostaną dostęp do skrzynki. Zmiana tej listy nie zmienia członków pokoju Google Chat."
                    : "Wybrane osoby dostaną dostęp do skrzynki. Jeśli zakładasz pokój Google Chat, zostaną też do niego zaproszone."
                : "Wyszukaj i wybierz do 50 osób. Zaproszenia trafią na adresy ich aktywnych kont Google w PS."}</Form.Text>
        </Form.Group>
    );
}
