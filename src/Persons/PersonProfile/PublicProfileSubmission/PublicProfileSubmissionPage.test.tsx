import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
    PublicProfileSubmissionInfoDto,
    PublicProfileSubmissionPrivacyNoticeDto,
} from "./publicProfileSubmissionApi.types";

/**
 * ROD-7: klauzula informacyjna na publicznym formularzu. Testowane: klauzula widoczna na stronie
 * startowej PRZED przyciskiem „Kontynuuj", plakietka przy tekście zastępczym (i jej brak przy tekście
 * docelowym), odporność na starszy backend bez klauzuli, przypomnienie przed „Wyślij do recenzji".
 */
const hoisted = vi.hoisted(() => ({
    getSubmissionInfo: vi.fn(),
    requestVerifyCode: vi.fn(),
    confirmVerifyCode: vi.fn(),
    getDraft: vi.fn(),
    getPrivacyStatus: vi.fn(),
    acknowledgePrivacy: vi.fn(),
}));

vi.mock("react-router-dom", () => ({
    useParams: () => ({ token: "tok-123" }),
}));
vi.mock("../Import/ProfileImportModal", () => ({
    default: () => null,
}));
vi.mock("./publicProfileSubmissionImportApi", () => ({
    createPublicProfileSubmissionImportApi: () => undefined,
}));
vi.mock("./publicProfileSubmissionApi", async () => {
    const actual = await vi.importActual<typeof import("./publicProfileSubmissionApi")>(
        "./publicProfileSubmissionApi",
    );
    return {
        ...actual,
        createPublicProfileSubmissionApi: () => ({
            setSessionToken: () => undefined,
            getSessionToken: () => "session",
            getSubmissionInfo: hoisted.getSubmissionInfo,
            requestVerifyCode: hoisted.requestVerifyCode,
            confirmVerifyCode: hoisted.confirmVerifyCode,
            getDraft: hoisted.getDraft,
            getPrivacyStatus: hoisted.getPrivacyStatus,
            acknowledgePrivacy: hoisted.acknowledgePrivacy,
            updateDraft: vi.fn(),
            analyzeFile: vi.fn(),
            submit: vi.fn(),
        }),
    };
});

import PublicProfileSubmissionPage from "./PublicProfileSubmissionPage";

const NOTICE_TITLE = "Informacja o przetwarzaniu danych osobowych";

const notice = (
    over: Partial<PublicProfileSubmissionPrivacyNoticeDto> = {},
): PublicProfileSubmissionPrivacyNoticeDto => ({
    isPlaceholder: true,
    title: NOTICE_TITLE,
    sections: [
        { heading: "Administrator danych", text: "Administratorem jest Firma Testowa." },
        { heading: "Cel przetwarzania", text: "Aktualizacja profilu zawodowego." },
        { heading: "Okres przechowywania", text: "Przez czas prowadzenia profilu." },
    ],
    ...over,
});

const info = (over: Partial<PublicProfileSubmissionInfoDto> = {}): PublicProfileSubmissionInfoDto => ({
    id: 1,
    linkId: 2,
    personId: 3,
    status: "DRAFT",
    items: [],
    privacyNotice: notice(),
    ...over,
});

