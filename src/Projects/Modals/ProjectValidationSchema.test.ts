import { describe, expect, it } from "vitest";
import { makeProjectValidationSchema } from "./ProjectValidationSchema";

describe("ProjectValidationSchema funding fields", () => {
    const schema = makeProjectValidationSchema(false);

    it.each(["fundingAgreementNumber", "program"])("%s: 51 znakow daje blad", async (field) => {
        await expect(schema.validateAt(field, { [field]: "a".repeat(51) })).rejects.toThrow("Maksymalnie 50 znaków");
    });

    it.each(["fundingAgreementNumber", "program"])("%s: 50 znakow jest poprawne", async (field) => {
        await expect(schema.validateAt(field, { [field]: "a".repeat(50) })).resolves.toBeDefined();
    });

    it.each(["fundingAgreementNumber", "program"])("%s: pusty string i null sa dopuszczalne", async (field) => {
        await expect(schema.validateAt(field, { [field]: "" })).resolves.toBeDefined();
        await expect(schema.validateAt(field, { [field]: null })).resolves.toBeDefined();
    });
});
