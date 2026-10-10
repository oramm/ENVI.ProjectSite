import {
    CreatedSigningJob,
    LetterSignature,
    ManualUploadResult,
    NotSignableFile,
    RequestedSigningFile,
    SignableFile,
} from "./SigningApi";

/**
 * Źródło plików do podpisu: pismo, a później oferta i dokumenty kontraktu. Okno podpisu i panel
 * „Wgraj podpisany” są wspólne i znają tylko to, co tu opisane — nowe miejsce w PS to nowe źródło,
 * a nie kopia okna.
 */
export type SigningSource = {
    /** Unikalny na stronie klucz do identyfikatorów pól, np. "letter-6168". */
    key: string;
    listFiles(): Promise<{ files: SignableFile[]; notSignable: NotSignableFile[] }>;
    createJob(files: RequestedSigningFile[]): Promise<CreatedSigningJob>;
    /** Już istniejące podpisy (ostrzeżenie przed kolejnym), najnowszy pierwszy. */
    listSignatures(): Promise<LetterSignature[]>;
    uploadSigned(file: File): Promise<ManualUploadResult>;
    /** Po podpisie albo wgraniu pliku: odświeżenie plakietek i podobnych. */
    onChanged(): void;
    texts: {
        /** Do tytułu okna: „PDF z podpisem — pismo 12”. */
        subject: string;
        /** „w folderze pisma” — gdzie leżą pliki i dokąd trafiają podpisane kopie. */
        inFolder: string;
        /** Początek ostrzeżenia o istniejących podpisach: „To pismo ma już”. */
        thisHasAlready: string;
        /** Plakietka przy dokumencie głównym (plik typu LETTER_DOC). */
        mainDocBadge?: string;
        /** Wyjaśnienie przy pliku z grafiką, której nie da się wyłączyć. */
        lockedGraphicNote?: string;
        /** Gdy źródło powinno mieć dokument główny, a go nie ma. */
        noMainDocNote?: string;
        /** Druga linia komunikatu „Gotowe”. */
        doneNote?: string;
    };
};
