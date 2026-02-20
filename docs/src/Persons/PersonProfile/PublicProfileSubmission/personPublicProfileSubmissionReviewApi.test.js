"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
// The old mapPersonPublicProfileSubmissionOfficeDomainErrorCode is now a private
// function (mapDomainErrorCode). These tests verify the error class and type guard
// which are the public API of this module.
const personPublicProfileSubmissionReviewApi_1 = require("./personPublicProfileSubmissionReviewApi");
(0, vitest_1.describe)("PersonPublicProfileSubmissionOfficeApiError", () => {
    (0, vitest_1.it)("creates error with correct properties", () => {
        const error = new personPublicProfileSubmissionReviewApi_1.PersonPublicProfileSubmissionOfficeApiError({
            message: "Submission not found",
            domainCode: "SUBMISSION_NOT_FOUND",
            status: 404,
            rawCode: "SUBMISSION_NOT_FOUND",
        });
        (0, vitest_1.expect)(error.message).toBe("Submission not found");
        (0, vitest_1.expect)(error.domainCode).toBe("SUBMISSION_NOT_FOUND");
        (0, vitest_1.expect)(error.status).toBe(404);
        (0, vitest_1.expect)(error.name).toBe("PersonPublicProfileSubmissionOfficeApiError");
    });
    (0, vitest_1.it)("is detected by type guard", () => {
        const error = new personPublicProfileSubmissionReviewApi_1.PersonPublicProfileSubmissionOfficeApiError({
            message: "test",
            domainCode: "UNKNOWN",
        });
        (0, vitest_1.expect)((0, personPublicProfileSubmissionReviewApi_1.isPersonPublicProfileSubmissionOfficeApiError)(error)).toBe(true);
    });
    (0, vitest_1.it)("type guard returns false for plain Error", () => {
        (0, vitest_1.expect)((0, personPublicProfileSubmissionReviewApi_1.isPersonPublicProfileSubmissionOfficeApiError)(new Error("test"))).toBe(false);
    });
    (0, vitest_1.it)("type guard returns false for non-errors", () => {
        (0, vitest_1.expect)((0, personPublicProfileSubmissionReviewApi_1.isPersonPublicProfileSubmissionOfficeApiError)(null)).toBe(false);
        (0, vitest_1.expect)((0, personPublicProfileSubmissionReviewApi_1.isPersonPublicProfileSubmissionOfficeApiError)("string")).toBe(false);
    });
});
