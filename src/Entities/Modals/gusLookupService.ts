/**
 * NIP-G1 — "Pobierz z GUS" lookup for the Entity form. Injectable-fetcher
 * pattern, mirrors ./../../Contracts/ContractsList/Modals/fidmanSyncService.ts.
 *
 * Backend: PS-nodeJS POST /entities/lookup-nip (src/entities/EntitiesRouters.ts)
 *   400 - bad NIP checksum
 *   503 - GUS lookup not configured (BLOCKED until gate G-N1, GUS_BIR_KEY unset)
 *   404 - NIP not found in GUS registry
 * Response `{ name, address, regon, krs }` — address is already concatenated
 * server-side. Od GUS-1 REGON i KRS mają w PS własne kolumny (Entities.Regon,
 * Entities.Krs — migracja src/entities/migrations/002_add_regon_krs_gus_status.sql),
 * więc formularz je zapisuje, zamiast wyrzucać.
 */
import MainSetup from "../../React/MainSetupReact";

export type GusLookupResult = {
    name: string;
    address: string;
    regon?: string;
    krs?: string;
};

export async function lookupNip(nip: string, fetcher: typeof fetch = fetch): Promise<GusLookupResult> {
    const response = await fetcher(`${MainSetup.serverUrl}entities/lookup-nip`, {
        method: "POST",
        credentials: "include",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ nip }),
    });

    if (!response.ok) {
        const msg = await response
            .json()
            .then((body: { error?: string }) => body?.error)
            .catch(() => undefined);
        throw new Error(msg || `Błąd wyszukiwania GUS: ${response.status}`);
    }

    return response.json() as Promise<GusLookupResult>;
}
