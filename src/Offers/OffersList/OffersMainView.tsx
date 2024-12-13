import React, { useEffect, useState } from "react";
import { Accordion, Container } from "react-bootstrap";
import OffersSearch from "./OffersSearch";
import { AccordionEventKey } from "react-bootstrap/esm/AccordionContext";
import { ShowMailsToCheckButton } from "./MailInvitations/Modals/MailsModalButtons";
import MailInvitationsList from "./MailInvitations/MailInvitationsList";

export default function OffersMainView({ title }: { title: string }) {
    const [mails, setMails] = useState([]);
    const [activeKeys, setActiveKeys] = useState<string[]>([]);

    useEffect(() => {
        document.title = title;
    }, [title]);

    useEffect(() => {
        setActiveKeys(mails.length > 0 ? ["0", "1"] : ["1"]);
    }, [mails]);

    function handleSelect(eventKey: AccordionEventKey) {
        if (typeof eventKey !== "string") return;

        setActiveKeys((prevActiveKeys) =>
            prevActiveKeys.includes(eventKey)
                ? prevActiveKeys.filter((key) => key !== eventKey)
                : [...prevActiveKeys, eventKey]
        );
    }

    return (
        <>
            <Container>
                <Accordion className="mt-3 mb-3" activeKey={activeKeys} onSelect={handleSelect}>
                    <Accordion.Item eventKey="0">
                        <Accordion.Header>
                            <h3>Oczekujące maile z zaproszeniami</h3> <ShowMailsToCheckButton />
                        </Accordion.Header>
                        <Accordion.Body>
                            <MailInvitationsList />
                        </Accordion.Body>
                    </Accordion.Item>
                </Accordion>
            </Container>
            <OffersSearch title="Oferty" />
        </>
    );
}
