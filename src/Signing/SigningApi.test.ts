import { afterEach, describe, expect, it, vi } from "vitest";
import ToolsFetch from "../React/Tools/ToolsFetch";
import { SigningApi } from "./SigningApi";

afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
});

describe("SigningApi.offerFilePageImage", () => {
    it("wygasła sesja (401) jest zgłaszana jak w pozostałych wywołaniach, a błąd niesie komunikat serwera", async () => {
        const expired = vi.spyOn(ToolsFetch, "notifySessionExpired").mockImplementation(() => {});
        vi.stubGlobal(
            "fetch",
            vi.fn().mockResolvedValue({ ok: false, status: 401, json: async () => ({ errorMessage: "Użytkownik niezalogowany" }) })
        );
        await expect(SigningApi.offerFilePageImage(7, "FILE_ID_0000001", 2)).rejects.toThrow("Użytkownik niezalogowany");
        expect(expired).toHaveBeenCalledTimes(1);
    });

    it("inny błąd nie wylogowuje; udana odpowiedź oddaje obraz", async () => {
        const expired = vi.spyOn(ToolsFetch, "notifySessionExpired").mockImplementation(() => {});
        const blob = new Blob(["png"], { type: "image/png" });
        const fetchMock = vi
            .fn()
            .mockResolvedValueOnce({ ok: false, status: 404, json: async () => ({ errorMessage: "Plik nie ma strony 9." }) })
            .mockResolvedValueOnce({ ok: true, status: 200, blob: async () => blob });
        vi.stubGlobal("fetch", fetchMock);
        await expect(SigningApi.offerFilePageImage(7, "FILE_ID_0000001", 9)).rejects.toThrow("Plik nie ma strony 9.");
        await expect(SigningApi.offerFilePageImage(7, "FILE_ID_0000001", 1)).resolves.toBe(blob);
        expect(expired).not.toHaveBeenCalled();
        expect(String(fetchMock.mock.calls[1][0])).toContain("offer/7/signableFile/FILE_ID_0000001/page/1");
    });
});
