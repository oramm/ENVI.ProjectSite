import MainSetup from "../../../React/MainSetupReact";
import { validatePersonId } from "../../personsV2Helpers";

// ---------------------------------------------------------------------------
// DTOs
// ---------------------------------------------------------------------------

export interface SubmissionSearchResultDto {
    id: number;
    linkId: number;
    personId: number;
    email?: string;
    status: string; // DRAFT, SUBMITTED, CLOSED
    copyLink?: {
        url: string;
        expiresAt: string;
    };
    lastDispatch?: {
        recipientEmail?: string | null;
        status?: "LINK_GENERATED" | "LINK_SENT" | "LINK_SEND_FAILED" | null;
        eventAt?: string | null;
        eventByPersonId?: number | null;
        sendNowRequested?: boolean;
    };
    submittedAt?: string | null;
    closedAt?: string | null;
    createdAt?: string;
    updatedAt?: string;
}

export interface SubmissionItemDto {
    id: number;
    itemType: "EXPERIENCE" | "EDUCATION" | "SKILL";
    itemStatus: "PENDING" | "ACCEPTED" | "REJECTED";
    payload: Record<string, unknown>;
    acceptedTargetId?: number | null;
    reviewedByPersonId?: number | null;
    reviewedAt?: string | null;
    reviewComment?: string | null;
    createdAt?: string;
    updatedAt?: string;
}

export interface SubmissionDetailsDto extends SubmissionSearchResultDto {
    items: SubmissionItemDto[];
}

export interface CreateLinkResponseDto {
    personId: number;
    submissionId: number;
    copyLink?: {
        url: string;
        expiresAt: string;
    };
    lastDispatch?: {
        recipientEmail?: string | null;
        status: "LINK_GENERATED" | "LINK_SENT" | "LINK_SEND_FAILED";
        eventAt?: string | null;
        eventByPersonId?: number | null;
        sendNowRequested?: boolean;
    };
}

export interface CreateLinkRequestDto {
    recipientEmail?: string;
    sendNow?: boolean;
}

export interface ReviewItemResponseDto {
    submissionId: number;
    itemId: number;
    decision: "ACCEPT" | "REJECT";
    acceptedTargetId?: number;
    reviewComment?: string;
    autoClosed: boolean;
}

export interface CloseSubmissionResponseDto {
    submissionId: number;
    closed: boolean;
}

// ---------------------------------------------------------------------------
// Error handling
// ---------------------------------------------------------------------------

export type PersonPublicProfileSubmissionOfficeDomainErrorCode =
    | "UNAUTHORIZED"
    | "PERSON_NOT_FOUND"
    | "SUBMISSION_NOT_FOUND"
    | "ITEM_NOT_FOUND"
    | "ITEM_ALREADY_RESOLVED"
    | "SUBMISSION_ALREADY_CLOSED"
    | "SUBMISSION_HAS_PENDING_ITEMS"
    | "INVALID_REVIEW_DECISION"
    | "UNKNOWN";

export class PersonPublicProfileSubmissionOfficeApiError extends Error {
    readonly status?: number;
    readonly rawCode?: string;
    readonly details?: unknown;
    readonly domainCode: PersonPublicProfileSubmissionOfficeDomainErrorCode;

    constructor(params: {
        message: string;
        domainCode: PersonPublicProfileSubmissionOfficeDomainErrorCode;
        status?: number;
        rawCode?: string;
        details?: unknown;
    }) {
        super(params.message);
        this.name = "PersonPublicProfileSubmissionOfficeApiError";
        this.status = params.status;
        this.rawCode = params.rawCode;
        this.details = params.details;
        this.domainCode = params.domainCode;
    }
}

export function isPersonPublicProfileSubmissionOfficeApiError(
    error: unknown,
): error is PersonPublicProfileSubmissionOfficeApiError {
    return error instanceof PersonPublicProfileSubmissionOfficeApiError;
}

function mapDomainErrorCode(
    rawCode: string | null | undefined,
    status: number | undefined,
): PersonPublicProfileSubmissionOfficeDomainErrorCode {
    const normalized = rawCode?.trim().toUpperCase();

    const codeMap: Record<string, PersonPublicProfileSubmissionOfficeDomainErrorCode> = {
        SUBMISSION_NOT_FOUND: "SUBMISSION_NOT_FOUND",
        ITEM_NOT_FOUND: "ITEM_NOT_FOUND",
        ITEM_ALREADY_RESOLVED: "ITEM_ALREADY_RESOLVED",
        SUBMISSION_ALREADY_CLOSED: "SUBMISSION_ALREADY_CLOSED",
        SUBMISSION_HAS_PENDING_ITEMS: "SUBMISSION_HAS_PENDING_ITEMS",
        INVALID_REVIEW_DECISION: "INVALID_REVIEW_DECISION",
        PERSON_NOT_FOUND: "PERSON_NOT_FOUND",
        PERSON_PROFILE_NOT_FOUND: "PERSON_NOT_FOUND",
    };

    if (normalized && codeMap[normalized]) return codeMap[normalized];
    if (status === 401 || status === 403) return "UNAUTHORIZED";
    if (status === 404) return "SUBMISSION_NOT_FOUND";
    return "UNKNOWN";
}

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

