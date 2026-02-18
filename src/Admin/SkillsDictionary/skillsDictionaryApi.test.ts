import { describe, expect, it } from "vitest";
import {
    mapSkillDictionaryDtoToModel,
    mapSkillDictionaryModelToUpsertDto,
    normalizeOptionalDescription,
} from "./skillsDictionaryApi";

describe("normalizeOptionalDescription", () => {
    it("trims value", () => {
        expect(normalizeOptionalDescription("  Opis  ")).toBe("Opis");
    });

    it("returns null for empty or whitespace values", () => {
        expect(normalizeOptionalDescription("")).toBeNull();
        expect(normalizeOptionalDescription("   ")).toBeNull();
    });

    it("returns null for null or undefined", () => {
        expect(normalizeOptionalDescription(null)).toBeNull();
        expect(normalizeOptionalDescription(undefined)).toBeNull();
    });
});

describe("skills dictionary mappers", () => {
    it("maps dto to model and normalizes missing description", () => {
        const model = mapSkillDictionaryDtoToModel({
            id: 1,
            name: "React",
            nameNormalized: "react",
        });
        expect(model.description).toBeNull();
    });

    it("maps create/edit payload description string", () => {
        const dto = mapSkillDictionaryModelToUpsertDto({
            name: "React",
            description: "  UI  ",
        });
        expect(dto).toEqual({ name: "React", description: "UI" });
    });

    it("maps create/edit payload description to null for whitespace", () => {
        const dto = mapSkillDictionaryModelToUpsertDto({
            name: "React",
            description: "   ",
        });
        expect(dto).toEqual({ name: "React", description: null });
    });
});
