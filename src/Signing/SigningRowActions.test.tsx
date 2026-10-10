/**
 * Przyciski wiersza podpisu: pismo podpisujemy jeśli nasze, oferta jeśli zewnętrzna (odwrotnie).
 * Sprawdza też, że okno „Wgraj podpisany” ma tytuł z tekstami źródła (pismo bez zmian, oferta z aliasem).
 * SigningApi zaślepiony na granicy modułu, jak w SignDocumentsModal.test.tsx.
 */
import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import React from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const api = vi.hoisted(() => ({
    listSignableFiles: vi.fn(),
    listLetterSignatures: vi.fn(),
    createJob: vi.fn(),
    listOfferSignableFiles: vi.fn(),
    listOfferSignatures: vi.fn(),
    createOfferJob: vi.fn(),
    uploadSignedToOffer: vi.fn(),
    getJobState: vi.fn(),
    cancelJob: vi.fn(),
    uploadSigned: vi.fn(),
    previewUrl: (jobId: number, index: number) => `http://srv/signingJob/${jobId}/file/${index}/preview`,
    programDownloadUrl: () => "http://srv/signing/program/download",
}));
vi.mock("./SigningApi", async (importOriginal) => ({
    ...(await importOriginal<typeof import("./SigningApi")>()),
    SigningApi: api,
}));

import { SignOurLetterPdfButton, UploadSignedLetterButton } from "../Letters/Signing/SigningRowActions";
import { SignOfferFilesButton, UploadSignedOfferFileButton } from "../Offers/Signing/OfferSigningRowActions";

type LetterRow = React.ComponentProps<typeof SignOurLetterPdfButton>["dataObject"];
type OfferRow = React.ComponentProps<typeof SignOfferFilesButton>["dataObject"];

const letter = (isOur: boolean) => ({ id: 6168, number: "6168", isOur }) as unknown as LetterRow;
const offer = (isOur: boolean) => ({ id: 42, alias: "OŚ", employerName: "Gmina Brzeg", isOur }) as unknown as OfferRow;

const SIGN_TITLE = "PDF z podpisem kwalifikowanym";
const UPLOAD_TITLE = "Wgraj podpisany PDF";

beforeEach(() => {
    vi.clearAllMocks();
    api.listSignableFiles.mockResolvedValue({ letterId: 6168, letterNumber: "6168", files: [], notSignable: [] });
    api.listLetterSignatures.mockResolvedValue({ letterId: 6168, signatures: [] });
    api.listOfferSignableFiles.mockResolvedValue({ offerId: 42, offerAlias: "OŚ", files: [], notSignable: [] });
    api.listOfferSignatures.mockResolvedValue({ offerId: 42, signatures: [] });
});

describe("akcje wiersza — pismo (podpisujemy nasze)", () => {
    it("pismo nasze ma przycisk podpisu i wgrania", () => {
        render(<SignOurLetterPdfButton dataObject={letter(true)} layout="vertical" />);
        render(<UploadSignedLetterButton dataObject={letter(true)} layout="vertical" />);

        expect(screen.getByTitle(SIGN_TITLE)).toBeInTheDocument();
        expect(screen.getByTitle(UPLOAD_TITLE)).toBeInTheDocument();
    });

    it("pismo przychodzące nie ma żadnego z tych przycisków", () => {
        const { container } = render(
            <>
                <SignOurLetterPdfButton dataObject={letter(false)} layout="vertical" />
                <UploadSignedLetterButton dataObject={letter(false)} layout="vertical" />
            </>
        );

        expect(container).toBeEmptyDOMElement();
        expect(screen.queryByTitle(SIGN_TITLE)).toBeNull();
        expect(screen.queryByTitle(UPLOAD_TITLE)).toBeNull();
    });

    it("„Wgraj podpisany” przy piśmie otwiera okno z tytułem „Wgraj podpisany — pismo 6168” (bez zmian)", async () => {
        render(<UploadSignedLetterButton dataObject={letter(true)} layout="vertical" />);

        fireEvent.click(screen.getByTitle(UPLOAD_TITLE));

        const dialog = await screen.findByRole("dialog");
        expect(within(dialog).getByText("Wgraj podpisany — pismo 6168")).toBeInTheDocument();
    });
});

describe("akcje wiersza — oferta (podpisujemy zewnętrzne)", () => {
    it("oferta własna nie ma przycisku podpisu ani wgrania", () => {
        const { container } = render(
            <>
                <SignOfferFilesButton dataObject={offer(true)} layout="vertical" />
                <UploadSignedOfferFileButton dataObject={offer(true)} layout="vertical" />
            </>
        );

        expect(container).toBeEmptyDOMElement();
    });

    it("oferta zewnętrzna ma przycisk podpisu i wgrania", () => {
        render(<SignOfferFilesButton dataObject={offer(false)} layout="vertical" />);
        render(<UploadSignedOfferFileButton dataObject={offer(false)} layout="vertical" />);

        expect(screen.getByTitle(SIGN_TITLE)).toBeInTheDocument();
        expect(screen.getByTitle(UPLOAD_TITLE)).toBeInTheDocument();
    });

    it("„Wgraj podpisany” przy ofercie otwiera okno z tytułem zawierającym „oferta OŚ”", async () => {
        render(<UploadSignedOfferFileButton dataObject={offer(false)} layout="vertical" />);

        fireEvent.click(screen.getByTitle(UPLOAD_TITLE));

        const dialog = await screen.findByRole("dialog");
        expect(within(dialog).getByText(/Wgraj podpisany — oferta OŚ/)).toBeInTheDocument();
        expect(within(dialog).getByText("Wgraj podpisany — oferta OŚ, Gmina Brzeg")).toBeInTheDocument();
    });

    it("„PDF z podpisem” przy ofercie zewnętrznej pyta serwer o pliki tej oferty", async () => {
        render(<SignOfferFilesButton dataObject={offer(false)} layout="vertical" />);

        fireEvent.click(screen.getByTitle(SIGN_TITLE));

        await waitFor(() => expect(api.listOfferSignableFiles).toHaveBeenCalledWith(42));
        expect(await screen.findByText(/PDF z podpisem — oferta OŚ, Gmina Brzeg/)).toBeInTheDocument();
    });
});
