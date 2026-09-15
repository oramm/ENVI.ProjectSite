import React, { useEffect, useState } from "react";
import { personPrivacyStatus, PersonPrivacyStatus } from "../../Privacy/privacyApi";

export default function StaffPrivacyStatus({ personId }: { personId: number }) {
    const [status, setStatus] = useState<PersonPrivacyStatus | null>(null);
    const [failed, setFailed] = useState(false);
    const [attempt, setAttempt] = useState(0);
    useEffect(() => {
        let cancelled = false;
        setStatus(null); setFailed(false);
        personPrivacyStatus(personId).then(value => {
            if (!cancelled) setStatus(value);
        }).catch(() => { if (!cancelled) setFailed(true); });
        return () => { cancelled = true; };
    }, [personId, attempt]);
    return <div className="mt-2 small" aria-live="polite">
        <strong>Informacja o danych osobowych w PS</strong>
        <div>
            {failed ? <span className="text-danger">Nie udało się pobrać statusu. <button type="button" className="btn btn-link btn-sm p-0" onClick={() => setAttempt(value => value + 1)}>Spróbuj ponownie</button></span>
                : !status ? <span className="text-muted">Wczytywanie statusu...</span>
                : status.status === "missing" ? <span className="text-muted">Brak potwierdzenia zapoznania się.</span>
                : <>
                    {status.status === "confirmed" ? "Potwierdzono zapoznanie się: " : "Wymagane ponowne potwierdzenie. Poprzednie: "}
                    <time dateTime={status.acknowledgedAt}>{new Intl.DateTimeFormat("pl-PL", {
                        dateStyle: "short", timeStyle: "short", timeZone: "Europe/Warsaw",
                    }).format(new Date(status.acknowledgedAt))}</time>.
                </>}
        </div>
    </div>;
}
