import React from "react";
import { AccessSource, AreaAccess } from "./accessOverviewApi";

const SOURCE_TONE: Record<AccessSource, string> = {
    rola: "bg-primary-subtle text-primary-emphasis",
    przypisanie: "bg-success-subtle text-success-emphasis",
    wyjątek: "bg-info-subtle text-info-emphasis",
};

/** Skąd osoba ma dostęp - ta sama plakietka w przeglądzie, widoku osoby i podglądzie. */
export function SourcePill({ source }: { source: AccessSource | null }) {
    if (!source) return <span className="text-muted">—</span>;
    return <span className={`badge rounded-pill fw-normal ${SOURCE_TONE[source]}`}>{source}</span>;
}

export function SeesPill({ access }: { access: AreaAccess }) {
    return access.sees ? (
        <span className="badge rounded-pill fw-normal bg-success-subtle text-success-emphasis">widzi</span>
    ) : (
        <span className="badge rounded-pill fw-normal bg-secondary-subtle text-secondary-emphasis">nie widzi</span>
    );
}

export function SourceLegend() {
    return (
        <div className="small text-muted d-flex flex-wrap gap-3 align-items-center">
            <b>Skąd:</b>
            <span><SourcePill source="rola" /> wynika z kręgu osoby</span>
            <span><SourcePill source="przypisanie" /> z przypisania do projektu albo kontraktu</span>
            <span><SourcePill source="wyjątek" /> dodane ręcznie, ponad przypisanie</span>
        </div>
    );
}
