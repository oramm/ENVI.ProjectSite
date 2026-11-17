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
import MainSetup from "../React/MainSetupReact";
import ToolsFetch from "../React/Tools/ToolsFetch";

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
    signedNameHint?: boolean;
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

/** Miejsce grafiki podpisu: strona od 1, prostokąt w punktach PDF (początek układu: lewy dolny róg strony). */
export type GraphicPlacement = {
    page: number;
    rect: { x: number; y: number; width: number; height: number };
};

/**
 * Odpowiedź serwera „gdzie w pliku może stanąć grafika”: rozmiary stron (punkty PDF), standardowy
 * rozmiar grafiki jako ułamek strony i miejsca oznaczone w dokumencie jako podpis wykonawcy.
 * Dokładnie jeden kandydat = bierzemy go bez pytania; zero albo kilka = użytkownik klika miejsce.
 */
export type GraphicPlaceSearch = {
    pages: { width: number; height: number; placeable: boolean }[];
    candidates: (GraphicPlacement & { label: string })[];
    stampRel: { width: number; height: number };
};

export type OfferSignableFilesResult = {
    offerId: number;
    offerAlias: string;
    /** Skąd serwer wziął pliki: podfolder „Oferta” albo, gdy go nie ma, folder sprawy „Przygotowanie oferty”. */
    folder: "OFERTA" | "CASE";
    files: SignableFile[];
    notSignable: NotSignableFile[];
};

/** Dokumenty umowy ENVI z folderu sprawy „Umowa i zmiany”; serwer zwraca je wprost, bez podfolderu. */
export type ContractSignableFilesResult = {
    contractId: number;
    contractLabel: string;
    files: SignableFile[];
    notSignable: NotSignableFile[];
};

