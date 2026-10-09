/**
 * Wywołania serwera dla podpisu kwalifikowanego pism (pack SIG, SIG-4).
 *
 * Typy odpowiedzi odwzorowują kontrakt serwera: PS-nodeJS/src/signing/jobs/SigningJobsController.ts
 * (SignableFilesResult, JobStatusResult, ManualUploadResult, SignatureSummaryResult). Źródłem prawdy
 * jest kod serwera — tu tylko tyle, ile potrzebuje interfejs.
 *
 * Bez ponawiania żądań (ToolsFetch.fetchJsonWithSafeError, nie fetchWithRetry): zakładanie zlecenia
 * i wgrywanie pliku zapisują dane, a odpytywanie stanu ponawia się samo co chwilę.
 */
import MainSetup from "../../React/MainSetupReact";
import ToolsFetch from "../../React/Tools/ToolsFetch";

export type SigningJobStatus =
    | "created"
    | "preparing"
    | "prepared"
    | "finalizing"
    | "done"
    | "cancelled"
    | "expired"
    | "failed";

export const FINISHED_JOB_STATUSES: SigningJobStatus[] = ["done", "cancelled", "expired", "failed"];

export type SignableFileKind = "LETTER_DOC" | "DRIVE_FILE";

export type SignableFile = {
    kind: SignableFileKind;
    gdFileId: string;
    name: string;
    mimeType: string;
    withGraphic: boolean;
    graphicLocked: boolean;
};

export type NotSignableFile = {
    gdFileId: string;
    name: string;
    mimeType: string;
    reason: string;
};

export type SignableFilesResult = {
    letterId: number;
    letterNumber: string | null;
    files: SignableFile[];
    notSignable: NotSignableFile[];
};

export type RequestedSigningFile = {
    kind: SignableFileKind;
    gdFileId?: string;
    withGraphic: boolean;
};

export type CreatedSigningJob = {
    jobId: number;
    protocolUrl: string;
    expiresAt: string;
};

export type SigningJobFileStatus = {
    index: number;
    kind: SignableFileKind;
    name: string;
    withGraphic: boolean;
    pages: number | null;
    checkCode: string | null;
    previewAvailable: boolean;
    signedGdFileId: string | null;
    signedName: string | null;
    signedUrl: string | null;
};

export type SigningJobState = {
    jobId: number;
    letterId: number;
    status: SigningJobStatus;
    expiresAt: string;
    failureMessage: string | null;
    cancelReason: string | null;
    signer: { name: string; serial: string; issuer: string } | null;
    certChangedWarning: boolean;
    files: SigningJobFileStatus[];
};

export type LetterSignature = {
    id: number;
    sourceType: "LETTER" | "LETTER_ATTACHMENT" | "CONTRACT_DOCUMENT";
    signedGdFileId: string;
    signedName: string;
    signedUrl: string;
    signerName: string;
    method: "LOCAL_APP" | "MANUAL_UPLOAD";
    signedAt: string;
};

export type LetterSignatureSummaryEntry = {
    count: number;
    latestSignerName: string;
    latestSignedAt: string;
    signatures: LetterSignature[];
};

export type ManualUploadResult = {
    signedGdFileId: string;
    signedName: string;
    signedUrl: string;
    signerName: string;
    certChangedWarning: boolean;
};

const JSON_HEADERS = { "Content-Type": "application/json" };

function url(path: string): string {
    return MainSetup.serverUrl + path;
}

export const SigningApi = {
    listSignableFiles(letterId: number): Promise<SignableFilesResult> {
        return ToolsFetch.fetchJsonWithSafeError(url(`letter/${letterId}/signableFiles`), {
            credentials: "include",
        });
    },

    createJob(letterId: number, files: RequestedSigningFile[]): Promise<CreatedSigningJob> {
        return ToolsFetch.fetchJsonWithSafeError(url("signingJob"), {
            method: "POST",
            credentials: "include",
            headers: JSON_HEADERS,
            body: JSON.stringify({ letterId, files }),
        });
    },

    getJobState(jobId: number): Promise<SigningJobState> {
        return ToolsFetch.fetchJsonWithSafeError(url(`signingJob/${jobId}`), {
            credentials: "include",
            cache: "no-store",
        });
    },

    cancelJob(jobId: number, reason: string): Promise<{ status: SigningJobStatus }> {
        return ToolsFetch.fetchJsonWithSafeError(url(`signingJob/${jobId}/cancel`), {
            method: "POST",
            credentials: "include",
            headers: JSON_HEADERS,
            body: JSON.stringify({ reason }),
        });
    },

    /** Adres zamrożonego PDF-a do obejrzenia w przeglądarce (nowa karta, wbudowany podgląd PDF). */
    previewUrl(jobId: number, fileIndex: number): string {
        return url(`signingJob/${jobId}/file/${fileIndex}/preview`);
    },

    /** Adres instalatora programu ENVI Podpis (serwer oddaje plik jako załącznik). */
    programDownloadUrl(): string {
        return url("signing/program/download");
    },

    listLetterSignatures(letterId: number): Promise<{ letterId: number; signatures: LetterSignature[] }> {
        return ToolsFetch.fetchJsonWithSafeError(url(`letter/${letterId}/signatures`), {
            credentials: "include",
        });
    },

    summarizeSignatures(letterIds: number[]): Promise<{ summary: Record<string, LetterSignatureSummaryEntry> }> {
        return ToolsFetch.fetchJsonWithSafeError(url("letters/signatureSummary"), {
            method: "POST",
            credentials: "include",
            headers: JSON_HEADERS,
            body: JSON.stringify({ letterIds }),
        });
    },

    uploadSigned(letterId: number, file: File): Promise<ManualUploadResult> {
        const form = new FormData();
        form.append("file", file);
        // Bez nagłówka Content-Type: przeglądarka sama dopisze granicę multipart.
        return ToolsFetch.fetchJsonWithSafeError(url(`letter/${letterId}/signedPdf`), {
            method: "POST",
            credentials: "include",
            body: form,
        });
    },
};
