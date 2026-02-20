import { describe, expect, it } from "vitest";
import { mapPublicProfileSubmissionDomainErrorCode } from "./publicProfileSubmissionApi";

describe("mapPublicProfileSubmissionDomainErrorCode", () => {
    it("maps PUBLIC_TOKEN_INVALID raw code", () => {
        expect(mapPublicProfileSubmissionDomainErrorCode("PUBLIC_TOKEN_INVALID", 404)).toBe("PUBLIC_TOKEN_INVALID");
    });

    it("maps PUBLIC_TOKEN_EXPIRED raw code", () => {
        expect(mapPublicProfileSubmissionDomainErrorCode("PUBLIC_TOKEN_EXPIRED", 410)).toBe("PUBLIC_TOKEN_EXPIRED");
    });

    it("maps EMAIL_VERIFY_REQUIRED raw code", () => {
        expect(mapPublicProfileSubmissionDomainErrorCode("EMAIL_VERIFY_REQUIRED", 401)).toBe("EMAIL_VERIFY_REQUIRED");
    });

    it("maps EMAIL_CODE_INVALID raw code", () => {
        expect(mapPublicProfileSubmissionDomainErrorCode("EMAIL_CODE_INVALID", 400)).toBe("EMAIL_CODE_INVALID");
    });

    it("maps EMAIL_CODE_EXPIRED raw code", () => {
        expect(mapPublicProfileSubmissionDomainErrorCode("EMAIL_CODE_EXPIRED", 400)).toBe("EMAIL_CODE_EXPIRED");
    });

    it("maps EMAIL_VERIFY_RATE_LIMITED raw code", () => {
        expect(mapPublicProfileSubmissionDomainErrorCode("EMAIL_VERIFY_RATE_LIMITED", 429)).toBe("EMAIL_VERIFY_RATE_LIMITED");
    });

    it("maps SUBMISSION_ALREADY_CLOSED raw code", () => {
        expect(mapPublicProfileSubmissionDomainErrorCode("SUBMISSION_ALREADY_CLOSED", 409)).toBe("SUBMISSION_ALREADY_CLOSED");
    });

    it("maps VALIDATION_ERROR to DRAFT_VALIDATION_FAILED", () => {
        expect(mapPublicProfileSubmissionDomainErrorCode("VALIDATION_ERROR", 422)).toBe("DRAFT_VALIDATION_FAILED");
    });

    it("maps status 401 fallback to EMAIL_VERIFY_REQUIRED", () => {
        expect(mapPublicProfileSubmissionDomainErrorCode(undefined, 401)).toBe("EMAIL_VERIFY_REQUIRED");
    });

    it("maps status 410 fallback to PUBLIC_TOKEN_EXPIRED", () => {
        expect(mapPublicProfileSubmissionDomainErrorCode(undefined, 410)).toBe("PUBLIC_TOKEN_EXPIRED");
    });

    it("maps status 429 fallback to EMAIL_VERIFY_RATE_LIMITED", () => {
        expect(mapPublicProfileSubmissionDomainErrorCode(undefined, 429)).toBe("EMAIL_VERIFY_RATE_LIMITED");
    });

    it("maps status 404 fallback to SUBMISSION_NOT_FOUND", () => {
        expect(mapPublicProfileSubmissionDomainErrorCode(undefined, 404)).toBe("SUBMISSION_NOT_FOUND");
    });

    it("returns UNKNOWN for unmapped code and status", () => {
        expect(mapPublicProfileSubmissionDomainErrorCode("SOMETHING_NEW", 500)).toBe("UNKNOWN");
    });
});
