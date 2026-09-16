import React, { useEffect, useRef, useState } from "react";
import { Alert, Button, Form, Modal, Spinner } from "react-bootstrap";
import MainSetup from "../../React/MainSetupReact";
import { licenseRequest } from "./SoftwareLicensesController";
import { SoftwareLicenseData } from "./SoftwareLicenseTypes";

export function SoftwareLicenseKey({ license }: { license: SoftwareLicenseData }) {
    const [open, setOpen] = useState(false);
    const [key, setKey] = useState<string | null>(null);
    const [failed, setFailed] = useState(false);
    const request = useRef<AbortController | null>(null);
    const generation = useRef(0);
    const admin = MainSetup.currentUserOrNull?.systemRoleName === "ADMIN";
    function hide() {
        generation.current++;
        request.current?.abort();
        request.current = null;
        setKey(null);
        setOpen(false);
    }
    // A user event, not an effect: StrictMode must not duplicate an audited disclosure.
    async function reveal() {
        if (request.current || !admin) return;
        const controller = new AbortController();
        request.current = controller;
        const current = ++generation.current;
        setKey(null); setFailed(false); setOpen(true);
        try {
            const result = await licenseRequest(`admin/softwareLicense/${license.id}/reveal-key`, "POST", undefined, controller.signal);
            if (generation.current !== current) return;
            if (MainSetup.currentUserOrNull?.systemRoleName === "ADMIN" && typeof result.licenseKey === "string") setKey(result.licenseKey);
            else setFailed(true);
        } catch { if (generation.current === current) setFailed(true); }
    }
    useEffect(() => () => { generation.current++; request.current?.abort(); }, []);
    useEffect(() => {
        if (!open) return;
        const visibility = () => { if (document.hidden) hide(); };
        const timer = window.setTimeout(hide, 30000);
        window.addEventListener("blur", hide);
        window.addEventListener("pagehide", hide);
        document.addEventListener("visibilitychange", visibility);
        return () => {
            window.clearTimeout(timer);
            window.removeEventListener("blur", hide);
            window.removeEventListener("pagehide", hide);
            document.removeEventListener("visibilitychange", visibility);
        };
    }, [open]);
    return <div onClick={event => event.stopPropagation()}>
        {license.hasLicenseKey ? <>
            <span aria-label="Klucz zasłonięty">••••••••</span>
            {admin && <Button size="sm" variant="outline-secondary" className="ms-2" onClick={reveal}>Pokaż</Button>}
        </> : <span className="text-muted">Brak klucza</span>}
        {open && admin && <Modal show onHide={hide}>
            <Modal.Header closeButton><Modal.Title>Klucz licencyjny</Modal.Title></Modal.Header>
            <Modal.Body>
                {failed ? <Alert variant="danger">Nie można odsłonić klucza. Sprawdź połączenie i uprawnienia.</Alert>
                    : key === null ? <Spinner animation="border" role="status"><span className="visually-hidden">Ładowanie klucza</span></Spinner>
                    : <Form.Control as="textarea" readOnly aria-label="Klucz licencyjny" value={key} rows={4} autoComplete="off" spellCheck={false} />}
                <p className="text-muted mt-3 mb-0">Klucz zostanie ukryty po 30 sekundach lub opuszczeniu okna. Odsłonięcie jest rejestrowane.</p>
            </Modal.Body>
            <Modal.Footer><Button onClick={hide}>Ukryj</Button></Modal.Footer>
        </Modal>}
    </div>;
}
