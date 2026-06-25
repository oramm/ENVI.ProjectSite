/**
 * Tests for ourContractValidationSchema — WS10/N4.
 *
 * Strategy: build a minimal partial shape that satisfies all required fields
 * EXCEPT _employers so we can isolate the AQM rule. We use Yup's abortEarly:false
 * and fish out the _employers error path from ValidationError.inner.
 *
 * For non-AQM regression tests we check that a valid employers array
 * (without NIP) passes the _employers rule cleanly.
 */
import { describe, it, expect } from "vitest";
import * as Yup from "yup";
import { ourContractValidationSchema } from "./ContractValidationSchema";

// A minimal valid base for fields we don't care about in these tests
const BASE_VALID = {
    name: "Test umowa",
    _contractRanges: [{ id: 1 }],
    status: "ACTIVE",
    value: "100000",
    startDate: new Date("2026-01-01"),
    endDate: new Date("2027-01-01"),
    number: "ENV/001/2026",
    alias: "TEST",
    _city: { id: 1 },
    _admin: { id: 1 },
    _manager: { id: 1 },
    comment: "",
};

const AQM_TYPE = { id: 10, name: "AQM" };
const OTHER_TYPE = { id: 1, name: "Usługi" };

/** Extract errors for a specific field path from a ValidationError */
function getFieldErrors(err: Yup.ValidationError, path: string): string[] {
    return err.inner
        .filter((e) => e.path === path)
        .map((e) => e.message);
}

async function validate(data: object, schema: ReturnType<typeof ourContractValidationSchema>) {
    return schema.validate(data, { abortEarly: false });
}

async function getErrors(data: object, schema: ReturnType<typeof ourContractValidationSchema>): Promise<Yup.ValidationError> {
    try {
        await validate(data, schema);
        throw new Error("Expected validation to fail but it passed");
    } catch (err) {
        if (err instanceof Yup.ValidationError) return err;
        throw err;
    }
}

// ─── AQM type: NIP + employer count rules ──────────────────────────────────

describe("ourContractValidationSchema — AQM type: _employers rules", () => {
    const schema = ourContractValidationSchema(false);

    it("rejects 0 employers for AQM", async () => {
        const err = await getErrors({ ...BASE_VALID, _type: AQM_TYPE, _employers: [] }, schema);
        const msgs = getFieldErrors(err, "_employers");
        expect(msgs.some((m) => m.includes("1 Zamawiającego"))).toBe(true);
    });

    it("rejects 2 employers for AQM", async () => {
        const err = await getErrors(
            {
                ...BASE_VALID,
                _type: AQM_TYPE,
                _employers: [
                    { id: 1, taxNumber: "5260250995" },
                    { id: 2, taxNumber: "1234563218" },
                ],
            },
            schema,
        );
        const msgs = getFieldErrors(err, "_employers");
        expect(msgs.some((m) => m.includes("tylko 1"))).toBe(true);
    });

    it("rejects 1 employer with missing NIP for AQM", async () => {
        const err = await getErrors(
            { ...BASE_VALID, _type: AQM_TYPE, _employers: [{ id: 1, taxNumber: null }] },
            schema,
        );
        const msgs = getFieldErrors(err, "_employers");
        expect(msgs.some((m) => m.includes("nie ma uzupełnionego NIP"))).toBe(true);
    });

    it("rejects 1 employer with invalid-checksum NIP for AQM (1234567890)", async () => {
        const err = await getErrors(
            { ...BASE_VALID, _type: AQM_TYPE, _employers: [{ id: 1, taxNumber: "1234567890" }] },
            schema,
        );
        const msgs = getFieldErrors(err, "_employers");
        expect(msgs.some((m) => m.includes("niepoprawny"))).toBe(true);
    });

    it("rejects 1 employer with all-zeros NIP for AQM (0000000000, guard O2.6)", async () => {
        const err = await getErrors(
            { ...BASE_VALID, _type: AQM_TYPE, _employers: [{ id: 1, taxNumber: "0000000000" }] },
            schema,
        );
        const msgs = getFieldErrors(err, "_employers");
        expect(msgs.some((m) => m.includes("niepoprawny"))).toBe(true);
    });

    it("accepts 1 employer with valid NIP for AQM (5260250995)", async () => {
        // Should not throw _employers error — may still throw other field errors
        // but _employers should be clean
        const err = await getErrors(
            { ...BASE_VALID, _type: AQM_TYPE, _employers: [{ id: 1, taxNumber: "5260250995" }] },
            schema,
        ).catch((e: Error) => {
            if (e.message === "Expected validation to fail but it passed") return null;
            throw e;
        });

        if (err === null) return; // whole form valid — _employers certainly OK
        // Otherwise check no _employers error
        const msgs = getFieldErrors(err as Yup.ValidationError, "_employers");
        expect(msgs).toHaveLength(0);
    });

    it("accepts 1 employer with dash-formatted NIP for AQM (747-191-75-75)", async () => {
        const err = await getErrors(
            { ...BASE_VALID, _type: AQM_TYPE, _employers: [{ id: 1, taxNumber: "747-191-75-75" }] },
            schema,
        ).catch((e: Error) => {
            if (e.message === "Expected validation to fail but it passed") return null;
            throw e;
        });

        if (err === null) return;
        const msgs = getFieldErrors(err as Yup.ValidationError, "_employers");
        expect(msgs).toHaveLength(0);
    });

    it("applies the same rule for isEditing=true (no branch difference)", async () => {
        const schemaEditing = ourContractValidationSchema(true);
        const err = await getErrors(
            { ...BASE_VALID, _type: AQM_TYPE, _employers: [{ id: 1, taxNumber: "1234567890" }] },
            schemaEditing,
        );
        const msgs = getFieldErrors(err, "_employers");
        expect(msgs.some((m) => m.includes("niepoprawny"))).toBe(true);
    });
});

// ─── Non-AQM regression: employer rule does NOT impose NIP ──────────────────

describe("ourContractValidationSchema — non-AQM type: NO NIP/employer regression", () => {
    const schema = ourContractValidationSchema(false);

    it("accepts any non-empty employer array without NIP for non-AQM type", async () => {
        const err = await getErrors(
            {
                ...BASE_VALID,
                _type: OTHER_TYPE,
                // employers with no taxNumber — should NOT trigger AQM NIP rule
                _employers: [{ id: 1, name: "Gmina ABC" }],
            },
            schema,
        ).catch((e: Error) => {
            if (e.message === "Expected validation to fail but it passed") return null;
            throw e;
        });

        if (err === null) return;
        const msgs = getFieldErrors(err as Yup.ValidationError, "_employers");
        // Must not get any NIP-related error
        expect(msgs.some((m) => m.includes("NIP") || m.includes("niepoprawny") || m.includes("AQM"))).toBe(false);
    });

    it("accepts multiple employers without NIP for non-AQM type", async () => {
        const err = await getErrors(
            {
                ...BASE_VALID,
                _type: OTHER_TYPE,
                _employers: [{ id: 1 }, { id: 2 }],
            },
            schema,
        ).catch((e: Error) => {
            if (e.message === "Expected validation to fail but it passed") return null;
            throw e;
        });

        if (err === null) return;
        const msgs = getFieldErrors(err as Yup.ValidationError, "_employers");
        expect(msgs.some((m) => m.includes("NIP") || m.includes("AQM") || m.includes("tylko 1"))).toBe(false);
    });
});
