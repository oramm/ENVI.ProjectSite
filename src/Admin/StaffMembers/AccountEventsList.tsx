import React, { useEffect, useState } from "react";
import { PersonAccountEventData } from "../../../Typings/bussinesTypes";
import { fetchPersonAccountEvents } from "../../Persons/personsV2Helpers";
import MainSetup from "../../React/MainSetupReact";

/**
 * ROD-3: sekcja „Ostatnie zmiany konta" w modalu uprawnień - kto, kiedy i co zmienił
 * w koncie osoby. Sam odczyt; zdarzenia pisze backend w transakcji zmiany.
 *
 * Etykiety zależą od PARY (rodzaj zdarzenia, pole), bo `isActive` znaczy co innego w koncie
 * (logowanie) i w panelu (widoczność w scrumie - decyzja ownera D-ROD-3).
 */
const FIELD_LABELS: Record<string, string> = {
    "ACCOUNT.systemRoleId": "Rola",
    "ACCOUNT.systemEmail": "E-mail logowania",
    "ACCOUNT.isActive": "Konto aktywne",
    "ACCOUNT.fidmanEnabled": "Użytkownik FIDmana",
    "PROJECT_ASSIGNMENTS.projectOurIds": "Zakres projektów",
    "STAFF_FLAGS.isDriver": "Kierowca",
    "STAFF_FLAGS.isInScrum": "W scrumie",
    "STAFF_FLAGS.hasCostInvoiceAccess": "Faktury kosztowe",
    "STAFF_FLAGS.hasBankAccess": "Wyciągi bankowe",
    "STAFF_FLAGS.canLogSiteVisits": "Wizyty na budowie",
    "STAFF_FLAGS.isActive": "Aktywny (panel)",
};

export type AccountEventView = {
    when: string;
    who: string;
    what: string;
    before: string;
    after: string;
};

/** Numer roli -> nazwa roli ze słownika MainSetup; gdy słownika brak, zostaje numer. */
function roleName(id: unknown): string {
    try {
        const roles: Record<string, { id?: number | string }> = (MainSetup as any)?.SystemRoles ?? {};
        const hit = Object.entries(roles).find(([, role]) => Number(role?.id) === Number(id));
        return hit ? hit[0] : String(id);
    } catch {
        return String(id);
    }
}

function formatValue(raw: string | null | undefined, field: string): string {
    if (raw === null || raw === undefined) return "—";
    let value: unknown;
    try {
        value = JSON.parse(raw);
    } catch {
        return raw;
    }
    if (value === null) return "—";
    if (typeof value === "boolean") return value ? "tak" : "nie";
    if (Array.isArray(value)) return value.length ? value.join(", ") : "brak";
    if (field === "systemRoleId") return roleName(value);
    return String(value);
}

/** Reguła „co pokazać" - osobno, żeby dało się ją testować bez renderowania. */
export function describeAccountEvent(event: PersonAccountEventData): AccountEventView {
    const key = `${event.eventType}.${event.field}`;
    const who = [event._editorName, event._editorSurname].filter(Boolean).join(" ") || "—";
    const when = event._createdAt ? new Date(event._createdAt).toLocaleString("pl-PL") : "—";
    return {
        when,
        who,
        what: FIELD_LABELS[key] ?? event.field,
        before: formatValue(event.valueBefore, event.field),
        after: formatValue(event.valueAfter, event.field),
    };
}

export function AccountEventsList({ personId }: { personId?: number }) {
    const [events, setEvents] = useState<PersonAccountEventData[] | null>(null);
    const [failed, setFailed] = useState(false);

    useEffect(() => {
        if (!personId) {
            setEvents([]);
            return;
        }
        let cancelled = false;
        setEvents(null);
        setFailed(false);
        fetchPersonAccountEvents(personId)
            .then((list) => {
                if (!cancelled) setEvents(list);
            })
            .catch(() => {
                if (cancelled) return;
                setFailed(true);
                setEvents([]);
            });
        return () => {
            cancelled = true;
        };
    }, [personId]);

    return (
        <div className="mt-3" data-testid="account-events">
            <hr />
            <h6>Ostatnie zmiany konta</h6>
            {failed && <div className="text-danger small">Nie udało się pobrać historii zmian.</div>}
            {events === null && !failed && <div className="text-muted small">Wczytywanie…</div>}
            {events !== null && events.length === 0 && !failed && (
                <div className="text-muted small">Brak zapisanych zmian.</div>
            )}
            {events !== null && events.length > 0 && (
                <ul className="list-unstyled small mb-0" style={{ maxHeight: 220, overflowY: "auto" }}>
                    {events.map((event) => {
                        const view = describeAccountEvent(event);
                        return (
                            <li key={event.id ?? `${event._createdAt}-${event.field}`} className="mb-1">
                                <span className="text-muted">{view.when}</span> · <strong>{view.who}</strong> · {view.what}:{" "}
                                <span className="text-muted">{view.before}</span> → <span>{view.after}</span>
                            </li>
                        );
                    })}
                </ul>
            )}
        </div>
    );
}
