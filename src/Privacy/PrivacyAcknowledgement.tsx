import React, { useEffect, useState } from "react";
import { Alert, Button, Container, Form } from "react-bootstrap";
import { PrivacyNotice, PrivacyStatus } from "./privacyApi";
import PrivacyNoticeSections from "./PrivacyNoticeSections";

export default function PrivacyAcknowledgement({ load, acknowledge, onContinue, onLogout, logoutLabel = "Wyloguj się" }: {
    load: () => Promise<PrivacyStatus>;
    acknowledge: (notice: PrivacyNotice) => Promise<PrivacyStatus>;
    onContinue?: () => void;
    onLogout?: () => Promise<void>;
    logoutLabel?: string;
}) {
    const [status, setStatus] = useState<PrivacyStatus | null>(null);
    const [checked, setChecked] = useState(false);
    const [busy, setBusy] = useState(true);
    const [error, setError] = useState("");
    async function refresh() {
        setBusy(true); setError(""); setChecked(false); setStatus(null);
        try {
            const next = await load();
            setStatus(next);
            if (next.acknowledged) onContinue?.();
        } catch { setError("Nie udało się pobrać informacji. Sprawdź połączenie i spróbuj ponownie."); }
        finally { setBusy(false); }
    }
    useEffect(() => { void refresh(); }, [load]);
    async function confirm() {
        if (!checked || !status || busy) return;
        setBusy(true); setError("");
        try {
            const next = await acknowledge(status.notice);
            if (!next.acknowledged) throw new Error();
            setStatus(next); onContinue?.();
        } catch (err) {
            setChecked(false);
            if ((err as { status?: number }).status === 409) {
                await refresh();
                setError("Informacja została zmieniona. Zapoznaj się z aktualną treścią i potwierdź ponownie.");
            } else setError("Nie udało się zapisać potwierdzenia. Spróbuj ponownie.");
        } finally { setBusy(false); }
    }
    return <Container className="py-4" style={{ maxWidth: 850 }}>
        <h1 className="h4 mb-3">{status?.notice.title || "Prywatność i dane osobowe"}</h1>
        {busy && <p role="status">Trwa ładowanie...</p>}
        {error && <Alert variant="danger">{error}</Alert>}
        {!status && !busy && <Button onClick={refresh}>Spróbuj ponownie</Button>}
        {status && <>
            {onContinue && <p>Przed przejściem dalej zapoznaj się z poniższą informacją. Potwierdzenie zapamiętamy, aby nie pytać przy kolejnej wizycie.</p>}
            <PrivacyNoticeSections sections={status.notice.sections} />
            {onContinue && <>
                <Form.Check id="privacy-acknowledgement" checked={checked} disabled={busy} onChange={e => setChecked(e.target.checked)}
                    label="Potwierdzam zapoznanie się z informacją o przetwarzaniu danych osobowych." />
                <Button className="mt-3" disabled={!checked || busy} onClick={confirm}>Przejdź dalej</Button>
            </>}
        </>}
        <div className="mt-4 d-flex gap-3 align-items-center flex-wrap">
            <a href="mailto:biuro@envi.com.pl">Kontakt z biurem</a>
            {onLogout && <Button variant="outline-secondary" disabled={busy} onClick={async () => {
                try { await onLogout(); } catch { setError("Nie udało się wylogować. Spróbuj ponownie."); }
            }}>{logoutLabel}</Button>}
        </div>
    </Container>;
}
