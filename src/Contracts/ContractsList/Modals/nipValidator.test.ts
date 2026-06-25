import { describe, it, expect } from "vitest";
import { validateNipChecksum, normalizeNip } from "./nipValidator";

describe("normalizeNip", () => {
    it("strips dashes and spaces", () => {
        expect(normalizeNip("747-191-75-75")).toBe("7471917575");
        expect(normalizeNip("747 191 75 75")).toBe("7471917575");
        expect(normalizeNip("7471917575")).toBe("7471917575");
    });
});

describe("validateNipChecksum — valid NIPs (from O2 decision record)", () => {
    it("accepts 5260250995", () => {
        expect(validateNipChecksum("5260250995")).toBe(true);
    });
    it("accepts 1234563218", () => {
        expect(validateNipChecksum("1234563218")).toBe(true);
    });
    it("accepts 7740001454", () => {
        expect(validateNipChecksum("7740001454")).toBe(true);
    });
    it("accepts NIP with dashes after normalization (7471917575)", () => {
        expect(validateNipChecksum("747-191-75-75")).toBe(true);
    });
});

describe("validateNipChecksum — invalid NIPs", () => {
    it("rejects 1234567890 (bad checksum)", () => {
        expect(validateNipChecksum("1234567890")).toBe(false);
    });
    it("rejects 123 (too short)", () => {
        expect(validateNipChecksum("123")).toBe(false);
    });
    it("rejects 0000000000 (all-zeros guard, O2.6)", () => {
        expect(validateNipChecksum("0000000000")).toBe(false);
    });
    it("rejects empty string", () => {
        expect(validateNipChecksum("")).toBe(false);
    });
    it("rejects 11-digit number (too long)", () => {
        expect(validateNipChecksum("52602509951")).toBe(false);
    });
    it("rejects NIP where mod-11 checksum != last digit (1234567891)", () => {
        // 1234567890 is already tested above as invalid
        // 1234567891: same first 9 digits, last digit changed to 1 instead of 8
        // confirms that changing the last digit breaks the checksum
        expect(validateNipChecksum("1234567891")).toBe(false);
    });
});
