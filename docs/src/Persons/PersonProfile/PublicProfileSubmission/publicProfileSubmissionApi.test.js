"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const publicProfileSubmissionApi_1 = require("./publicProfileSubmissionApi");
(0, vitest_1.describe)("mapPublicProfileSubmissionDomainErrorCode", () => {
    (0, vitest_1.it)("maps PUBLIC_TOKEN_INVALID raw code", () => {
        (0, vitest_1.expect)((0, publicProfileSubmissionApi_1.mapPublicProfileSubmissionDomainErrorCode)("PUBLIC_TOKEN_INVALID", 404)).toBe("PUBLIC_TOKEN_INVALID");
    });
    (0, vitest_1.it)("maps PUBLIC_TOKEN_EXPIRED raw code", () => {
        (0, vitest_1.expect)((0, publicProfileSubmissionApi_1.mapPublicProfileSubmissionDomainErrorCode)("PUBLIC_TOKEN_EXPIRED", 410)).toBe("PUBLIC_TOKEN_EXPIRED");
    });
    (0, vitest_1.it)("maps EMAIL_VERIFY_REQUIRED raw code", () => {
        (0, vitest_1.expect)((0, publicProfileSubmissionApi_1.mapPublicProfileSubmissionDomainErrorCode)("EMAIL_VERIFY_REQUIRED", 401)).toBe("EMAIL_VERIFY_REQUIRED");
    });
    (0, vitest_1.it)("maps EMAIL_CODE_INVALID raw code", () => {
        (0, vitest_1.expect)((0, publicProfileSubmissionApi_1.mapPublicProfileSubmissionDomainErrorCode)("EMAIL_CODE_INVALID", 400)).toBe("EMAIL_CODE_INVALID");
    });
    (0, vitest_1.it)("maps EMAIL_CODE_EXPIRED raw code", () => {
        (0, vitest_1.expect)((0, publicProfileSubmissionApi_1.mapPublicProfileSubmissionDomainErrorCode)("EMAIL_CODE_EXPIRED", 400)).toBe("EMAIL_CODE_EXPIRED");
    });
    (0, vitest_1.it)("maps EMAIL_VERIFY_RATE_LIMITED raw code", () => {
        (0, vitest_1.expect)((0, publicProfileSubmissionApi_1.mapPublicProfileSubmissionDomainErrorCode)("EMAIL_VERIFY_RATE_LIMITED", 429)).toBe("EMAIL_VERIFY_RATE_LIMITED");
    });
    (0, vitest_1.it)("maps SUBMISSION_ALREADY_CLOSED raw code", () => {
        (0, vitest_1.expect)((0, publicProfileSubmissionApi_1.mapPublicProfileSubmissionDomainErrorCode)("SUBMISSION_ALREADY_CLOSED", 409)).toBe("SUBMISSION_ALREADY_CLOSED");
    });
    (0, vitest_1.it)("maps VALIDATION_ERROR to DRAFT_VALIDATION_FAILED", () => {
        (0, vitest_1.expect)((0, publicProfileSubmissionApi_1.mapPublicProfileSubmissionDomainErrorCode)("VALIDATION_ERROR", 422)).toBe("DRAFT_VALIDATION_FAILED");
    });
    (0, vitest_1.it)("maps status 401 fallback to EMAIL_VERIFY_REQUIRED", () => {
        (0, vitest_1.expect)((0, publicProfileSubmissionApi_1.mapPublicProfileSubmissionDomainErrorCode)(undefined, 401)).toBe("EMAIL_VERIFY_REQUIRED");
    });
    (0, vitest_1.it)("maps status 410 fallback to PUBLIC_TOKEN_EXPIRED", () => {
        (0, vitest_1.expect)((0, publicProfileSubmissionApi_1.mapPublicProfileSubmissionDomainErrorCode)(undefined, 410)).toBe("PUBLIC_TOKEN_EXPIRED");
    });
    (0, vitest_1.it)("maps status 429 fallback to EMAIL_VERIFY_RATE_LIMITED", () => {
        (0, vitest_1.expect)((0, publicProfileSubmissionApi_1.mapPublicProfileSubmissionDomainErrorCode)(undefined, 429)).toBe("EMAIL_VERIFY_RATE_LIMITED");
    });
    (0, vitest_1.it)("maps status 404 fallback to SUBMISSION_NOT_FOUND", () => {
        (0, vitest_1.expect)((0, publicProfileSubmissionApi_1.mapPublicProfileSubmissionDomainErrorCode)(undefined, 404)).toBe("SUBMISSION_NOT_FOUND");
    });
    (0, vitest_1.it)("returns UNKNOWN for unmapped code and status", () => {
        (0, vitest_1.expect)((0, publicProfileSubmissionApi_1.mapPublicProfileSubmissionDomainErrorCode)("SOMETHING_NEW", 500)).toBe("UNKNOWN");
    });
});
