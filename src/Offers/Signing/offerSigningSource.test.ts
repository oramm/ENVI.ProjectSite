/**
 * Źródło „oferta” wywołuje właściwe metody SigningApi z id oferty i z właściwymi argumentami.
 * Sam SigningApi jest zaślepiony na granicy modułu (bez prawdziwych żądań do serwera).
 */
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { SignableFile } from "../../Signing/SigningApi";

const api = vi.hoisted(() => ({
    listOfferSignableFiles: vi.fn(),
    createOfferJob: vi.fn(),
    listOfferSignatures: vi.fn(),
    uploadSignedToOffer: vi.fn(),
    locateOfferGraphicPlace: vi.fn(),
    offerFilePageImage: vi.fn(),
}));
vi.mock("../../Signing/SigningApi", async (importOriginal) => ({
    ...(await importOriginal<typeof import("../../Signing/SigningApi")>()),
    SigningApi: api,
}));

import { offerSigningSource } from "./offerSigningSource";

const FILE: SignableFile = {
    kind: "DRIVE_FILE",
    gdFileId: "GDFILE0000000001",
    name: "Oferta OŚ.pdf",
    mimeType: "application/pdf",
    withGraphic: false,
    graphicLocked: false,
};

beforeEach(() => {
    vi.clearAllMocks();
});

describe("offerSigningSource — wywołania API", () => {
    const source = offerSigningSource({ id: 42, alias: "OŚ", employerName: "Gmina Brzeg" });

    it("klucz zawiera id oferty", () => {
        expect(source.key).toBe("offer-42");
    });

    it("listFiles pyta o pliki do podpisu tej oferty", async () => {
        const result = { offerId: 42, offerAlias: "OŚ", files: [FILE], notSignable: [] };
        api.listOfferSignableFiles.mockResolvedValue(result);

        await expect(source.listFiles()).resolves.toBe(result);
        expect(api.listOfferSignableFiles).toHaveBeenCalledWith(42);
    });

    it("createJob zakłada zlecenie z id oferty i wybranymi plikami", async () => {
        const files = [{ kind: "DRIVE_FILE" as const, gdFileId: FILE.gdFileId, withGraphic: true }];
        api.createOfferJob.mockResolvedValue({ jobId: 7, protocolUrl: "envi-podpis://job/X", expiresAt: "2026-10-10T10:00:00Z" });

        await source.createJob(files);
        expect(api.createOfferJob).toHaveBeenCalledWith(42, files);
    });

    it("listSignatures zwraca tylko listę podpisów z odpowiedzi serwera", async () => {
        const signature = { id: 1, sourceType: "OFFER_DOCUMENT", signedGdFileId: "S1", signedName: "x_pdp.pdf", signedUrl: "u", signerName: "Anna", method: "LOCAL_APP", signedAt: "2026-10-01" };
        api.listOfferSignatures.mockResolvedValue({ offerId: 42, signatures: [signature] });

        await expect(source.listSignatures()).resolves.toEqual([signature]);
        expect(api.listOfferSignatures).toHaveBeenCalledWith(42);
    });

    it("uploadSigned wgrywa plik do tej oferty", async () => {
        const file = new File(["%PDF-1.4"], "podpisany.pdf", { type: "application/pdf" });
        api.uploadSignedToOffer.mockResolvedValue({ signedGdFileId: "U1" });

        await source.uploadSigned(file);
        expect(api.uploadSignedToOffer).toHaveBeenCalledWith(42, file);
    });

    it("onChanged nie woła serwera (oferta nie ma plakietki na liście)", () => {
        source.onChanged();
        expect(api.listOfferSignatures).not.toHaveBeenCalled();
        expect(api.listOfferSignableFiles).not.toHaveBeenCalled();
    });

    it("graphicPlace.locate szuka miejsca grafiki po gdFileId pliku", async () => {
        const found = { pages: [], candidates: [], stampRel: { width: 0.3, height: 0.1 } };
        api.locateOfferGraphicPlace.mockResolvedValue(found);

        await expect(source.graphicPlace!.locate(FILE)).resolves.toBe(found);
        expect(api.locateOfferGraphicPlace).toHaveBeenCalledWith(42, "GDFILE0000000001");
    });

    it("graphicPlace.pageImage pobiera obraz wskazanej strony pliku", async () => {
        const blob = new Blob(["png"], { type: "image/png" });
        api.offerFilePageImage.mockResolvedValue(blob);

        await expect(source.graphicPlace!.pageImage(FILE, 3)).resolves.toBe(blob);
        expect(api.offerFilePageImage).toHaveBeenCalledWith(42, "GDFILE0000000001", 3);
    });
});

describe("offerSigningSource — teksty", () => {
    it("tytuł z nazwiskiem zleceniodawcy: „oferta {alias}, {employerName}”", () => {
        const source = offerSigningSource({ id: 42, alias: "OŚ", employerName: "Gmina Brzeg" });
        expect(source.texts.subject).toBe("oferta OŚ, Gmina Brzeg");
    });

    it("bez zleceniodawcy tytuł to samo „oferta {alias}”", () => {
        const source = offerSigningSource({ id: 42, alias: "OŚ" });
        expect(source.texts.subject).toBe("oferta OŚ");
    });

    it("bez zleceniodawcy (pusty łańcuch) też bez przecinka", () => {
        const source = offerSigningSource({ id: 42, alias: "OŚ", employerName: "" });
        expect(source.texts.subject).toBe("oferta OŚ");
    });

    it("folder, ostrzeżenie o podpisach i brak tekstów pisma", () => {
        const source = offerSigningSource({ id: 42, alias: "OŚ" });
        expect(source.texts.inFolder).toBe("w folderze „Oferta”");
        expect(source.texts.thisHasAlready).toBe("Ta oferta ma już");
        expect(source.texts.mainDocBadge).toBeUndefined();
        expect(source.texts.lockedGraphicNote).toBeUndefined();
        expect(source.texts.noMainDocNote).toBeUndefined();
        expect(source.texts.doneNote).toBeUndefined();
    });
});
