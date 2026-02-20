import { describe, expect, it } from "vitest";

// The old mapPersonPublicProfileSubmissionOfficeDomainErrorCode is now a private
// function (mapDomainErrorCode). These tests verify the error class and type guard
// which are the public API of this module.

import {
    PersonPublicProfileSubmissionOfficeApiError,
    isPersonPublicProfileSubmissionOfficeApiError,
} from "./personPublicProfileSubmissionReviewApi";

describe("PersonPublicProfileSubmissionOfficeApiError", () => {
    it("creates error with correct properties", () => {
        const error = new PersonPublicProfileSubmissionOfficeApiError({
            message: "Submission not found",
            domainCode: "SUBMISSION_NOT_FOUND",
            status: 404,
            rawCode: "SUBMISSION_NOT_FOUND",
        });
        expect(error.message).toBe("Submission not found");
        expect(error.domainCode).toBe("SUBMISSION_NOT_FOUND");
        expect(error.status).toBe(404);
        expect(error.name).toBe("PersonPublicProfileSubmissionOfficeApiError");
    });

    it("is detected by type guard", () => {
        const error = new PersonPublicProfileSubmissionOfficeApiError({
            message: "test",
            domainCode: "UNKNOWN",
        });
        expect(isPersonPublicProfileSubmissionOfficeApiError(error)).toBe(true);
    });

    it("type guard returns false for plain Error", () => {
        expect(isPersonPublicProfileSubmissionOfficeApiError(new Error("test"))).toBe(false);
    });

    it("type guard returns false for non-errors", () => {
        expect(isPersonPublicProfileSubmissionOfficeApiError(null)).toBe(false);
        expect(isPersonPublicProfileSubmissionOfficeApiError("string")).toBe(false);
    });
});
