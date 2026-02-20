"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PersonPublicProfileSubmissionOfficeApiError = void 0;
exports.isPersonPublicProfileSubmissionOfficeApiError = isPersonPublicProfileSubmissionOfficeApiError;
exports.createSubmissionLink = createSubmissionLink;
exports.searchSubmissions = searchSubmissions;
exports.getSubmissionDetails = getSubmissionDetails;
exports.reviewItem = reviewItem;
exports.closeSubmission = closeSubmission;
const MainSetupReact_1 = __importDefault(require("../../../React/MainSetupReact"));
const personsV2Helpers_1 = require("../../personsV2Helpers");
class PersonPublicProfileSubmissionOfficeApiError extends Error {
    constructor(params) {
        super(params.message);
        this.name = "PersonPublicProfileSubmissionOfficeApiError";
        this.status = params.status;
        this.rawCode = params.rawCode;
        this.details = params.details;
        this.domainCode = params.domainCode;
    }
}
exports.PersonPublicProfileSubmissionOfficeApiError = PersonPublicProfileSubmissionOfficeApiError;
function isPersonPublicProfileSubmissionOfficeApiError(error) {
    return error instanceof PersonPublicProfileSubmissionOfficeApiError;
}
function mapDomainErrorCode(rawCode, status) {
    const normalized = rawCode?.trim().toUpperCase();
    const codeMap = {
        SUBMISSION_NOT_FOUND: "SUBMISSION_NOT_FOUND",
        ITEM_NOT_FOUND: "ITEM_NOT_FOUND",
        ITEM_ALREADY_RESOLVED: "ITEM_ALREADY_RESOLVED",
        SUBMISSION_ALREADY_CLOSED: "SUBMISSION_ALREADY_CLOSED",
        SUBMISSION_HAS_PENDING_ITEMS: "SUBMISSION_HAS_PENDING_ITEMS",
        INVALID_REVIEW_DECISION: "INVALID_REVIEW_DECISION",
        PERSON_NOT_FOUND: "PERSON_NOT_FOUND",
        PERSON_PROFILE_NOT_FOUND: "PERSON_NOT_FOUND",
    };
    if (normalized && codeMap[normalized])
        return codeMap[normalized];
    if (status === 401 || status === 403)
        return "UNAUTHORIZED";
    if (status === 404)
        return "SUBMISSION_NOT_FOUND";
    return "UNKNOWN";
}
function staffBaseUrl(personId) {
    return `${MainSetupReact_1.default.serverUrl}v2/persons/${personId}/public-profile-submissions`;
}
async function requestJson(url, method, body) {
    let response;
    try {
        const headers = { Accept: "application/json" };
        if (body !== undefined) {
            headers["Content-Type"] = "application/json";
        }
        const init = {
            method,
            credentials: "include",
            headers,
        };
        if (body !== undefined) {
            init.body = JSON.stringify(body);
        }
        response = await fetch(url, init);
    }
    catch (error) {
        throw new PersonPublicProfileSubmissionOfficeApiError({
            message: error instanceof Error ? error.message : "Network error during office public submission request",
            domainCode: "UNKNOWN",
        });
    }
    if (!response.ok) {
        throw await mapOfficeApiError(response);
    }
    try {
        const text = await response.text();
        if (!text.trim())
            return {};
        return JSON.parse(text);
    }
    catch {
        throw new PersonPublicProfileSubmissionOfficeApiError({
            message: "Invalid server response format",
            domainCode: "UNKNOWN",
            status: response.status,
        });
    }
}
async function mapOfficeApiError(response) {
    const errorDto = await readOfficeErrorPayload(response);
    const rawCode = errorDto.errorCode || errorDto.code;
    const domainCode = mapDomainErrorCode(rawCode, response.status);
    const message = errorDto.errorMessage || `HTTP ${response.status}: office public submission request failed`;
    return new PersonPublicProfileSubmissionOfficeApiError({
        message,
        domainCode,
        status: response.status,
        rawCode,
        details: errorDto.details,
    });
}
async function readOfficeErrorPayload(response) {
    try {
        const text = await response.text();
        if (!text.trim())
            return {};
        return JSON.parse(text);
    }
    catch {
        return {};
    }
}
// ---------------------------------------------------------------------------
// Public API functions
// ---------------------------------------------------------------------------
/**
 * POST /link -- tworzy nowy link do publicznego formularza.
 * Revokuje poprzedni aktywny link.
 */
async function createSubmissionLink(personId, request) {
    const validId = (0, personsV2Helpers_1.validatePersonId)(personId, "POST public-profile-submissions/link");
    const url = `${staffBaseUrl(validId)}/link`;
    return requestJson(url, "POST", request);
}
/**
 * POST /search -- szuka submissions dla danej osoby.
 * Opcjonalny filtr po statusie (DRAFT | SUBMITTED | CLOSED).
 */
async function searchSubmissions(personId, status) {
    const validId = (0, personsV2Helpers_1.validatePersonId)(personId, "POST public-profile-submissions/search");
    const url = `${staffBaseUrl(validId)}/search`;
    const body = {};
    if (status)
        body.status = status;
    return requestJson(url, "POST", body);
}
/**
 * GET /:submissionId -- pelne dane submission z items.
 */
async function getSubmissionDetails(personId, submissionId) {
    const validId = (0, personsV2Helpers_1.validatePersonId)(personId, "GET public-profile-submissions/:submissionId");
    const url = `${staffBaseUrl(validId)}/${submissionId}`;
    return requestJson(url, "GET");
}
/**
 * POST /:submissionId/items/:itemId/review -- akceptuje lub odrzuca pojedynczy item.
 * Jesli po review nie ma juz PENDING items, submission zamykany automatycznie (autoClosed=true).
 */
async function reviewItem(personId, submissionId, itemId, decision) {
    const validId = (0, personsV2Helpers_1.validatePersonId)(personId, "POST review item");
    const url = `${staffBaseUrl(validId)}/${submissionId}/items/${itemId}/review`;
    return requestJson(url, "POST", { decision });
}
/**
 * POST /:submissionId/close -- reczne zamkniecie submission.
 * Rzuca SUBMISSION_HAS_PENDING_ITEMS (409) jesli sa jeszcze PENDING items.
 */
async function closeSubmission(personId, submissionId) {
    const validId = (0, personsV2Helpers_1.validatePersonId)(personId, "POST close submission");
    const url = `${staffBaseUrl(validId)}/${submissionId}/close`;
    return requestJson(url, "POST");
}
