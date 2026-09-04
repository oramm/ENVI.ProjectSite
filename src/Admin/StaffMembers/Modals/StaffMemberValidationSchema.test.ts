/**
 * Modal uprawnień dzieli reguły konta z modalem dodawania użytkownika (`accountFields`):
 * oba zapisują konto tą samą trasą v2, więc „FIDman wymaga e-maila systemowego" ma
 * zatrzymać zapis w obu oknach, przy obu polach. Pełny zestaw przypadków reguły:
 * `UserValidationSchema.test.ts`; tu tylko dowód, że modal uprawnień ją w ogóle niesie.
 */
import { describe, expect, it, vi } from "vitest";

vi.mock("../../../React/MainSetupReact", () => ({
    default: { isProjectScopedRoleId: () => false },
}));

import { makeStaffMemberValidationSchema } from "./StaffMemberValidationSchema";
import { FIDMAN_EMAIL_MESSAGE } from "../../../Persons/accountFieldsValidation";

const base = {
    systemRoleId: 3,
    isDriver: false,
    isInScrum: true,
    hasCostInvoiceAccess: false,
    hasBankAccess: false,
    canLogSiteVisits: false,
    isActive: true,
};

async function errorsFor(data: Record<string, unknown>): Promise<{ path: string; message: string }[]> {
    try {
        await makeStaffMemberValidationSchema(true).validate(data, { abortEarly: false });
        return [];
    } catch (error: any) {
        return (error.inner ?? []).map((e: any) => ({ path: e.path, message: e.message }));
    }
}

describe("StaffMemberValidationSchema - reguły konta w modalu uprawnień", () => {
    it("FIDman bez e-maila systemowego zatrzymuje zapis przy OBU polach", async () => {
        const errors = await errorsFor({ ...base, systemEmail: "", fidmanEnabled: true });
        const paths = errors.filter((e) => e.message === FIDMAN_EMAIL_MESSAGE).map((e) => e.path);
        expect(paths).toContain("systemEmail");
        expect(paths).toContain("fidmanEnabled");
    });

    it("FIDman z e-mailem systemowym przechodzi", async () => {
        const errors = await errorsFor({ ...base, systemEmail: "anna@envi.com.pl", fidmanEnabled: true });
        expect(errors).toEqual([]);
    });
});
