import RepositoryReact from "../../React/RepositoryReact";
import MainSetup from "../../React/MainSetupReact";
import ToolsFetch from "../../React/Tools/ToolsFetch";
import { SoftwareLicenseData, publicLicense } from "./SoftwareLicenseTypes";

// No retry or diagnostic payload: writes may contain a secret and reveal is audited.
export async function licenseRequest(path: string, method: string, body?: unknown, signal?: AbortSignal) {
    try {
        const response = await fetch(MainSetup.serverUrl + path, {
            method, credentials: "include", cache: "no-store", signal,
            headers: { "Content-Type": "application/json" },
            body: body === undefined ? undefined : JSON.stringify(body),
        });
        if (response.status === 401) ToolsFetch.notifySessionExpired();
        if (!response.ok) throw new Error();
        return await response.json();
    } catch {
        throw new Error("Nie można wykonać operacji na licencjach. Sprawdź połączenie i uprawnienia. Przed ponowieniem zapisu odśwież listę.");
    }
}

class SoftwareLicensesRepository extends RepositoryReact<SoftwareLicenseData> {
    async loadItemsFromServerPOST(orConditions: unknown[] = []) {
        const items: SoftwareLicenseData[] = await licenseRequest("admin/softwareLicenses", "POST", { orConditions });
        this.items = items.map(publicLicense);
        this.currentItems = [];
        this.saveToSessionStorage();
        return this.items;
    }

    async saveLicense(data: Record<string, unknown>, id?: number): Promise<SoftwareLicenseData> {
        const item = publicLicense(await licenseRequest(
            "admin/softwareLicense" + (id === undefined ? "" : "/" + id),
            id === undefined ? "POST" : "PUT", data,
        ));
        if (id === undefined) this.items.push(item);
        else this.replaceItemById(id, item);
        this.currentItems = [item];
        this.saveToSessionStorage();
        return item;
    }
}

export const softwareLicensesRepository = new SoftwareLicensesRepository({
    name: "softwareLicenses",
    actionRoutes: { getRoute: "admin/softwareLicenses", addNewRoute: "admin/softwareLicense",
        editRoute: "admin/softwareLicense", deleteRoute: "admin/softwareLicense" },
});
