import { describe, expect, it, vi } from "vitest";

vi.mock("../../../React/MainSetupReact", () => ({ default: { serverUrl: "http://x/" } }));

import { AreaAccess, filterOverview, PersonAccessView } from "./accessOverviewApi";
import { removalEffect } from "./PersonAccessPanel";

const area = (a: Partial<AreaAccess> & Pick<AreaAccess, "area">): AreaAccess => ({ sees: false, value: "—", source: null, why: "", ...a });
const person = (personId: number, role: any, areas: AreaAccess[], extra: Partial<PersonAccessView> = {}): PersonAccessView => ({
    personId, name: "Jan", surname: `Nr${personId}`, entityName: "Firma", systemRoleId: 1, role, assignments: [], contractRoles: [], letterContracts: [], areas, ...extra,
});

const people = [
    person(1, "ENVI_EMPLOYEE", [area({ area: "projects", sees: true, value: "wszystkie", source: "rola" })]),
    person(2, "ENVI_COOPERATOR", [area({ area: "projects", sees: true, value: "1 projekt", source: "przypisanie" })], { entityName: "Aqua-Plan" }),
    person(3, "ENVI_COOPERATOR", [area({ area: "projects" })]),
];
const base = { area: "projects" as const, has: "" as const, role: "" as const, source: "" as const, query: "" };

describe("filterOverview", () => {
    it("filtruje po dostępie, kręgu, źródle i frazie", () => {
        const ids = (f: any) => filterOverview(people, { ...base, ...f }).map((r) => r.person.personId);
        expect(ids({})).toEqual([1, 2, 3]);
        expect(ids({ has: "0" })).toEqual([3]);
        expect(ids({ role: "ENVI_COOPERATOR" })).toEqual([2, 3]);
        expect(ids({ source: "przypisanie" })).toEqual([2]);
        expect(ids({ query: "aqua" })).toEqual([2]);
    });
});

describe("removalEffect", () => {
    it("wymienia stracone obszary, zawężone i pusty system", () => {
        const before = [area({ area: "projects", sees: true, value: "2 projekty" }), area({ area: "mail", sees: true, value: "1 skrzynka" })];
        const after = [area({ area: "projects", sees: true, value: "1 projekt" }), area({ area: "mail" })];
        expect(removalEffect(before, after)).toEqual({ lost: ["Poczta projektu"], narrowed: ["Projekty i kontrakty: 1 projekt"], nothingLeft: false });
        expect(removalEffect(before, [area({ area: "projects" }), area({ area: "mail" })]).nothingLeft).toBe(true);
    });
});
