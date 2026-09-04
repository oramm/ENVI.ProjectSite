import { describe, it, expect } from "vitest";
import { fuelNote } from "./fuelNote";

describe("fuelNote — uwaga wiersza przy tankowaniu", () => {
    it("sam licznik: grupuje cyfry i dopisuje jednostkę", () => {
        expect(fuelNote("150480", "")).toBe("licznik 150 480 km");
        expect(fuelNote("99500", "")).toBe("licznik 99 500 km");
    });

    it("licznik i uwaga: najpierw licznik, potem to, co dopisał człowiek", () => {
        expect(fuelNote("150480", "do pełna")).toBe("licznik 150 480 km, do pełna");
    });

    it("czyta licznik wpisany z separatorami", () => {
        expect(fuelNote("150 480", "")).toBe("licznik 150 480 km");
    });

    it("sama uwaga zostaje uwagą", () => {
        expect(fuelNote("", "  faktura zbiorcza  ")).toBe("faktura zbiorcza");
    });

    it("nic nie wpisano - kolumna zostaje pusta", () => {
        expect(fuelNote("", "")).toBe("");
    });
});
