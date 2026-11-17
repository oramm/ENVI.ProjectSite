import { afterEach, describe, expect, it, vi } from "vitest";
import { mailboxAction } from "./mailboxesService";

vi.mock("../React/MainSetupReact", () => ({ default: { serverUrl: "https://ps.test/" } }));

describe("jednorazowa odpowiedź z hasłem", () => {
    afterEach(() => vi.unstubAllGlobals());
    it("nie używa repozytorium ani ponowień i wyłącza pamięć podręczną", async () => {
        const fetch = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ password: "Nowe123456789012" }) });
        vi.stubGlobal("fetch", fetch);
        expect(await mailboxAction(5, "password")).toEqual({ password: "Nowe123456789012" });
        expect(fetch).toHaveBeenCalledExactlyOnceWith("https://ps.test/mailboxes/5/password", {
            method: "POST", credentials: "include", cache: "no-store",
        });
    });
});
