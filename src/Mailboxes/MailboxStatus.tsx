import React, { useEffect, useRef, useState } from "react";
import { Alert, Button, Form, Modal } from "react-bootstrap";
import { RepositoryDataItem } from "../../Typings/bussinesTypes";
import ConfirmModal from "../View/Modals/ConfirmModal";
import { ModalSaveCallback } from "../View/Modals/ModalsTypes";
import { fetchMailboxes, mailboxAction, MailboxCreationResult, MailboxRecord } from "./mailboxesService";

export function MailboxStatus({ initialMailbox, showInitialPassword = false }: {
    initialMailbox: MailboxRecord;
    showInitialPassword?: boolean;
}) {
    const [mailbox, setMailbox] = useState(initialMailbox);
    const [password, setPassword] = useState<string | null>(null);
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState("");
    const [confirming, setConfirming] = useState(false);
    const initialPasswordRequested = useRef(false);
    // Hasło wydaje PS (SKO): zmiana tylko po potwierdzeniu i bez hasła na ekranie.
    const managed = mailbox.passwordVersion != null;

    async function changePassword() {
        setBusy(true);
        setError("");
        setPassword(null);
        try {
            const result = await mailboxAction<{ password: string } | MailboxRecord>(mailbox.id, "password");
            // Skrzynkę mógł w międzyczasie przejąć PS - wtedy odpowiedź to sama skrzynka, bez hasła.
            if ("password" in result) setPassword(result.password); else setMailbox(result);
        } catch (error) {
            setError(error instanceof Error ? error.message : "Nie udało się zmienić hasła.");
        } finally { setBusy(false); }
    }

    useEffect(() => {
        if (showInitialPassword && mailbox.statusCode === "ACTIVE" && !managed && !initialPasswordRequested.current) {
            initialPasswordRequested.current = true;
            void changePassword();
        }
    }, [showInitialPassword, mailbox.id, mailbox.statusCode, managed]);

    async function act(action: "provision" | "project" | "agentCopy") {
        setBusy(true);
        setError("");
        setPassword(null);
        try {
            const updated = await mailboxAction<MailboxRecord>(mailbox.id, action);
            if (action === "provision" && updated.statusCode === "ACTIVE") initialPasswordRequested.current = true;
            setMailbox(updated);
            if (action === "provision" && updated.statusCode === "ACTIVE" && updated.passwordVersion == null) await changePassword();
        } catch (error) {
            setError(error instanceof Error ? error.message : "Nie udało się zapisać zmiany skrzynki.");
        } finally { setBusy(false); }
    }

    return (
        <div className="my-2">
            <div><strong>{mailbox.address}</strong></div>
            <div>{mailbox.statusCode === "ACTIVE" ? "Założona" : mailbox.statusCode === "PENDING"
                ? `Do założenia${mailbox.lastError ? `: ${mailbox.lastError}` : ""}` : "Nieaktywna"}{managed && " · hasło wydaje PS"}</div>
            {mailbox.statusCode === "ACTIVE" && mailbox.agentCopyStatus !== "NONE" && <div>
                {mailbox.agentCopyStatus === "SET" ? "Kopia dla agenta: ustawiona"
                    : `Kopia dla agenta nie ustawiona: ${mailbox.agentCopyLastError || "oczekuje na ustawienie"}`}
                {mailbox.agentCopyStatus !== "SET" && <> <Button size="sm" variant="outline-primary" disabled={busy}
                    onClick={() => void act("agentCopy")}>Ponów kopię</Button></>}
            </div>}
            <div className="d-flex gap-2 flex-wrap mt-1">
                {mailbox.statusCode === "PENDING" && <Button size="sm" variant="outline-primary" disabled={busy}
                    onClick={() => void act("provision")}>Ponów</Button>}
                {mailbox.statusCode === "ACTIVE" && <Button size="sm" variant="outline-primary" disabled={busy}
                    onClick={() => managed ? setConfirming(true) : void changePassword()}>Zmień hasło</Button>}
                {mailbox.contractId && <Button size="sm" variant="outline-secondary" disabled={busy}
                    onClick={() => void act("project")}>Przenieś skrzynkę do projektu</Button>}
            </div>
            {busy && <div role="status" className="small text-muted">Zapisuję zmianę skrzynki…</div>}
            {error && <Alert variant="warning" className="mt-2">{error}</Alert>}
            {password !== null && <Alert variant="warning" className="mt-2">
                <div>Zapisz teraz - PS go nie pamięta i nie pokaże ponownie</div>
                <Form.Control className="my-2" aria-label="Nowe hasło skrzynki" value={password} readOnly autoComplete="off" />
                <Button size="sm" variant="outline-secondary" onClick={() => setPassword(null)}>Ukryj hasło</Button>
            </Alert>}
            {confirming && <ConfirmModal show title={`Zmienić hasło ${mailbox.address}?`} confirmLabel="Zmień hasło"
                prompt={<><p>PS zmieni hasło na serwerze poczty i sam rozda nowe komputerom osób z dostępem.</p>
                    <p className="mb-0">Do ręcznego logowania weź nowe hasło od swojego agenta. Agent wkłada je do schowka.</p></>}
                onClose={() => setConfirming(false)}
                onConfirm={async () => setMailbox(await mailboxAction<MailboxRecord>(mailbox.id, "password"))} />}
        </div>
    );
}

export function MailboxesSection({ projectId, contractId }: { projectId?: number; contractId?: number }) {
    const [mailboxes, setMailboxes] = useState<MailboxRecord[]>([]);
    const [error, setError] = useState("");
    useEffect(() => {
        let cancelled = false;
        setMailboxes([]);
        setError("");
        if (!projectId && !contractId) return;
        fetchMailboxes({ projectId, contractId })
            .then(list => { if (!cancelled) setMailboxes(list); })
            .catch(() => { if (!cancelled) setError("Nie udało się odczytać skrzynek e-mail."); });
        return () => { cancelled = true; };
    }, [projectId, contractId]);
    return <section className="my-3" aria-label="Skrzynka e-mail">
        <strong>Skrzynka e-mail</strong>
        {mailboxes.map(mailbox => <MailboxStatus key={`${projectId ?? contractId}-${mailbox.id}`} initialMailbox={mailbox} />)}
        {error && <div className="text-warning">{error}</div>}
    </section>;
}

export function useMailboxConfirmation<T extends RepositoryDataItem>(onAddNew: ModalSaveCallback<T>) {
    const [result, setResult] = useState<MailboxCreationResult | null>(null);
    async function onSaved(object: T, submitted?: T) {
        const mailboxResult = object as T & MailboxCreationResult;
        if (mailboxResult._mailbox || mailboxResult._mailboxError) setResult(mailboxResult);
        await onAddNew(object, submitted);
    }
    const confirmation = result && <Modal show onHide={() => setResult(null)}>
        <Modal.Header closeButton><Modal.Title>Skrzynka e-mail po rejestracji</Modal.Title></Modal.Header>
        <Modal.Body>
            {result._mailbox && <MailboxStatus initialMailbox={result._mailbox} showInitialPassword={result._mailboxCreated} />}
            {result._mailboxError && <Alert variant="warning">{result._mailboxError}</Alert>}
        </Modal.Body>
        <Modal.Footer><Button onClick={() => setResult(null)}>Zamknij</Button></Modal.Footer>
    </Modal>;
    return { onSaved, confirmation };
}
