"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const skillsDictionaryApi_1 = require("./skillsDictionaryApi");
(0, vitest_1.describe)("normalizeOptionalDescription", () => {
    (0, vitest_1.it)("trims value", () => {
        (0, vitest_1.expect)((0, skillsDictionaryApi_1.normalizeOptionalDescription)("  Opis  ")).toBe("Opis");
    });
    (0, vitest_1.it)("returns null for empty or whitespace values", () => {
        (0, vitest_1.expect)((0, skillsDictionaryApi_1.normalizeOptionalDescription)("")).toBeNull();
        (0, vitest_1.expect)((0, skillsDictionaryApi_1.normalizeOptionalDescription)("   ")).toBeNull();
    });
    (0, vitest_1.it)("returns null for null or undefined", () => {
        (0, vitest_1.expect)((0, skillsDictionaryApi_1.normalizeOptionalDescription)(null)).toBeNull();
        (0, vitest_1.expect)((0, skillsDictionaryApi_1.normalizeOptionalDescription)(undefined)).toBeNull();
    });
});
(0, vitest_1.describe)("skills dictionary mappers", () => {
    (0, vitest_1.it)("maps dto to model and normalizes missing description", () => {
        const model = (0, skillsDictionaryApi_1.mapSkillDictionaryDtoToModel)({
            id: 1,
            name: "React",
            nameNormalized: "react",
        });
        (0, vitest_1.expect)(model.description).toBeNull();
    });
    (0, vitest_1.it)("maps create/edit payload description string", () => {
        const dto = (0, skillsDictionaryApi_1.mapSkillDictionaryModelToUpsertDto)({
            name: "React",
            description: "  UI  ",
        });
        (0, vitest_1.expect)(dto).toEqual({ name: "React", description: "UI" });
    });
    (0, vitest_1.it)("maps create/edit payload description to null for whitespace", () => {
        const dto = (0, skillsDictionaryApi_1.mapSkillDictionaryModelToUpsertDto)({
            name: "React",
            description: "   ",
        });
        (0, vitest_1.expect)(dto).toEqual({ name: "React", description: null });
    });
});
