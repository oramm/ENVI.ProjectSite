/**
 * Źródło „umowa” wywołuje właściwe metody SigningApi z id kontraktu i z właściwymi argumentami.
 * Sam SigningApi jest zaślepiony na granicy modułu (bez prawdziwych żądań do serwera).
 */
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { SignableFile } from "../../Signing/SigningApi";

const api = vi.hoisted(() => ({
    listContractSignableFiles: vi.fn(),
    createContractJob: vi.fn(),
    listContractSignatures: vi.fn(),
    uploadSignedToContract: vi.fn(),
    locateContractGraphicPlace: vi.fn(),
    contractFilePageImage: vi.fn(),
}));
vi.mock("../../Signing/SigningApi", async (importOriginal) => ({
    ...(await importOriginal<typeof import("../../Signing/SigningApi")>()),
    SigningApi: api,
}));

import { contractSigningSource } from "./contractSigningSource";

const FILE: SignableFile = {
    kind: "DRIVE_FILE",
    gdFileId: "GDFILE0000000001",
    name: "Umowa KLO.IK.01.pdf",
    mimeType: "application/pdf",
    withGraphic: false,
    graphicLocked: false,
};

beforeEach(() => {
    vi.clearAllMocks();
});

describe("contractSigningSource — wywołania API", () => {
    const source = contractSigningSource({ id: 42, ourId: "KLO.IK.01", alias: "FENX.09.01" });

    it("klucz zawiera id kontraktu", () => {
        expect(source.key).toBe("contract-42");
    });

    it("listFiles pyta o pliki do podpisu tego kontraktu", async () => {
        const result = { contractId: 42, contractLabel: "KLO.IK.01", files: [FILE], notSignable: [] };
        api.listContractSignableFiles.mockResolvedValue(result);

        await expect(source.listFiles()).resolves.toBe(result);
        expect(api.listContractSignableFiles).toHaveBeenCalledWith(42);
    });

    it("createJob zakłada zlecenie z id kontraktu i wybranymi plikami", async () => {
        const files = [{ kind: "DRIVE_FILE" as const, gdFileId: FILE.gdFileId, withGraphic: false }];
        api.createContractJob.mockResolvedValue({ jobId: 7, protocolUrl: "envi-podpis://job/X", expiresAt: "2026-10-10T10:00:00Z" });

        await source.createJob(files);
        expect(api.createContractJob).toHaveBeenCalledWith(42, files);
    });

    it("listSignatures zwraca tylko listę podpisów z odpowiedzi serwera", async () => {
        const signature = { id: 1, sourceType: "CONTRACT_DOCUMENT", signedGdFileId: "S1", signedName: "x_pdp.pdf", signedUrl: "u", signerName: "Anna", method: "LOCAL_APP", signedAt: "2026-10-01" };
        api.listContractSignatures.mockResolvedValue({ contractId: 42, signatures: [signature] });

        await expect(source.listSignatures()).resolves.toEqual([signature]);
        expect(api.listContractSignatures).toHaveBeenCalledWith(42);
    });

    it("uploadSigned wgrywa plik do tego kontraktu", async () => {
        const file = new File(["%PDF-1.4"], "podpisany.pdf", { type: "application/pdf" });
        api.uploadSignedToContract.mockResolvedValue({ signedGdFileId: "U1" });

        await source.uploadSigned(file);
        expect(api.uploadSignedToContract).toHaveBeenCalledWith(42, file);
    });

    it("onChanged nie woła serwera (umowa nie ma plakietki na liście)", () => {
        source.onChanged();
        expect(api.listContractSignatures).not.toHaveBeenCalled();
        expect(api.listContractSignableFiles).not.toHaveBeenCalled();
    });

    it("graphicPlace.locate szuka miejsca grafiki po gdFileId pliku", async () => {
        const found = { pages: [], candidates: [], stampRel: { width: 0.3, height: 0.1 } };
        api.locateContractGraphicPlace.mockResolvedValue(found);

        await expect(source.graphicPlace!.locate(FILE)).resolves.toBe(found);
        expect(api.locateContractGraphicPlace).toHaveBeenCalledWith(42, "GDFILE0000000001");
    });

    it("graphicPlace.pageImage pobiera obraz wskazanej strony pliku", async () => {
        const blob = new Blob(["png"], { type: "image/png" });
        api.contractFilePageImage.mockResolvedValue(blob);

        await expect(source.graphicPlace!.pageImage(FILE, 3)).resolves.toBe(blob);
        expect(api.contractFilePageImage).toHaveBeenCalledWith(42, "GDFILE0000000001", 3);
    });
});

describe("contractSigningSource — teksty", () => {
    it("tytuł z aliasem: „umowa {ourId} {alias}”", () => {
        const source = contractSigningSource({ id: 42, ourId: "KLO.IK.01", alias: "FENX.09.01" });
        expect(source.texts.subject).toBe("umowa KLO.IK.01 FENX.09.01");
    });

    it("bez aliasu tytuł to samo „umowa {ourId}”", () => {
        const source = contractSigningSource({ id: 42, ourId: "KLO.IK.01" });
        expect(source.texts.subject).toBe("umowa KLO.IK.01");
    });

    it("pusty alias też bez spacji na końcu", () => {
        const source = contractSigningSource({ id: 42, ourId: "KLO.IK.01", alias: "" });
        expect(source.texts.subject).toBe("umowa KLO.IK.01");
    });

    it("folder jest stały (bez zmiany po wczytaniu listy), a tekst ostrzeżenia dla umowy", async () => {
        const source = contractSigningSource({ id: 42, ourId: "KLO.IK.01" });
        expect(source.texts.inFolder).toBe("w folderze „Umowa i zmiany”");
        api.listContractSignableFiles.mockResolvedValueOnce({ contractId: 42, contractLabel: "KLO.IK.01", files: [], notSignable: [] });
        await source.listFiles();
        expect(source.texts.inFolder).toBe("w folderze „Umowa i zmiany”");
        expect(source.texts.thisHasAlready).toBe("Ten kontrakt ma już");
    });

    it("bez tekstów pisma i bez notatek", () => {
        const source = contractSigningSource({ id: 42, ourId: "KLO.IK.01" });
        expect(source.texts.mainDocBadge).toBeUndefined();
        expect(source.texts.lockedGraphicNote).toBeUndefined();
        expect(source.texts.noMainDocNote).toBeUndefined();
        expect(source.texts.doneNote).toBeUndefined();
    });
});

describe("contractSigningSource — po przeglądzie wizualnym", () => {
    it("alias równy oznaczeniu nie jest powtarzany w tytule", () => {
        expect(contractSigningSource({ id: 1, ourId: "DUW.AQM.02", alias: "DUW.AQM.02" }).texts.subject).toBe("umowa DUW.AQM.02");
    });

    it("w folderze umowy leży wiele plików, więc nic nie jest z góry zaznaczone do podpisu", () => {
        expect(contractSigningSource({ id: 1, ourId: "KLO.IK.01" }).preselectFiles).toBe(false);
    });
});
