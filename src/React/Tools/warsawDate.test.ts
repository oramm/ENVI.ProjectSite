import { describe, expect, it } from "vitest";
import { warsawDate } from "./warsawDate";
describe("Warsaw office calendar", () => {
    it.each([
        ["2026-12-31T22:59:59Z", "2026-12-31"],
        ["2026-12-31T23:30:00Z", "2027-01-01"],
        ["2027-06-30T22:30:00Z", "2027-07-01"],
        ["2027-03-28T00:30:00Z", "2027-03-28"],
        ["2027-03-28T01:30:00Z", "2027-03-28"],
    ])("%s -> %s", (instant, expected) => expect(warsawDate(new Date(instant))).toBe(expected));
});
