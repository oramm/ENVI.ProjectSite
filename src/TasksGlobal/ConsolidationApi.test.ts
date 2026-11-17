import { describe, expect, it, vi } from "vitest";
import { ConsolidationApi, ConsolidationError, Pending } from "./ConsolidationApi";

const intent: Pending = { path: "apply", body: { requestId: "11111111-1111-4111-8111-111111111111", previewId: "22222222-2222-4222-8222-222222222222", expectedRevision: "a".repeat(64), unitIds: ["33333333-3333-4333-8333-333333333333"] },
    context: { sourceMilestoneId: 1, destinationMilestoneId: 2, mappings: [] } };
const operationId = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";
const applied = { operationId, revision: "b".repeat(64), state: "TRANSFERRING", sourceMilestoneId: 1, destinationMilestoneId: 2, accountingContractId: 20, documentsReady: false };
const prepareIntent: Pending = { path: "prepare-targets", body: { requestId: "44444444-4444-4444-8444-444444444444", previewId: "22222222-2222-4222-8222-222222222222", expectedRevision: "a".repeat(64) }, context: {
    sourceMilestoneId: 1, destinationMilestoneId: 2, mappings: [{ sourceCaseId: 101, target: { mode: "create", caseTypeId: 9, name: "TEST", parentSourceCaseId: null } }, { sourceCaseId: 102, target: { mode: "existing", caseId: 202 } }],
} };
const preparedReply = { preparationId: "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb", state: "PREPARED", previewId: "cccccccc-cccc-4ccc-8ccc-cccccccccccc", revision: "b".repeat(64),
    mappings: [{ sourceCaseId: 101, target: { mode: "existing", caseId: 201 } }, { sourceCaseId: 102, target: { mode: "existing", caseId: 202 } }], transferPerformed: false };
