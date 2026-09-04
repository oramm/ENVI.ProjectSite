import React from "react";
import { Badge } from "react-bootstrap";
import { FidmanUserSyncStatus } from "../../../Typings/bussinesTypes";

/**
 * Stan konta osoby w FIDmanie - z kolejki wysyłek, nie z checkboxa (D-PER-8, 2026-09-04).
 *
 * Checkbox „użytkownik FIDmana" mówi, czego chcieliśmy; ostatni wiersz kolejki mówi, co się
 * stało. Owner chciał widzieć to drugie: „wysłano" znaczy, że ostatni zapis konta w PS
 * dotarł do FIDmana, nie że FIDman ma dziś dokładnie te dane co PS (rozjazd powstaje po
 * edycji danych osoby w „Osobach" bez zapisu konta - synchronizacja nie jest okresowa).
 *
 * Plakietka jest tylko przy osobach z włączoną flagą. Wyjątek: flaga zgaszona, a wyłączenie
 * NIE doszło (błąd, pominięcie, albo w ogóle nie wysłano) - wtedy ostrzeżenie, bo konto
 * w FIDmanie nadal żyje i ktoś musi je wyłączyć ręcznie. Wyłączenie, które doszło, plakietki
 * nie dostaje - to stan normalny, nie informacja.
 */

type Variant = "success" | "secondary" | "danger" | "warning" | "light";

export type FidmanUserSyncView = {
    variant: Variant;
    /** Kolor tekstu plakietki (Bootstrap): ciemny na jasnych tłach. */
    text: "dark" | "light";
    label: string;
    /** Szczegół po najechaniu: co, kiedy, dlaczego. */
    title: string;
};

const TEXT_CLASS_BY_VARIANT: Record<Variant, string> = {
    success: "text-success",
    secondary: "text-muted",
    danger: "text-danger",
    warning: "text-warning-emphasis",
    light: "text-muted",
};

export function formatFidmanSyncDate(iso: string | null): string {
    if (!iso) return "data nieznana";
    const date = new Date(iso);
    if (Number.isNaN(date.getTime())) return "data nieznana";
    return date.toLocaleString("pl-PL", { dateStyle: "short", timeStyle: "short" });
}

function describeByStatus(sync: FidmanUserSyncStatus, when: string, disabling: boolean): FidmanUserSyncView {
    const what = disabling ? "wyłączenie" : null;
    switch (sync.status) {
        case "SENT":
            return {
                variant: "success",
                text: "light",
                label: disabling ? "FIDman: wyłączono" : "FIDman: wysłano",
                title: disabling
                    ? `Wyłączenie konta dotarło do FIDmana ${when}.`
                    : `Konto w FIDmanie założone albo zaktualizowane ${when}.`,
            };
        case "PENDING":
            return {
                variant: "secondary",
                text: "light",
                label: what ? `FIDman: ${what} oczekuje` : "FIDman: oczekuje",
                title: `W kolejce od ${when}; serwer ponawia wysyłkę co minutę.`,
            };
        case "FAILED":
            return {
                variant: "danger",
                text: "light",
                label: what ? `FIDman: błąd ${what === "wyłączenie" ? "wyłączenia" : what}` : "FIDman: błąd",
                title: `${sync.lastError ?? "Błąd wysyłki"} (próba ${sync.attempts}, ${when}). Po 10 nieudanych próbach serwer przestaje ponawiać.`,
            };
        case "SKIPPED":
        default:
            return {
                variant: "warning",
                text: "dark",
                label: what ? `FIDman: ${what} pominięte` : "FIDman: pominięto",
                title: `${sync.skipReasonLabel ?? sync.skipReason ?? "FIDman pominął tę wysyłkę"} (${when}).`,
            };
    }
}

/** Czysta reguła: co pokazać dla flagi i ostatniej wysyłki. `null` = nic. */
export function describeFidmanUserSync(enabled: boolean, sync: FidmanUserSyncStatus | null): FidmanUserSyncView | null {
    if (!sync) {
        if (!enabled) return null;
        return {
            variant: "light",
            text: "dark",
            label: "FIDman: nie wysłano",
            title: "Flaga jest włączona, ale w kolejce nie ma żadnej wysyłki - konto w FIDmanie nie powstało tą drogą.",
        };
    }
    const when = formatFidmanSyncDate(sync.updatedAt);
    const disabling = sync.requestedEnabled === false;

    if (!enabled) {
        if (disabling && sync.status === "SENT") return null;
        if (!disabling)
            return {
                variant: "warning",
                text: "dark",
                label: "FIDman: wyłączenie nie wysłane",
                title: `Ostatnia wysyłka (${when}) włączała konto, a wyłączenia nie wysłano - konto w FIDmanie trzeba wyłączyć ręcznie.`,
            };
        return describeByStatus(sync, when, true);
    }
    return describeByStatus(sync, when, disabling);
}

export function FidmanUserSyncBadge({
    enabled,
    sync,
    className,
}: {
    enabled: boolean;
    sync: FidmanUserSyncStatus | null | undefined;
    className?: string;
}) {
    const view = describeFidmanUserSync(enabled, sync ?? null);
    if (!view) return null;
    return (
        <Badge bg={view.variant} text={view.text} className={className} title={view.title} data-testid="fidman-sync-badge">
            {view.label}
        </Badge>
    );
}

/** Linia pod checkboxem w modalu uprawnień - ten sam stan, pełnym zdaniem. */
export function FidmanUserSyncLine({
    enabled,
    sync,
}: {
    enabled: boolean;
    sync: FidmanUserSyncStatus | null | undefined;
}) {
    const view = describeFidmanUserSync(enabled, sync ?? null);
    if (!view) return null;
    return (
        <div className={`small mt-1 ${TEXT_CLASS_BY_VARIANT[view.variant]}`} data-testid="fidman-sync-line">
            Ostatnia wysyłka do FIDmana: {view.label.replace(/^FIDman: /, "")}. {view.title}
        </div>
    );
}