describe("PublicProfileSubmissionPage - klauzula informacyjna (ROD-7)", () => {
    beforeEach(() => {
        hoisted.getSubmissionInfo.mockReset();
        hoisted.requestVerifyCode.mockReset();
        hoisted.confirmVerifyCode.mockReset();
        hoisted.getDraft.mockReset();
        const privacy = { notice: { ...notice(), scope: "PUBLIC_PROFILE", version: "1", revision: "1" }, acknowledged: false, acknowledgedAt: null };
        hoisted.getPrivacyStatus.mockReset().mockResolvedValue(privacy);
        hoisted.acknowledgePrivacy.mockReset().mockResolvedValue({ ...privacy, acknowledged: true });
    });

    it("strona startowa pokazuje klauzulę z sekcjami przed przyciskiem „Kontynuuj”", async () => {
        hoisted.getSubmissionInfo.mockResolvedValue(info());
        render(<PublicProfileSubmissionPage />);

        const title = await screen.findByText(NOTICE_TITLE);
        expect(screen.getByText("Wersja robocza")).toBeTruthy();
        expect(screen.queryByText("DRAFT")).toBeNull();
        expect(screen.getByText(/Administratorem jest Firma Testowa/)).toBeTruthy();
        expect(screen.getByText(/Aktualizacja profilu zawodowego/)).toBeTruthy();
        expect(screen.getByText(/Przez czas prowadzenia profilu/)).toBeTruthy();

        const button = screen.getByRole("button", { name: "Kontynuuj" });
        const position = title.compareDocumentPosition(button);
        expect(position & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    });

    it("tekst zastępczy = czerwona plakietka; tekst docelowy = bez plakietki", async () => {
        hoisted.getSubmissionInfo.mockResolvedValue(info());
        const first = render(<PublicProfileSubmissionPage />);
        expect(await screen.findByText(/Tekst zastępczy/)).toBeTruthy();
        first.unmount();

        hoisted.getSubmissionInfo.mockResolvedValue(
            info({ privacyNotice: notice({ isPlaceholder: false }) }),
        );
        render(<PublicProfileSubmissionPage />);
        await screen.findByText(NOTICE_TITLE);
        expect(screen.queryByText(/Tekst zastępczy/)).toBeNull();
    });

    it("starszy backend bez klauzuli: strona działa, klauzuli po prostu nie ma", async () => {
        hoisted.getSubmissionInfo.mockResolvedValue(info({ privacyNotice: undefined }));
        render(<PublicProfileSubmissionPage />);

        expect(await screen.findByRole("button", { name: "Kontynuuj" })).toBeTruthy();
        expect(screen.queryByText(NOTICE_TITLE)).toBeNull();
        expect(screen.queryByTestId("privacy-notice")).toBeNull();
    });

    it("krok wysyłki: przypomnienie obok „Wyslij do recenzji”, pełna treść po rozwinięciu", async () => {
        hoisted.getSubmissionInfo.mockResolvedValue(info());
        hoisted.requestVerifyCode.mockResolvedValue({
            submissionId: 1,
            email: "osoba@test.local",
            codeExpiresAt: "2026-09-08T12:00:00.000Z",
        });
        hoisted.confirmVerifyCode.mockResolvedValue({
            submissionId: 1,
            publicSessionToken: "session",
            expiresAt: "2026-09-09T12:00:00.000Z",
        });
        hoisted.getDraft.mockResolvedValue({ status: "DRAFT", experiences: [], educations: [], skills: [] });
        render(<PublicProfileSubmissionPage />);

        fireEvent.click(await screen.findByRole("button", { name: "Kontynuuj" }));
        fireEvent.change(screen.getByPlaceholderText("jan@example.com"), {
            target: { value: "osoba@test.local" },
        });
        fireEvent.click(screen.getByRole("button", { name: "Wyslij kod" }));
        fireEvent.change(await screen.findByPlaceholderText("000000"), { target: { value: "123456" } });
        fireEvent.click(screen.getByRole("button", { name: "Potwierdz" }));

        const checkbox = await screen.findByRole("checkbox");
        expect(hoisted.getDraft).not.toHaveBeenCalled();
        expect(hoisted.acknowledgePrivacy).not.toHaveBeenCalled();
        expect(checkbox).not.toBeChecked();
        expect(screen.getByRole("button", { name: "Przejdź dalej" })).toBeDisabled();
        fireEvent.click(checkbox);
        fireEvent.click(screen.getByRole("button", { name: "Przejdź dalej" }));
        await screen.findByRole("button", { name: "Wyslij do recenzji" });
        expect(hoisted.acknowledgePrivacy).toHaveBeenCalledOnce();
        expect(
            screen.getByText(/jest dostępna do ponownego wglądu/),
        ).toBeTruthy();
        expect(screen.queryByText(NOTICE_TITLE)).toBeNull();

        fireEvent.click(screen.getByRole("button", { name: "Pokaż informację" }));
        expect(screen.getByText(NOTICE_TITLE)).toBeTruthy();
        expect(screen.getByText(/Tekst zastępczy/)).toBeTruthy();
    });
});
