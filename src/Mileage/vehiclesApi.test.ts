import { afterEach, describe, expect, it, vi } from "vitest";
vi.mock("../React/MainSetupReact", () => ({ default: { serverUrl: "http://test/" } }));
import { fetchVehicles } from "./vehiclesApi";
afterEach(() => vi.unstubAllGlobals());
describe("dated mileage vehicles", () => {
    it("sends selected date and keeps null reading/link", async () => {
        const fetch = vi.fn().mockResolvedValue({ ok: true, json: async () => [{ id: 3, currentReading: null, sheetUrl: null, year: 2027 }] });
        vi.stubGlobal("fetch", fetch);
        expect((await fetchVehicles("2027-01-01"))[0]).toMatchObject({ id: "3", currentReading: null, sheetUrl: null, year: 2027 });
        expect(fetch.mock.calls[0][0]).toBe("http://test/mileage/vehicles?date=2027-01-01");
    });
    it("retains default API call for other callers", async () => {
        const fetch = vi.fn().mockResolvedValue({ ok: true, json: async () => [] }); vi.stubGlobal("fetch", fetch);
        await fetchVehicles(); expect(fetch.mock.calls[0][0]).toBe("http://test/mileage/vehicles");
    });
    it("shows actionable annual validation failure", async () => {
        vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: false, json: async () => ({ message: "Sprawdź rok kilometrówki." }) }));
        await expect(fetchVehicles("2027-01-01")).rejects.toThrow("Sprawdź rok kilometrówki.");
    });
});
