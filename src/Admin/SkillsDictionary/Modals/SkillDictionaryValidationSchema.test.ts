import { describe, expect, it } from "vitest";
import { makeSkillDictionaryValidationSchema } from "./SkillDictionaryValidationSchema";

describe("SkillDictionaryValidationSchema submit normalization", () => {
    it("keeps trimmed description for create/edit", async () => {
        const schema = makeSkillDictionaryValidationSchema(false);
        const result = await schema.validate({ name: "React", description: "  frontend  " });
        expect(result.description).toBe("frontend");
    });

    it("sets description null for empty values", async () => {
        const schema = makeSkillDictionaryValidationSchema(true);
        const result = await schema.validate({ name: "React", description: "" });
        expect(result.description).toBeNull();
    });

    it("sets description null for whitespace", async () => {
        const schema = makeSkillDictionaryValidationSchema(true);
        const result = await schema.validate({ name: "React", description: "   " });
        expect(result.description).toBeNull();
    });

    it("supports initial null description during edit", async () => {
        const schema = makeSkillDictionaryValidationSchema(true);
        const result = await schema.validate({ name: "React", description: null });
        expect(result.description).toBeNull();
    });
});
