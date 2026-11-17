import React from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MilestoneData } from "../../Typings/bussinesTypes";
import MainSetup from "../React/MainSetupReact";
import { milestoneTypesRepository } from "../Contracts/ContractsList/ContractsController";
import MilestoneSharingAction, { MilestoneSharingContractsContext } from "./MilestoneSharingAction";
import { ContractsWithChildren } from "./TasksGlobalTypes";

const milestone = {
    id: 4889,
    _type: { id: 5 },
    _contract: { id: 1974, ourId: "TEST/SOURCE" },
} as MilestoneData;
const contracts = [
    { id: 1974, contract: { id: 1974, ourId: "TEST/SOURCE", _type: { id: 2 } }, milestonesWithCases: [{ milestone, casesWithTasks: [] }] },
    { id: 1975, contract: { id: 1975, ourId: "TEST/LINKED", _type: { id: 2 } }, milestonesWithCases: [{ milestone, casesWithTasks: [] }] },
    { id: 1976, contract: { id: 1976, ourId: "TEST/OCCUPIED", _type: { id: 2 } }, milestonesWithCases: [{ milestone: { id: 4999, _type: { id: 5 }, _contract: { id: 1976 } }, casesWithTasks: [] }] },
    { id: 1977, contract: { id: 1977, ourId: "TEST/VACANT", _type: { id: 2 } }, milestonesWithCases: [] },
    { id: 1978, contract: { id: 1978, ourId: "TEST/UNAVAILABLE", _type: { id: 1 } }, milestonesWithCases: [] },
] as unknown as ContractsWithChildren[];

function renderAction() {
    return render(<MilestoneSharingContractsContext.Provider value={contracts}>
        <MilestoneSharingAction dataObject={milestone} layout="horizontal" />
    </MilestoneSharingContractsContext.Provider>);
}

