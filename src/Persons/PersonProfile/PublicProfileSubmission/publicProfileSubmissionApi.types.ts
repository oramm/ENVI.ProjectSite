import {
    AiPersonProfileResult,
    AiProfileEducation,
    AiProfileExperience,
    AiProfileSkill,
    PersonProfileEducationV2Payload,
    PersonProfileExperienceV2Payload,
    PersonProfileSkillV2Record,
} from "../../../../Typings/bussinesTypes";

// ---------------------------------------------------------------------------
// Domain error codes (matching BE: PublicProfileSubmissionErrors.ts)
// ---------------------------------------------------------------------------

export type PublicProfileSubmissionDomainErrorCode =
    | "PUBLIC_TOKEN_INVALID"
    | "PUBLIC_TOKEN_EXPIRED"
    | "EMAIL_VERIFY_REQUIRED"
    | "EMAIL_CODE_INVALID"
    | "EMAIL_CODE_EXPIRED"
    | "EMAIL_VERIFY_RATE_LIMITED"
    | "SUBMISSION_ALREADY_CLOSED"
    | "SUBMISSION_NOT_FOUND"
    | "DRAFT_VALIDATION_FAILED"
    | "FORBIDDEN"
    | "UNKNOWN";

// ---------------------------------------------------------------------------
// Email verification
// ---------------------------------------------------------------------------

export interface RequestVerifyCodeRequest {
    email: string;
}

export interface RequestVerifyCodeResponse {
    submissionId: number;
    email: string;
    codeExpiresAt: string;
}

export interface ConfirmVerifyCodeRequest {
    email: string;
    code: string;
}

export interface ConfirmVerifyCodeResponse {
    submissionId: number;
    publicSessionToken: string;
    expiresAt: string;
}

// ---------------------------------------------------------------------------
// Submission info (GET /:token)
// ---------------------------------------------------------------------------

export type ItemType = "EXPERIENCE" | "EDUCATION" | "SKILL";

export interface PublicProfileSubmissionItemDto {
    id: number;
    itemType: ItemType;
    itemStatus: ItemStatus;
    payload: unknown;
    acceptedTargetId?: number | null;
    reviewedByPersonId?: number | null;
    reviewedAt?: string | null;
    createdAt?: string;
    updatedAt?: string;
}

export type SubmissionStatus = "DRAFT" | "SUBMITTED" | "CLOSED";
export type ItemStatus = "PENDING" | "ACCEPTED" | "REJECTED";

export interface PublicProfileSubmissionInfoDto {
    id: number;
    linkId: number;
    personId: number;
    email?: string;
    status: SubmissionStatus;
    submittedAt?: string | null;
    closedAt?: string | null;
    createdAt?: string;
    updatedAt?: string;
    items: PublicProfileSubmissionItemDto[];
}

// ---------------------------------------------------------------------------
// Draft item DTOs (used in PUT /draft request & GET/PUT /draft response)
// ---------------------------------------------------------------------------

export type PublicProfileSubmissionExperienceDto = Pick<
    PersonProfileExperienceV2Payload,
    "organizationName" | "positionName" | "description" | "dateFrom" | "dateTo" | "isCurrent" | "sortOrder"
>;

export type PublicProfileSubmissionEducationDto = Pick<
    PersonProfileEducationV2Payload,
    "schoolName" | "degreeName" | "fieldOfStudy" | "dateFrom" | "dateTo" | "sortOrder"
>;

export type PublicProfileSubmissionSkillDto = Partial<Pick<
    PersonProfileSkillV2Record,
    "skillId" | "levelCode" | "yearsOfExperience" | "sortOrder"
>> & {
    name?: string;
};

// ---------------------------------------------------------------------------
// Draft request (PUT /draft) — FLAT payload, no wrapper
// ---------------------------------------------------------------------------

export interface PublicProfileSubmissionDraftUpsertRequestDto {
    experiences?: PublicProfileSubmissionExperienceDto[];
    educations?: PublicProfileSubmissionEducationDto[];
    skills?: PublicProfileSubmissionSkillDto[];
}

// ---------------------------------------------------------------------------
// Draft response (GET /draft, PUT /draft) — items have id + status mixed in
// ---------------------------------------------------------------------------

export interface PublicProfileSubmissionDraftExperienceItem extends PublicProfileSubmissionExperienceDto {
    id: number;
    status: ItemStatus;
}

export interface PublicProfileSubmissionDraftEducationItem extends PublicProfileSubmissionEducationDto {
    id: number;
    status: ItemStatus;
}

export interface PublicProfileSubmissionDraftSkillItem extends PublicProfileSubmissionSkillDto {
    id: number;
    status: ItemStatus;
}

export interface PublicProfileSubmissionDraftResponseDto {
    status: SubmissionStatus;
    experiences: PublicProfileSubmissionDraftExperienceItem[];
    educations: PublicProfileSubmissionDraftEducationItem[];
    skills: PublicProfileSubmissionDraftSkillItem[];
}

// ---------------------------------------------------------------------------
// Submit response (POST /submit)
// ---------------------------------------------------------------------------

export interface PublicProfileSubmissionSubmitResponseDto extends PublicProfileSubmissionInfoDto {}

// ---------------------------------------------------------------------------
// Analyze file response (POST /analyze-file)
// ---------------------------------------------------------------------------

export interface PublicProfileSubmissionAnalyzeFileResponseDto extends AiPersonProfileResult {}

// ---------------------------------------------------------------------------
// Error DTO (shape returned by BE error responses)
// ---------------------------------------------------------------------------

export interface PublicProfileSubmissionErrorDto {
    status?: number;
    errorMessage?: string;
    code?: string;
    errorCode?: string;
    details?: unknown;
}
