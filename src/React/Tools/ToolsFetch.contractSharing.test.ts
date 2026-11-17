import { afterEach, describe, expect, it, vi } from "vitest";
import ToolsFetch from "./ToolsFetch";

describe("structured contract sharing refusal", () => {
    afterEach(() => vi.unstubAllGlobals());

    it("shows a readable stale-revision refusal and preserves HTTP status for retry policy", async () => {
        vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
            ok: false, status: 409,
            json: async () => ({ error: { code: "STALE_REVISION", message: "STALE_REVISION" } }),
        }));
        await expect(ToolsFetch.fetchJsonWithSafeError("http://localhost:3000/contractReact", { method: "POST" }))
            .rejects.toMatchObject({ status: 409, message: expect.stringContaining("Odśwież listę") });
    });

    it("leaves a different endpoint's message intact", async () => {
        vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
            ok: false, status: 409,
            json: async () => ({ error: { code: "TYPE_MISMATCH", message: "Błąd innego modułu" } }),
        }));
        await expect(ToolsFetch.fetchJsonWithSafeError("http://localhost:3000/otherRoute"))
            .rejects.toMatchObject({ status: 409, message: "Błąd innego modułu" });
    });
});
