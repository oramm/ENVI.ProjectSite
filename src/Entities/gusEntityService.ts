/**
 * GUS-4b — wołanie tras GUS z ekranu. Wzorzec wstrzykiwanego `fetcher` przepisany
 * z ./Modals/gusLookupService.ts, żeby test nie potrzebował sieci.
 *
 * Backend (PS-nodeJS, src/entities/EntitiesRouters.ts):
 *   POST entities/:id/gus/check            — pyta rejestr, zapisuje SAM werdykt
 *   POST entities/:id/gus/accept {fields}  — przepisuje z migawki wskazane pola
 *   POST entities/gus/sweep {limit}        — jedna partia przebiegu (bramka panelu)
 *   GET  entities/gus/report               — pięć list do sprzątania (bramka panelu)
 */
import MainSetup from "../React/MainSetupReact";
import { GusStatus } from "./EntitiesBadges";

export type GusAcceptableField = "name" | "address" | "regon" | "krs";

export const GUS_ACCEPTABLE_FIELDS: GusAcceptableField[] = ["name", "address", "regon", "krs"];

/** To, co rejestr powiedział przy ostatnim sprawdzeniu (Entities.GusSnapshot). */
export type GusSnapshot = {
    name?: string;
    address?: string;
    regon?: string;
    krs?: string;
    closedAt?: string;
};

export type GusDifferenceKind = "MATERIAL" | "WORDING";

export type GusDifference = {
    field: GusAcceptableField;
    inPs: string;
    inGus: string;
    kind: GusDifferenceKind;
};

export type GusCheckResponse = {
    ok: true;
    id: number;
    status: GusStatus;
    checkedAt: string;
    snapshot: GusSnapshot | null;
    differences: GusDifference[];
};

export type GusAcceptResponse = {
    ok: true;
    id: number;
    applied: GusAcceptableField[];
    status: GusStatus;
    differences: GusDifference[];
};

export type GusSweepSummary = {
    checked: number;
    byStatus: Record<string, number>;
    remaining: number;
    aborted: boolean;
    abortReason?: string;
};

export type GusReportEntity = {
    id: number;
    name: string | null;
    taxNumber: string | null;
    gusStatus: GusStatus | null;
    gusCheckedAt: string | null;
};

export type GusDuplicateGroup = {
    nip: string;
    entities: GusReportEntity[];
};

export type GusReport = {
    duplicateNips: GusDuplicateGroup[];
    withoutNip: GusReportEntity[];
    closed: GusReportEntity[];
    diff: GusReportEntity[];
    diffMinor: GusReportEntity[];
};

async function callServer<T>(path: string, init: RequestInit, fetcher: typeof fetch): Promise<T> {
    const response = await fetcher(`${MainSetup.serverUrl}${path}`, {
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        ...init,
    });

    if (!response.ok) {
        const msg = await response
            .json()
            .then((body: { error?: string }) => body?.error)
            .catch(() => undefined);
        throw new Error(msg || `Błąd wywołania GUS: ${response.status}`);
    }
    return response.json() as Promise<T>;
}

export async function checkEntityInGus(entityId: number, fetcher: typeof fetch = fetch): Promise<GusCheckResponse> {
    return callServer<GusCheckResponse>(`entities/${entityId}/gus/check`, { method: "POST" }, fetcher);
}

export async function acceptGusFields(
    entityId: number,
    fields: GusAcceptableField[],
    fetcher: typeof fetch = fetch
): Promise<GusAcceptResponse> {
    return callServer<GusAcceptResponse>(
        `entities/${entityId}/gus/accept`,
        { method: "POST", body: JSON.stringify({ fields }) },
        fetcher
    );
}

export async function runGusSweepBatch(limit?: number, fetcher: typeof fetch = fetch): Promise<GusSweepSummary> {
    return callServer<GusSweepSummary>(
        "entities/gus/sweep",
        { method: "POST", body: JSON.stringify(limit ? { limit } : {}) },
        fetcher
    );
}

export async function fetchGusReport(fetcher: typeof fetch = fetch): Promise<GusReport> {
    return callServer<GusReport>("entities/gus/report", { method: "GET" }, fetcher);
}

/**
 * Zapora na pętlę przebiegu. Serwer ma własną (100 partii w runGusSweepUntilDone),
 * ale ekran woła trasę partia po partii, więc musi mieć swoją — inaczej błąd
 * w warunku kolejki po stronie serwera zamienia otwartą kartę w nieskończone
 * odpytywanie rejestru GUS (limit jest wspólny z FIDmanem, pułapka P-4).
 */
export const GUS_SWEEP_MAX_PASSES = 100;

export type GusSweepProgress = {
    passes: number;
    checked: number;
    remaining: number;
    /** Ile podmiotów było w kolejce, gdy przebieg ruszał — mianownik paska postępu. */
    total: number;
};

export type GusSweepLoopResult = GusSweepProgress & {
    byStatus: Record<string, number>;
    aborted: boolean;
    abortReason?: string;
};

/**
 * Pętla po `remaining`: woła partie, aż kolejka się wyczerpie.
 *
 * Przerywa nie tylko na `remaining === 0`, ale też gdy partia nie ruszyła ani jednego
 * podmiotu (`checked === 0`) i gdy serwer sam zgłosi przerwanie — bez tego rekord,
 * którego z jakiegoś powodu nie da się odhaczyć, kręciłby pętlę w kółko.
 */
export async function runGusSweepLoop(
    onProgress: (progress: GusSweepProgress) => void,
    runBatch: (limit?: number) => Promise<GusSweepSummary> = (limit) => runGusSweepBatch(limit)
): Promise<GusSweepLoopResult> {
    const byStatus: Record<string, number> = {};
    let passes = 0;
    let checked = 0;
    let remaining = 0;
    let total = 0;

    while (passes < GUS_SWEEP_MAX_PASSES) {
        const batch = await runBatch();
        passes += 1;
        checked += batch.checked;
        remaining = batch.remaining;
        if (passes === 1) total = batch.checked + batch.remaining;
        for (const [status, count] of Object.entries(batch.byStatus ?? {}))
            byStatus[status] = (byStatus[status] ?? 0) + count;

        onProgress({ passes, checked, remaining, total });

        if (batch.aborted) return { passes, checked, remaining, total, byStatus, aborted: true, abortReason: batch.abortReason };
        if (batch.remaining === 0 || batch.checked === 0) break;
    }

    const hitTheGuard = remaining > 0 && passes >= GUS_SWEEP_MAX_PASSES;
    return {
        passes,
        checked,
        remaining,
        total,
        byStatus,
        aborted: hitTheGuard,
        abortReason: hitTheGuard
            ? `Przerwano po ${GUS_SWEEP_MAX_PASSES} partiach, w kolejce zostało ${remaining} podmiotów`
            : undefined,
    };
}