function store() {
    const values = new Map<string, string>();
    return { getItem: (k: string) => values.get(k) ?? null, setItem: (k: string, v: string) => { values.set(k, v); }, removeItem: (k: string) => { values.delete(k); } };
}
describe("consolidation exact intent", () => {
    it("persists before request and retries a lost response identically after remount", async () => {
        const storage = store(); let attempts = 0; const bodies: string[] = [];
        const request = vi.fn(async (_url: string | URL | Request, options?: RequestInit) => {
            expect(storage.getItem("pending")).not.toBeNull(); bodies.push(String(options?.body));
            if (!attempts++) throw new TypeError("lost response");
            return new Response(JSON.stringify(applied));
        });
        const first = new ConsolidationApi("/api/", storage, "pending", request);
        await expect(first.mutate(intent)).rejects.toThrow("lost response");
        const remounted = new ConsolidationApi("/api/", storage, "pending", request);
        expect(remounted.pending()).toEqual(intent);
        await expect(remounted.mutate(remounted.pending()!)).resolves.toEqual(applied);
        expect(bodies[1]).toBe(bodies[0]); expect(remounted.pending()).toBeNull();
    });
    it("refuses replacement intent without sending another request", async () => {
        const storage = store(), request = vi.fn(async () => { throw new TypeError("lost"); });
        const api = new ConsolidationApi("/api", storage, "p", request);
        await expect(api.mutate(intent)).rejects.toThrow("lost");
        await expect(api.mutate({ ...intent, body: { ...intent.body, requestId: "another" } })).rejects.toThrow("Najpierw ponów");
        expect(request).toHaveBeenCalledTimes(1); expect(api.pending()).toEqual(intent);
    });
    it.each(["RETRYABLE_STORAGE_ERROR", "DRIVE_STATE_UNCERTAIN", "OPERATION_IN_PROGRESS"])("preserves original intent for %s", async code => {
        const api = new ConsolidationApi("/api", store(), "p", vi.fn(async () => new Response(JSON.stringify({ error: { code } }), { status: 503 })));
        await expect(api.mutate(intent)).rejects.toBeInstanceOf(ConsolidationError); expect(api.pending()).toEqual(intent);
    });
    it("clears deterministic stale refusal so a new preview can be selected", async () => {
        const api = new ConsolidationApi("/api", store(), "p", vi.fn(async () => new Response(JSON.stringify({ error: { code: "STALE_REVISION" } }), { status: 409 })));
        await expect(api.mutate(intent)).rejects.toThrow("Dane zmieniły"); expect(api.pending()).toBeNull();
    });
    it("keeps PREPARED separate from transfer and does not add batch keys to prepare", async () => {
        const request = vi.fn(async () => new Response(JSON.stringify(preparedReply)));
        const api = new ConsolidationApi("/api", store(), "p", request);
        const prepared = await api.mutate<{ transferPerformed: boolean }>(prepareIntent);
        expect(prepared.transferPerformed).toBe(false);
        const [url, options] = request.mock.calls[0] as unknown as [string, RequestInit];
        expect(url).toBe("/api/milestone-consolidations/prepare-targets"); expect(JSON.parse(String(options.body))).not.toHaveProperty("unitIds");
    });
    it("does not accept an empty successful reply as proof of commit", async () => {
        const api = new ConsolidationApi("/api", store(), "p", vi.fn(async () => new Response("", { status: 200 })));
        await expect(api.mutate(intent)).rejects.toThrow("niepotwierdzony"); expect(api.pending()).toEqual(intent);
    });
    it.each([
        { operationId: "" }, { operationId: "bad" }, { revision: "bad" }, { sourceMilestoneId: 999 }, { destinationMilestoneId: 999 },
        { accountingContractId: 0 }, { state: "COMPLETE" }, { documentsReady: true },
    ])("keeps exact intent after malformed apply acknowledgment %j", async malformed => {
        const api = new ConsolidationApi("/api", store(), "p", vi.fn(async () => new Response(JSON.stringify({ ...applied, ...malformed }))));
        await expect(api.mutate(intent)).rejects.toThrow("Nieprawidłowe potwierdzenie"); expect(api.pending()).toEqual(intent);
    });
    it("does not accept acknowledgment for another operation on resume", async () => {
        const resumed = { ...intent, context: { ...intent.context, operationId: "dddddddd-dddd-4ddd-8ddd-dddddddddddd" } };
        const api = new ConsolidationApi("/api", store(), "p", vi.fn(async () => new Response(JSON.stringify(applied))));
        await expect(api.mutate(resumed)).rejects.toThrow("Nieprawidłowe potwierdzenie"); expect(api.pending()).toEqual(resumed);
    });
    it.each([
        { previewId: "" }, { previewId: "bad" }, { preparationId: "bad" }, { revision: "bad" }, { state: "TRANSFERRING" }, { transferPerformed: true },
        { mappings: [] }, { mappings: [preparedReply.mappings[0], preparedReply.mappings[0]] },
        { mappings: [{ sourceCaseId: 999, target: { mode: "existing", caseId: 201 } }, preparedReply.mappings[1]] },
        { mappings: [preparedReply.mappings[0], { sourceCaseId: 102, target: { mode: "existing", caseId: 999 } }] },
        { mappings: [{ sourceCaseId: 101, target: { mode: "existing", caseId: 0 } }, preparedReply.mappings[1]] },
        { mappings: [{ sourceCaseId: 101, target: { mode: "create", caseId: 201 } }, preparedReply.mappings[1]] },
    ])("keeps exact intent after malformed prepare acknowledgment %j", async malformed => {
        const api = new ConsolidationApi("/api", store(), "p", vi.fn(async () => new Response(JSON.stringify({ ...preparedReply, ...malformed }))));
        await expect(api.mutate(prepareIntent)).rejects.toThrow("Nieprawidłowe potwierdzenie"); expect(api.pending()).toEqual(prepareIntent);
    });
});