describe("milestone sharing action", () => {
    beforeEach(() => {
        sessionStorage.clear();
        MainSetup.currentUser = { userName: "Test", systemRoleName: "ENVI_EMPLOYEE", systemRoleId: 3,
            googleId: "synthetic", picture: "", systemEmail: "test@example.invalid" };
        milestoneTypesRepository.items = [{ id: 5, _contractType: { id: 2 } }] as never;
    });
    afterEach(() => {
        vi.unstubAllGlobals();
        sessionStorage.removeItem("Current User");
        milestoneTypesRepository.items = [];
    });

    it("hides sharing management from an unauthorized role", () => {
        MainSetup.currentUser = { userName: "Test", systemRoleName: "ENVI_COOPERATOR", systemRoleId: 4,
            googleId: "synthetic", picture: "", systemEmail: "test@example.invalid" };
        renderAction();
        expect(screen.queryByRole("button", { name: "Przypięcia" })).toBeNull();
    });

    it("shows source and existing link, and blocks an occupied destination", async () => {
        const request = vi.fn(async () => new Response(JSON.stringify({
            milestoneId: 4889, sourceContractId: 1974, revision: "a".repeat(64),
            links: [{ contractId: 1975, shortcutStatus: "PENDING", operationId: null }],
        }), { status: 200, headers: { "Content-Type": "application/json" } }));
        vi.stubGlobal("fetch", request);
        renderAction();
        fireEvent.click(screen.getByRole("button", { name: "Przypięcia" }));
        await screen.findByText(/TEST\/SOURCE/);
        expect(screen.getByText(/TEST\/LINKED/)).toBeTruthy();
        expect(screen.getByText(/Połączenie danych będzie dostępne w osobnym kroku/)).toBeTruthy();
        const occupied = screen.getByText(/TEST\/OCCUPIED/).closest(".border")!;
        expect((occupied.querySelector("button") as HTMLButtonElement).disabled).toBe(true);
        const vacant = screen.getByText(/TEST\/VACANT/).closest(".border")!;
        expect((vacant.querySelector("button") as HTMLButtonElement).disabled).toBe(false);
        const unavailable = screen.getByText(/TEST\/UNAVAILABLE/).closest(".border")!;
        expect((unavailable.querySelector("button") as HTMLButtonElement).disabled).toBe(true);
        expect(unavailable.textContent).toContain("Ten typ kamienia nie jest dostępny");
        expect(request).toHaveBeenCalledTimes(1);
    });

    it("requires explicit detach confirmation and explains a server collision", async () => {
        const request = vi.fn(async (_url: string, options?: RequestInit) => {
            if (options?.method === "PUT") return new Response(JSON.stringify({ error: { code: "DESTINATION_OCCUPIED" } }), {
                status: 409, headers: { "Content-Type": "application/json" },
            });
            return new Response(JSON.stringify({ milestoneId: 4889, sourceContractId: 1974,
                revision: "a".repeat(64), links: [{ contractId: 1975, shortcutStatus: "PENDING", operationId: null }] }), {
                status: 200, headers: { "Content-Type": "application/json" },
            });
        });
        vi.stubGlobal("fetch", request);
        vi.stubGlobal("crypto", { randomUUID: () => "89a37fb8-cc60-4810-901d-39389ff328ca" });
        renderAction();
        fireEvent.click(screen.getByRole("button", { name: "Przypięcia" }));
        await screen.findByText(/TEST\/LINKED/);
        fireEvent.click(screen.getByRole("button", { name: "Odepnij kontrakt" }));
        expect(screen.getByRole("button", { name: "Potwierdź odpięcie" })).toBeTruthy();
        expect(request).toHaveBeenCalledTimes(1);
        const vacant = screen.getByText(/TEST\/VACANT/).closest(".border")!;
        fireEvent.click(vacant.querySelector("button")!);
        await waitFor(() => expect(screen.getByRole("alert").textContent).toContain("Połączenie danych"));
        expect(request.mock.calls.some(([url, options]) =>
            url.endsWith("/milestones/4889/sharing/contracts/1977") && options?.method === "PUT"
        )).toBe(true);
    });

    it("detaches only after confirmation using the loaded revision", async () => {
        const request = vi.fn(async (_url: string, options?: RequestInit) => new Response(JSON.stringify(
            options?.method === "DELETE"
                ? { milestoneId: 4889, contractId: 1975, detached: true, revision: "b".repeat(64) }
                : { milestoneId: 4889, sourceContractId: 1974, revision: "a".repeat(64),
                    links: [{ contractId: 1975, shortcutStatus: "PENDING", operationId: null }] }
        ), { status: 200, headers: { "Content-Type": "application/json" } }));
        vi.stubGlobal("fetch", request);
        vi.stubGlobal("crypto", { randomUUID: () => "89a37fb8-cc60-4810-901d-39389ff328ca" });
        renderAction();
        fireEvent.click(screen.getByRole("button", { name: "Przypięcia" }));
        await screen.findByText(/TEST\/LINKED/);
        fireEvent.click(screen.getByRole("button", { name: "Odepnij kontrakt" }));
        expect(request).toHaveBeenCalledTimes(1);
        fireEvent.click(screen.getByRole("button", { name: "Potwierdź odpięcie" }));
        await waitFor(() => expect(request.mock.calls.some(([, options]) => options?.method === "DELETE")).toBe(true));
        const [url, options] = request.mock.calls.find(([, options]) => options?.method === "DELETE")!;
        expect(url).toContain("/milestones/4889/sharing/contracts/1975");
        expect(JSON.parse(options!.body as string)).toEqual({
            requestId: "89a37fb8-cc60-4810-901d-39389ff328ca", expectedRevision: "a".repeat(64),
        });
    });
    it.each([['SHORTCUT_NOT_READY', 503], ['DRIVE_STATE_UNCERTAIN', 409], ['FOLDER_ALIAS', 409]] as const)('preserves the original detach request after %s and a changed revision', async (code, statusCode) => {
        let failed = false;
        let detached = false;
        const deletes: string[] = [];
        const request = vi.fn(async (_url: string, options?: RequestInit) => {
            if (options?.method === 'DELETE') {
                deletes.push(options.body as string);
                if (!failed) {
                    failed = true;
                    return new Response(JSON.stringify({ error: { code } }), { status: statusCode });
                }
                detached = true;
                return new Response(JSON.stringify({ detached: true }));
            }
            return new Response(JSON.stringify({ milestoneId: 4889, sourceContractId: 1974,
                revision: (failed ? 'b' : 'a').repeat(64), links: detached ? [] : [{ contractId: 1975,
                    shortcutStatus: failed ? 'FAILED' : 'READY', operationId: failed ? 'detach-operation' : null }] }));
        });
        vi.stubGlobal('fetch', request);
        vi.stubGlobal('crypto', { randomUUID: vi.fn(() => '89a37fb8-cc60-4810-901d-39389ff328ca') });
        const first = renderAction();
        fireEvent.click(screen.getByRole('button', { name: 'Przypięcia' }));
        await screen.findByText(/skrót i folder zweryfikowane przez serwer/);
        fireEvent.click(screen.getByRole('button', { name: 'Odepnij kontrakt' }));
        fireEvent.click(screen.getByRole('button', { name: 'Potwierdź odpięcie' }));
        await screen.findByText(/Operacja nie została zakończona/);
        first.unmount();
        renderAction();
        fireEvent.click(screen.getByRole('button', { name: 'Przypięcia' }));
        await screen.findByText(/Operacja nie została zakończona/);
        fireEvent.click(screen.getByRole('button', { name: 'Ponów odpięcie' }));
        await screen.findByText('Brak dodatkowych przypięć.');
        expect(deletes).toHaveLength(2);
        expect(deletes[1]).toBe(deletes[0]);
        expect(JSON.parse(deletes[1]).expectedRevision).toBe('a'.repeat(64));
        expect(window.crypto.randomUUID).toHaveBeenCalledTimes(1);
        expect(screen.queryByRole('button', { name: 'Ponów odpięcie' })).toBeNull();
    });

    it('can retry FAILED and PENDING shortcuts but does not promise readiness on a failed result', async () => {
        let status = 'PENDING';
        const puts: string[] = [];
        vi.stubGlobal('fetch', vi.fn(async (_url: string, options?: RequestInit) => {
            if (options?.method === 'PUT') {
                puts.push(options.body as string);
                status = puts.length === 1 ? 'FAILED' : 'READY';
                return new Response(JSON.stringify({ shortcutStatus: status }));
            }
            return new Response(JSON.stringify({ milestoneId: 4889, sourceContractId: 1974, revision: 'a'.repeat(64),
                links: [{ contractId: 1975, shortcutStatus: status, operationId: null }] }));
        }));
        let counter = 0;
        vi.stubGlobal('crypto', { randomUUID: () => '89a37fb8-cc60-4810-901d-' + String(++counter).padStart(12, '0') });
        renderAction();
        fireEvent.click(screen.getByRole('button', { name: 'Przypięcia' }));
        await screen.findByRole('button', { name: 'Ponów przygotowanie skrótu' });
        fireEvent.click(screen.getByRole('button', { name: 'Ponów przygotowanie skrótu' }));
        await screen.findByText(/gotowość niepotwierdzona/);
        expect(screen.queryByText(/skrót i folder zweryfikowane przez serwer/)).toBeNull();
        fireEvent.click(screen.getByRole('button', { name: 'Ponów przygotowanie skrótu' }));
        await screen.findByText(/skrót i folder zweryfikowane przez serwer/);
        expect(puts).toHaveLength(2);
        expect(JSON.parse(puts[0]).requestId).not.toBe(JSON.parse(puts[1]).requestId);
    });

    it('keeps the same detach request after a lost response and failed refresh', async () => {
        let deletes = 0;
        const bodies: string[] = [];
        vi.stubGlobal('fetch', vi.fn(async (_url: string, options?: RequestInit) => {
            if (options?.method === 'DELETE') { deletes++; bodies.push(options.body as string); throw new TypeError('lost response'); }
            if (deletes) throw new TypeError('refresh failed');
            return new Response(JSON.stringify({ milestoneId: 4889, sourceContractId: 1974, revision: 'a'.repeat(64),
                links: [{ contractId: 1975, shortcutStatus: 'READY', operationId: null }] }));
        }));
        renderAction();
        fireEvent.click(screen.getByRole('button', { name: 'Przypięcia' }));
        await screen.findByRole('button', { name: 'Odepnij kontrakt' });
        fireEvent.click(screen.getByRole('button', { name: 'Odepnij kontrakt' }));
        fireEvent.click(screen.getByRole('button', { name: 'Potwierdź odpięcie' }));
        await screen.findByRole('button', { name: 'Ponów odpięcie' });
        await waitFor(() => expect((screen.getByRole('button', { name: 'Ponów odpięcie' }) as HTMLButtonElement).disabled).toBe(false));
        fireEvent.click(screen.getByRole('button', { name: 'Ponów odpięcie' }));
        await waitFor(() => expect(bodies).toHaveLength(2));
        expect(bodies[1]).toBe(bodies[0]);
    });

});