interface OfficeApiErrorDto {
    status?: number;
    errorMessage?: string;
    code?: string;
    errorCode?: string;
    details?: unknown;
}

function staffBaseUrl(personId: number): string {
    return `${MainSetup.serverUrl}v2/persons/${personId}/experience-updates`;
}

async function requestJson<T>(
    url: string,
    method: "GET" | "POST",
    body?: unknown,
): Promise<T> {
    let response: Response;
    try {
        const headers: Record<string, string> = { Accept: "application/json" };
        if (body !== undefined) {
            headers["Content-Type"] = "application/json";
        }
        const init: RequestInit = {
            method,
            credentials: "include",
            headers,
        };
        if (body !== undefined) {
            init.body = JSON.stringify(body);
        }
        response = await fetch(url, init);
    } catch (error) {
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
        if (!text.trim()) return {} as T;
        return JSON.parse(text) as T;
    } catch {
        throw new PersonPublicProfileSubmissionOfficeApiError({
            message: "Invalid server response format",
            domainCode: "UNKNOWN",
            status: response.status,
        });
    }
}

async function mapOfficeApiError(
    response: Response,
): Promise<PersonPublicProfileSubmissionOfficeApiError> {
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

async function readOfficeErrorPayload(response: Response): Promise<OfficeApiErrorDto> {
    try {
        const text = await response.text();
        if (!text.trim()) return {};
        return JSON.parse(text) as OfficeApiErrorDto;
    } catch {
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
export async function createSubmissionLink(
    personId: number,
    request?: CreateLinkRequestDto,
): Promise<CreateLinkResponseDto> {
    const validId = validatePersonId(personId, "POST experience-updates/link");
    const url = `${staffBaseUrl(validId)}/link`;
    return requestJson<CreateLinkResponseDto>(url, "POST", request);
}

/**
 * POST /search -- szuka submissions dla danej osoby.
 * Opcjonalny filtr po statusie (DRAFT | SUBMITTED | CLOSED).
 */
export async function searchSubmissions(
    personId: number,
    status?: string,
): Promise<SubmissionSearchResultDto[]> {
    const validId = validatePersonId(personId, "POST experience-updates/search");
    const url = `${staffBaseUrl(validId)}/search`;
    const body: Record<string, unknown> = {};
    if (status) body.status = status;
    return requestJson<SubmissionSearchResultDto[]>(url, "POST", body);
}

/**
 * GET /:submissionId -- pelne dane submission z items.
 */
export async function getSubmissionDetails(
    personId: number,
    submissionId: number,
): Promise<SubmissionDetailsDto> {
    const validId = validatePersonId(personId, "GET experience-updates/:submissionId");
    const url = `${staffBaseUrl(validId)}/${submissionId}`;
    return requestJson<SubmissionDetailsDto>(url, "GET");
}

/**
 * POST /:submissionId/items/:itemId/review -- akceptuje lub odrzuca pojedynczy item.
 * Jesli po review nie ma juz PENDING items, submission zamykany automatycznie (autoClosed=true).
 */
export async function reviewItem(
    personId: number,
    submissionId: number,
    itemId: number,
    decision: "ACCEPT" | "REJECT",
    comment?: string,
): Promise<ReviewItemResponseDto> {
    const validId = validatePersonId(personId, "POST review item");
    const url = `${staffBaseUrl(validId)}/${submissionId}/items/${itemId}/review`;
    return requestJson<ReviewItemResponseDto>(url, "POST", { decision, comment });
}

/**
 * POST /:submissionId/close -- reczne zamkniecie submission.
 * Rzuca SUBMISSION_HAS_PENDING_ITEMS (409) jesli sa jeszcze PENDING items.
 */
export async function closeSubmission(
    personId: number,
    submissionId: number,
): Promise<CloseSubmissionResponseDto> {
    const validId = validatePersonId(personId, "POST close submission");
    const url = `${staffBaseUrl(validId)}/${submissionId}/close`;
    return requestJson<CloseSubmissionResponseDto>(url, "POST");
}
