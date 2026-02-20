"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PublicProfileSubmissionApiError = void 0;
exports.isPublicProfileSubmissionApiError = isPublicProfileSubmissionApiError;
exports.mapPublicProfileSubmissionDomainErrorCode = mapPublicProfileSubmissionDomainErrorCode;
exports.createPublicProfileSubmissionApi = createPublicProfileSubmissionApi;
const MainSetupReact_1 = __importDefault(require("../../../React/MainSetupReact"));
// ---------------------------------------------------------------------------
// Error class
// ---------------------------------------------------------------------------
class PublicProfileSubmissionApiError extends Error {
    constructor(params) {
        super(params.message);
        this.name = "PublicProfileSubmissionApiError";
        this.status = params.status;
        this.rawCode = params.rawCode;
        this.details = params.details;
        this.domainCode = params.domainCode;
    }
}
exports.PublicProfileSubmissionApiError = PublicProfileSubmissionApiError;
function isPublicProfileSubmissionApiError(error) {
    return error instanceof PublicProfileSubmissionApiError;
}
// ---------------------------------------------------------------------------
// Error code mapping (BE codes → domain codes)
// ---------------------------------------------------------------------------
function mapPublicProfileSubmissionDomainErrorCode(rawCode, status) {
    const normalizedRawCode = rawCode?.trim().toUpperCase();
    const fromRawCode = {
        PUBLIC_TOKEN_INVALID: "PUBLIC_TOKEN_INVALID",
        PUBLIC_TOKEN_EXPIRED: "PUBLIC_TOKEN_EXPIRED",
        EMAIL_VERIFY_REQUIRED: "EMAIL_VERIFY_REQUIRED",
        EMAIL_CODE_INVALID: "EMAIL_CODE_INVALID",
        EMAIL_CODE_EXPIRED: "EMAIL_CODE_EXPIRED",
        EMAIL_VERIFY_RATE_LIMITED: "EMAIL_VERIFY_RATE_LIMITED",
        SUBMISSION_ALREADY_CLOSED: "SUBMISSION_ALREADY_CLOSED",
        SUBMISSION_NOT_FOUND: "SUBMISSION_NOT_FOUND",
        FORBIDDEN: "FORBIDDEN",
        VALIDATION_ERROR: "DRAFT_VALIDATION_FAILED",
    };
    if (normalizedRawCode && fromRawCode[normalizedRawCode])
        return fromRawCode[normalizedRawCode];
    if (status === 401)
        return "EMAIL_VERIFY_REQUIRED";
    if (status === 403)
        return "FORBIDDEN";
    if (status === 404)
        return "SUBMISSION_NOT_FOUND";
    if (status === 410)
        return "PUBLIC_TOKEN_EXPIRED";
    if (status === 429)
        return "EMAIL_VERIFY_RATE_LIMITED";
    if (status === 400 || status === 422)
        return "DRAFT_VALIDATION_FAILED";
    return "UNKNOWN";
}
// ---------------------------------------------------------------------------
// API factory
// ---------------------------------------------------------------------------
function createPublicProfileSubmissionApi(linkToken) {
    const token = linkToken.trim();
    if (!token)
        throw new Error("linkToken is required");
    const baseUrl = `${MainSetupReact_1.default.serverUrl}v2/public/profile-submission/${encodeURIComponent(token)}`;
    let sessionToken = null;
    // -- internal helpers ---------------------------------------------------
    async function fetchJson(endpoint, options = {}, requireSession = false) {
        const headers = new Headers(options.headers || {});
        if (requireSession) {
            if (!sessionToken)
                throw new Error("Session token required — complete email verification first");
            headers.set("Authorization", `Bearer ${sessionToken}`);
        }
        headers.set("Accept", "application/json");
        if (options.body && !(options.body instanceof FormData) && !headers.has("Content-Type")) {
            headers.set("Content-Type", "application/json");
        }
        let response;
        try {
            response = await fetch(`${baseUrl}${endpoint}`, {
                ...options,
                headers,
            });
        }
        catch (error) {
            throw new PublicProfileSubmissionApiError({
                message: error instanceof Error ? error.message : "Network error during public profile submission request",
                domainCode: "UNKNOWN",
            });
        }
        if (!response.ok) {
            const apiError = await mapApiError(response);
            throw apiError;
        }
        try {
            return (await response.json());
        }
        catch {
            throw new PublicProfileSubmissionApiError({
                message: "Invalid server response format",
                domainCode: "UNKNOWN",
                status: response.status,
            });
        }
    }
    // -- public API ---------------------------------------------------------
    return {
        /** Store the session token received from confirmVerifyCode */
        setSessionToken(newToken) {
            sessionToken = newToken.trim();
        },
        /** Retrieve the current session token (or null if not yet verified) */
        getSessionToken() {
            return sessionToken;
        },
        // Phase 1: no Bearer required ---
        /** GET /:token — basic submission info (status, items) */
        getSubmissionInfo() {
            return fetchJson("", { method: "GET" });
        },
        /** POST /:token/verify-email/request-code */
        requestVerifyCode(email) {
            return fetchJson("/verify-email/request-code", {
                method: "POST",
                body: JSON.stringify({ email }),
            });
        },
        /** POST /:token/verify-email/confirm-code */
        confirmVerifyCode(email, code) {
            return fetchJson("/verify-email/confirm-code", {
                method: "POST",
                body: JSON.stringify({ email, code }),
            });
        },
        // Phase 2: Bearer session-token required ---
        /** GET /:token/draft */
        getDraft() {
            return fetchJson("/draft", { method: "GET" }, true);
        },
        /** PUT /:token/draft — flat payload { experiences?, educations?, skills? } */
        updateDraft(payload) {
            return fetchJson("/draft", {
                method: "PUT",
                body: JSON.stringify(payload),
            }, true);
        },
        /** POST /:token/analyze-file — multipart/form-data */
        analyzeFile(file, hint) {
            const formData = new FormData();
            formData.append("file", file);
            if (hint)
                formData.append("hint", hint);
            return fetchJson("/analyze-file", {
                method: "POST",
                body: formData,
            }, true);
        },
        /** POST /:token/submit */
        submit() {
            return fetchJson("/submit", {
                method: "POST",
            }, true);
        },
    };
}
// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------
async function mapApiError(response) {
    const errorDto = await readErrorPayload(response);
    const rawCode = errorDto.errorCode || errorDto.code;
    const message = errorDto.errorMessage || `HTTP ${response.status}: public profile submission request failed`;
    const domainCode = mapPublicProfileSubmissionDomainErrorCode(rawCode, response.status);
    return new PublicProfileSubmissionApiError({
        message,
        domainCode,
        status: response.status,
        rawCode,
        details: errorDto.details,
    });
}
async function readErrorPayload(response) {
    try {
        return (await response.json());
    }
    catch {
        return {};
    }
}