export type RequestedSigningFile = {
    kind: SignableFileKind;
    gdFileId?: string;
    withGraphic: boolean;
    /** Tylko źródła z wyborem miejsca (oferta): gdzie ma stanąć grafika. */
    placement?: GraphicPlacement;
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
    /** Id kontraktu ENVI, gdy zlecenie dotyczy dokumentów umowy; inaczej null. Pole opcjonalne: starsze odpowiedzi i fixture'y go nie niosą. */
    contractId?: number | null;
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
    sourceType: "LETTER" | "LETTER_ATTACHMENT" | "CONTRACT_DOCUMENT" | "OFFER_DOCUMENT";
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

/** Odpowiedź `signing/program/info`: `available=false` - program nie jest teraz do pobrania. */
export type SigningProgramInfo = { available: boolean; version: string | null };

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

    /** Czy instalator programu można pobrać i jaka to wersja (strona ENVI Podpis). */
    programInfo(): Promise<SigningProgramInfo> {
        return ToolsFetch.fetchJsonWithSafeError(url("signing/program/info"), {
            credentials: "include",
        });
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
        return uploadSignedTo(`letter/${letterId}/signedPdf`, file);
    },

    // ------------------------------------------------------------------ oferta (pliki z folderu „Oferta”)

    listOfferSignableFiles(offerId: number): Promise<OfferSignableFilesResult> {
        return ToolsFetch.fetchJsonWithSafeError(url(`offer/${offerId}/signableFiles`), {
            credentials: "include",
        });
    },

    createOfferJob(offerId: number, files: RequestedSigningFile[]): Promise<CreatedSigningJob> {
        return ToolsFetch.fetchJsonWithSafeError(url("signingJob"), {
            method: "POST",
            credentials: "include",
            headers: JSON_HEADERS,
            body: JSON.stringify({ offerId, files }),
        });
    },

    listOfferSignatures(offerId: number): Promise<{ offerId: number; signatures: LetterSignature[] }> {
        return ToolsFetch.fetchJsonWithSafeError(url(`offer/${offerId}/signatures`), {
            credentials: "include",
        });
    },

    uploadSignedToOffer(offerId: number, file: File): Promise<ManualUploadResult> {
        return uploadSignedTo(`offer/${offerId}/signedPdf`, file);
    },

    locateOfferGraphicPlace(offerId: number, gdFileId: string): Promise<GraphicPlaceSearch> {
        return ToolsFetch.fetchJsonWithSafeError(
            url(`offer/${offerId}/signableFile/${encodeURIComponent(gdFileId)}/graphicPlace`),
            { credentials: "include", cache: "no-store" }
        );
    },

    /** Obraz strony pliku oferty (PNG). Pobierany z sesją jak reszta API, dlatego jako Blob, a nie adres dla <img>. */
    offerFilePageImage(offerId: number, gdFileId: string, page: number): Promise<Blob> {
        return pageImage(`offer/${offerId}/signableFile/${encodeURIComponent(gdFileId)}/page/${page}`);
    },

    // ------------------------------------------------------------------ umowa ENVI (pliki z folderu „Umowa i zmiany”)

    listContractSignableFiles(contractId: number): Promise<ContractSignableFilesResult> {
        return ToolsFetch.fetchJsonWithSafeError(url(`contract/${contractId}/signableFiles`), {
            credentials: "include",
        });
    },

    createContractJob(contractId: number, files: RequestedSigningFile[]): Promise<CreatedSigningJob> {
        return ToolsFetch.fetchJsonWithSafeError(url("signingJob"), {
            method: "POST",
            credentials: "include",
            headers: JSON_HEADERS,
            body: JSON.stringify({ contractId, files }),
        });
    },

    listContractSignatures(contractId: number): Promise<{ contractId: number; signatures: LetterSignature[] }> {
        return ToolsFetch.fetchJsonWithSafeError(url(`contract/${contractId}/signatures`), {
            credentials: "include",
        });
    },

    uploadSignedToContract(contractId: number, file: File): Promise<ManualUploadResult> {
        return uploadSignedTo(`contract/${contractId}/signedPdf`, file);
    },

    locateContractGraphicPlace(contractId: number, gdFileId: string): Promise<GraphicPlaceSearch> {
        return ToolsFetch.fetchJsonWithSafeError(
            url(`contract/${contractId}/signableFile/${encodeURIComponent(gdFileId)}/graphicPlace`),
            { credentials: "include", cache: "no-store" }
        );
    },

    /** Obraz strony pliku umowy (PNG). Jak przy ofercie: Blob z sesją, a nie adres dla <img>. */
    contractFilePageImage(contractId: number, gdFileId: string, page: number): Promise<Blob> {
        return pageImage(`contract/${contractId}/signableFile/${encodeURIComponent(gdFileId)}/page/${page}`);
    },
};

/** Obraz strony (PNG) jako Blob z sesją. Omija fetchJsonWithSafeError, więc sesję i brak sieci obsługujemy tutaj. */
async function pageImage(path: string): Promise<Blob> {
    let response: Response;
    try {
        response = await fetch(url(path), { credentials: "include", cache: "no-store" });
    } catch {
        throw new Error("Brak połączenia z serwerem. Spróbuj ponownie za chwilę.");
    }
    if (!response.ok) {
        if (response.status === 401) ToolsFetch.notifySessionExpired();
        let message = "Nie udało się pobrać obrazu strony.";
        try {
            const body = await response.json();
            if (typeof body?.errorMessage === "string") message = body.errorMessage;
            else if (typeof body?.message === "string") message = body.message;
        } catch {
            // odpowiedź bez JSON - zostaje komunikat ogólny
        }
        throw new Error(message);
    }
    return response.blob();
}

function uploadSignedTo(path: string, file: File): Promise<ManualUploadResult> {
    const form = new FormData();
    form.append("file", file);
    // Bez nagłówka Content-Type: przeglądarka sama dopisze granicę multipart.
    return ToolsFetch.fetchJsonWithSafeError(url(path), {
        method: "POST",
        credentials: "include",
        body: form,
    });
}
