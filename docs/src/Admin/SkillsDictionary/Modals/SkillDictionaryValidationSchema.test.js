"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const SkillDictionaryValidationSchema_1 = require("./SkillDictionaryValidationSchema");
(0, vitest_1.describe)("SkillDictionaryValidationSchema submit normalization", () => {
    (0, vitest_1.it)("keeps trimmed description for create/edit", async () => {
        const schema = (0, SkillDictionaryValidationSchema_1.makeSkillDictionaryValidationSchema)(false);
        const result = await schema.validate({ name: "React", description: "  frontend  " });
        (0, vitest_1.expect)(result.description).toBe("frontend");
    });
    (0, vitest_1.it)("sets description null for empty values", async () => {
        const schema = (0, SkillDictionaryValidationSchema_1.makeSkillDictionaryValidationSchema)(true);
        const result = await schema.validate({ name: "React", description: "" });
        (0, vitest_1.expect)(result.description).toBeNull();
    });
    (0, vitest_1.it)("sets description null for whitespace", async () => {
        const schema = (0, SkillDictionaryValidationSchema_1.makeSkillDictionaryValidationSchema)(true);
        const result = await schema.validate({ name: "React", description: "   " });
        (0, vitest_1.expect)(result.description).toBeNull();
    });
    (0, vitest_1.it)("supports initial null description during edit", async () => {
        const schema = (0, SkillDictionaryValidationSchema_1.makeSkillDictionaryValidationSchema)(true);
        const result = await schema.validate({ name: "React", description: null });
        (0, vitest_1.expect)(result.description).toBeNull();
    });
});
