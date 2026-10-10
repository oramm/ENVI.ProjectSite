/**
 * SIG-4 — okno „PDF z podpisem”. Sprawdza, że w każdym stanie zlecenia użytkownik widzi zdanie
 * o tym, co się dzieje, i następny krok, oraz że do serwera idzie dokładnie to, co zaznaczył.
 * Serwer jest zaślepiony na granicy SigningApi; odpytywanie idzie prawdziwym timerem (1,5 s).
 */
import { act, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import React from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { GraphicPlaceSearch, SignableFile, SigningJobState } from "./SigningApi";
import type { SigningSource } from "./SigningSource";

const api = vi.hoisted(() => ({
    listSignableFiles: vi.fn(),
    listLetterSignatures: vi.fn(),
    createJob: vi.fn(),
    getJobState: vi.fn(),
    cancelJob: vi.fn(),
    previewUrl: (jobId: number, index: number) => `http://srv/signingJob/${jobId}/file/${index}/preview`,
    programDownloadUrl: () => "http://srv/signing/program/download",
    uploadSigned: vi.fn(),
    summarizeSignatures: vi.fn(),
}));
vi.mock("./SigningApi", async (importOriginal) => ({
    ...(await importOriginal<typeof import("./SigningApi")>()),
    SigningApi: api,
}));

import { letterSigningSource } from "../Letters/Signing/letterSigningSource";
import { PROGRAM_MISSING_AFTER_MS, SignDocumentsModal } from "./SignDocumentsModal";

const SIGNABLE = {
    letterId: 6168,
    letterNumber: "6168",
    files: [
        { kind: "LETTER_DOC", gdFileId: "LETTERDOC0000001", name: "Pismo próbne", mimeType: "application/vnd.google-apps.document", withGraphic: true, graphicLocked: true },
        { kind: "DRIVE_FILE", gdFileId: "ATTACHPDF0000001", name: "Załącznik 1.pdf", mimeType: "application/pdf", withGraphic: false, graphicLocked: false },
        { kind: "DRIVE_FILE", gdFileId: "ATTACHDOC0000001", name: "Notatka", mimeType: "application/vnd.google-apps.document", withGraphic: false, graphicLocked: false },
    ],
    notSignable: [
        { gdFileId: "NOSIGN00000001", name: "Umowa.docx", mimeType: "x", reason: "Ten format nie jest podpisywany w PS." },
    ],
};

function jobState(over: Partial<SigningJobState>): SigningJobState {
    return {
        jobId: 77,
        status: "created",
        expiresAt: new Date(Date.now() + 9 * 60000).toISOString(),
        failureMessage: null,
        cancelReason: null,
        signer: null,
        certChangedWarning: false,
        files: [],
        ...over,
    };
}

function renderModal(extra: Record<string, unknown> = {}) {
    const onHide = vi.fn();
    const onSigned = vi.fn();
    render(<SignDocumentsModal show source={letterSigningSource(6168, "6168")} onHide={onHide} onSigned={onSigned} {...extra} />);
    return { onHide, onSigned };
}

const footerButton = (name: RegExp) => within(document.querySelector(".modal-footer") as HTMLElement).getByRole("button", { name });

beforeEach(() => {
    Object.values(api).forEach((fn) => typeof fn === "function" && "mockReset" in fn && (fn as ReturnType<typeof vi.fn>).mockReset());
    api.listSignableFiles.mockResolvedValue(SIGNABLE);
    api.listLetterSignatures.mockResolvedValue({ letterId: 6168, signatures: [] });
    api.createJob.mockResolvedValue({ jobId: 77, protocolUrl: "envi-podpis://job/TOKENTOKENTOKENTOKEN123", expiresAt: new Date(Date.now() + 600000).toISOString() });
    api.getJobState.mockResolvedValue(jobState({ status: "created" }));
    api.cancelJob.mockResolvedValue({ status: "cancelled" });
});

afterEach(() => {
    vi.useRealTimers();
});

describe("SignDocumentsModal — wybór plików", () => {
    it("pismo ma zablokowaną grafikę z wyjaśnieniem, załączniki domyślnie podpis tak, grafika nie, a niepodpisywalne są wyszarzone z powodem", async () => {
        renderModal();

        expect(await screen.findByText("Pismo próbne")).toBeInTheDocument();
        const letterGraphic = document.getElementById("graphic-LETTER_DOC") as HTMLInputElement;
        expect(letterGraphic.checked).toBe(true);
        expect(letterGraphic.disabled).toBe(true);
        expect(screen.getByText(/Pismo zawsze dostaje widoczny podpis z grafiką/)).toBeInTheDocument();

        expect((document.getElementById("sign-F:ATTACHPDF0000001") as HTMLInputElement).checked).toBe(true);
        expect((document.getElementById("graphic-F:ATTACHPDF0000001") as HTMLInputElement).checked).toBe(false);
        expect(screen.getByText("Umowa.docx")).toBeInTheDocument();
        expect(screen.getByText("Ten format nie jest podpisywany w PS.")).toBeInTheDocument();
        expect(footerButton(/Podpisz \(3 pliki\)/)).toBeEnabled();
    });

    it("bez żadnego zaznaczonego pliku „Podpisz” jest zablokowane i jest napisane dlaczego", async () => {
        renderModal();
        await screen.findByText("Pismo próbne");

        for (const id of ["sign-LETTER_DOC", "sign-F:ATTACHPDF0000001", "sign-F:ATTACHDOC0000001"])
            fireEvent.click(document.getElementById(id) as HTMLInputElement);

        expect(screen.getByText("Zaznacz co najmniej jeden plik do podpisu.")).toBeInTheDocument();
        expect(footerButton(/^Podpisz/)).toBeDisabled();
    });

    it("do serwera idzie dokładnie wybór użytkownika: pismo z grafiką zawsze, załącznik z grafiką tylko po zaznaczeniu, odznaczony pomijany", async () => {
        const launched: string[] = [];
        const click = vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(function (this: HTMLAnchorElement) {
            launched.push(this.href);
        });
        renderModal();
        await screen.findByText("Pismo próbne");
        fireEvent.click(document.getElementById("graphic-F:ATTACHPDF0000001") as HTMLInputElement);
        fireEvent.click(document.getElementById("sign-F:ATTACHDOC0000001") as HTMLInputElement);

        fireEvent.click(footerButton(/^Podpisz/));

        await waitFor(() => expect(api.createJob).toHaveBeenCalledTimes(1));
        expect(api.createJob).toHaveBeenCalledWith(6168, [
            { kind: "LETTER_DOC", gdFileId: undefined, withGraphic: true },
            { kind: "DRIVE_FILE", gdFileId: "ATTACHPDF0000001", withGraphic: true },
        ]);
        await waitFor(() => expect(launched).toEqual(["envi-podpis://job/TOKENTOKENTOKENTOKEN123"]));
        expect(await screen.findByText("Otwieram program ENVI Podpis…")).toBeInTheDocument();
        expect(screen.getByText(/Jeśli przeglądarka zapyta/)).toBeInTheDocument();
        click.mockRestore();
    });

    it("odmowa zakładania zlecenia wraca do listy z komunikatem serwera i przyciskiem odświeżenia", async () => {
        vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => undefined);
        api.createJob.mockRejectedValue(new Error("Wybrany plik nie jest już dostępny do podpisu w folderze tego pisma. Odśwież listę."));
        renderModal();
        await screen.findByText("Pismo próbne");

        fireEvent.click(footerButton(/^Podpisz/));

        expect(await screen.findByText(/Wybrany plik nie jest już dostępny/)).toBeInTheDocument();
        expect(screen.getByRole("button", { name: "Odśwież listę plików" })).toBeInTheDocument();
    });
});

describe("SignDocumentsModal — przebieg zlecenia", () => {
    async function startJob() {
        vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => undefined);
        const handlers = renderModal();
        await screen.findByText("Pismo próbne");
        fireEvent.click(footerButton(/^Podpisz/));
        await screen.findByText("Otwieram program ENVI Podpis…");
        return handlers;
    }

    it("po przygotowaniu pokazuje kod XXXX-XXXX, liczbę stron, odnośnik do podglądu i polecenie porównania z programem", async () => {
        api.getJobState.mockResolvedValue(
            jobState({
                status: "prepared",
                signer: { name: "Anna Nowak", serial: "AA", issuer: "CA" },
                files: [
                    { index: 0, kind: "LETTER_DOC", name: "Pismo próbne", withGraphic: true, pages: 2, checkCode: "3F9AC12B", previewAvailable: true, signedGdFileId: null, signedName: null, signedUrl: null },
                ],
            })
        );
        await startJob();

        expect(await screen.findByText("3F9A-C12B")).toBeInTheDocument();
        expect(screen.getByText(/2 strony/)).toBeInTheDocument();
        expect(screen.getByRole("link", { name: /Zobacz gotowy PDF w nowej karcie/ })).toHaveAttribute("href", "http://srv/signingJob/77/file/0/preview");
        expect(screen.getByRole("link", { name: /Zobacz gotowy PDF/ })).toHaveAttribute("target", "_blank");
        expect(screen.getByText(/porównaj kod kontrolny z kodem w programie ENVI Podpis/)).toBeInTheDocument();
        expect(screen.getByText(/podpisze: Anna Nowak/)).toBeInTheDocument();
    });

    it("ostrzeżenie o zmienionym certyfikacie jest widoczne", async () => {
        api.getJobState.mockResolvedValue(jobState({ status: "prepared", certChangedWarning: true, files: [] }));
        await startJob();

        expect(await screen.findByText(/ta karta ma inny certyfikat niż ostatnio używany/)).toBeInTheDocument();
    });

    it("zapis na Dysku blokuje zamykanie okna i mówi, na co czekamy", async () => {
        api.getJobState.mockResolvedValue(jobState({ status: "finalizing", files: [] }));
        await startJob();

        expect(await screen.findByText("Zapisuję podpisane pliki na Dysku…")).toBeInTheDocument();
        expect(document.querySelector(".modal-header .btn-close")).toBeNull();
        expect(screen.queryByRole("button", { name: /Anuluj podpisywanie/ })).toBeNull();
    });

    it("po zakończeniu pokazuje odnośniki do podpisanych plików i raz zgłasza podpis do odświeżenia listy", async () => {
        api.getJobState.mockResolvedValue(
            jobState({
                status: "done",
                files: [
                    { index: 0, kind: "LETTER_DOC", name: "Pismo próbne", withGraphic: true, pages: 2, checkCode: "3F9AC12B", previewAvailable: false, signedGdFileId: "S0", signedName: "Pismo próbne_pdp.pdf", signedUrl: "https://drive.google.com/file/d/S0/view" },
                ],
            })
        );
        const { onSigned } = await startJob();

        const link = await screen.findByRole("link", { name: "Pismo próbne_pdp.pdf" });
        expect(link).toHaveAttribute("href", "https://drive.google.com/file/d/S0/view");
        expect(screen.getByText(/Podpisane pliki są już w folderze pisma/)).toBeInTheDocument();
        expect(onSigned).toHaveBeenCalledTimes(1);
        expect(onSigned).toHaveBeenCalledWith(1);
    });

    it.each([
        ["expired", { status: "expired" }, /Zlecenie podpisu wygasło/, /Spróbuj ponownie/],
        ["failed", { status: "failed", failureMessage: "Plik „A.pdf” ma już podpis - drugiego nie dodajemy." }, /Plik „A.pdf” ma już podpis/, /Spróbuj ponownie/],
        ["cancelled w programie", { status: "cancelled", cancelReason: "no_certificate" }, /Program nie znalazł karty/, /Spróbuj ponownie/],
        ["cancelled PIN zablokowany", { status: "cancelled", cancelReason: "signing_PinBlocked" }, /Karta zablokowała PIN/, /Wgraj podpisany/],
    ] as const)("błąd %s: zwykłe słowa i następny krok", async (_name, over, message, nextAction) => {
        api.getJobState.mockResolvedValue(jobState(over as Partial<SigningJobState>));
        await startJob();

        expect(await screen.findByText(message)).toBeInTheDocument();
        expect(screen.getAllByText(nextAction).length).toBeGreaterThan(0);
        // po zakończeniu okno da się zamknąć
        expect(footerButton(/^Zamknij/)).toBeEnabled();
    });

    it("anulowanie z PS wysyła powód i pokazuje, że nic nie podpisano", async () => {
        await startJob();

        fireEvent.click(await screen.findByRole("button", { name: "Anuluj podpisywanie" }));

        await waitFor(() => expect(api.cancelJob).toHaveBeenCalledWith(77, "ps_user_cancelled"));
        expect(await screen.findByText(/Podpisywanie zostało anulowane/)).toBeInTheDocument();
    });

    it("po 20 s bez reakcji programu pokazuje „Nie widzę programu”, pobranie instalatora i „Wgraj podpisany”, a odpytywanie trwa dalej", async () => {
        vi.useFakeTimers({ shouldAdvanceTime: true });
        await startJob();
        const callsBefore = api.getJobState.mock.calls.length;

        await act(async () => {
            await vi.advanceTimersByTimeAsync(PROGRAM_MISSING_AFTER_MS + 2000);
        });

        expect(screen.getByText("Nie widzę programu ENVI Podpis.")).toBeInTheDocument();
        expect(screen.getByRole("link", { name: /Pobierz program ENVI Podpis/ })).toHaveAttribute("href", "http://srv/signing/program/download");
        expect(screen.getByText(/pobierz go, kliknij dwa razy, wróć tu i kliknij „Podpisz”/)).toBeInTheDocument();
        expect(screen.getByRole("button", { name: "Wgraj podpisany" })).toBeInTheDocument();
        expect(api.getJobState.mock.calls.length).toBeGreaterThan(callsBefore);
    });

    it("przed 20 s nie straszy brakiem programu", async () => {
        vi.useFakeTimers({ shouldAdvanceTime: true });
        await startJob();

        await act(async () => {
            await vi.advanceTimersByTimeAsync(PROGRAM_MISSING_AFTER_MS - 5000);
        });

        expect(screen.queryByText("Nie widzę programu ENVI Podpis.")).toBeNull();
    });

    it("chwilowy brak łączności z PS jest nazwany i nie kończy zlecenia", async () => {
        api.getJobState.mockRejectedValue(new Error("Brak połączenia z serwerem"));
        await startJob();

        expect(await screen.findByText(/Chwilowo nie mam łączności z PS/)).toBeInTheDocument();
        expect(screen.getByText("Otwieram program ENVI Podpis…")).toBeInTheDocument();
    });
});

describe("SignDocumentsModal — wgraj podpisany", () => {
    it("w oknie jest alternatywą: zamyka aktywne zlecenie i pokazuje wybór pliku", async () => {
        vi.useFakeTimers({ shouldAdvanceTime: true });
        vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => undefined);
        renderModal();
        await screen.findByText("Pismo próbne");
        fireEvent.click(footerButton(/^Podpisz/));
        await screen.findByText("Otwieram program ENVI Podpis…");
        await act(async () => {
            await vi.advanceTimersByTimeAsync(PROGRAM_MISSING_AFTER_MS + 2000);
        });

        fireEvent.click(screen.getByRole("button", { name: "Wgraj podpisany" }));

        await waitFor(() => expect(api.cancelJob).toHaveBeenCalledWith(77, "ps_user_cancelled"));
        expect(await screen.findByText(/Masz PDF podpisany kwalifikowanym podpisem/)).toBeInTheDocument();
    });

    it("przyjęty plik pokazuje nazwisko z certyfikatu, a odrzucony — powód po polsku", async () => {
        renderModal({ startInUpload: true });
        const input = (await screen.findByLabelText("Podpisany plik PDF")) as HTMLInputElement;

        api.uploadSigned.mockRejectedValueOnce(new Error("Ten PDF nie ma podpisu elektronicznego."));
        fireEvent.change(input, { target: { files: [new File(["%PDF-1.4"], "a.pdf", { type: "application/pdf" })] } });
        expect(await screen.findByText("Ten PDF nie ma podpisu elektronicznego.")).toBeInTheDocument();

        api.uploadSigned.mockResolvedValueOnce({ signedGdFileId: "U1", signedName: "Pismo_pdp.pdf", signedUrl: "https://drive.google.com/file/d/U1/view", signerName: "Anna Nowak", certChangedWarning: false });
        fireEvent.change(input, { target: { files: [new File(["%PDF-1.4"], "b.pdf", { type: "application/pdf" })] } });
        expect(await screen.findByText(/Plik podpisał\(a\): Anna Nowak/)).toBeInTheDocument();
        expect(screen.getByRole("link", { name: "Pismo_pdp.pdf" })).toHaveAttribute("href", "https://drive.google.com/file/d/U1/view");
    });

    it("plik niebędący PDF jest odrzucany od razu, bez wysyłania", async () => {
        renderModal({ startInUpload: true });
        const input = (await screen.findByLabelText("Podpisany plik PDF")) as HTMLInputElement;

        fireEvent.change(input, { target: { files: [new File(["x"], "notatka.docx")] } });

        expect(await screen.findByText(/To nie jest plik PDF/)).toBeInTheDocument();
        expect(api.uploadSigned).not.toHaveBeenCalled();
    });
});

describe("SignDocumentsModal — źródło z wyborem miejsca grafiki", () => {
    const file: SignableFile = { kind: "DRIVE_FILE", gdFileId: "OFFERPDF000001", name: "Oferta.pdf", mimeType: "application/pdf", withGraphic: false, graphicLocked: false };
    const candidate = { page: 2, rect: { x: 100, y: 200, width: 120, height: 80 }, label: "podpis wykonawcy" };
    const search: GraphicPlaceSearch = {
        pages: [{ width: 600, height: 800, placeable: true }, { width: 600, height: 800, placeable: true }],
        stampRel: { width: 0.2, height: 0.1 },
        candidates: [],
    };
    const graphic = () => document.getElementById(`graphic-F:${file.gdFileId}`) as HTMLInputElement;
    const sign = () => document.getElementById(`sign-F:${file.gdFileId}`) as HTMLInputElement;

    beforeEach(() => {
        vi.stubGlobal("URL", class extends URL {
            static createObjectURL = vi.fn(() => "blob:page");
            static revokeObjectURL = vi.fn();
        });
        vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => undefined);
    });
    afterEach(() => vi.unstubAllGlobals());

    function renderSource(result: GraphicPlaceSearch = search, files = [file]) {
        const locate = vi.fn().mockResolvedValue(result);
        const pageImage = vi.fn().mockResolvedValue(new Blob(["png"], { type: "image/png" }));
        const createJob = vi.fn().mockResolvedValue({ jobId: 77, protocolUrl: "envi-podpis://job/TOKEN", expiresAt: new Date(Date.now() + 600000).toISOString() });
        const listFiles = vi.fn().mockResolvedValue({ files, notSignable: [] });
        const source: SigningSource = {
            key: "graphic-test", listFiles, createJob, listSignatures: vi.fn().mockResolvedValue([]),
            uploadSigned: vi.fn(), onChanged: vi.fn(), graphicPlace: { locate, pageImage },
            texts: { subject: "oferta", inFolder: "w folderze oferty", thisHasAlready: "Ta oferta ma już" },
        };
        const onHide = vi.fn();
        const view = render(<SignDocumentsModal show source={source} onHide={onHide} />);
        return { ...view, source, onHide, locate, pageImage, createJob, listFiles };
    }

    async function clickPage(page = 1, x = 150, y = 200) {
        const img = await screen.findByAltText(`Strona ${page} dokumentu ${file.name}`);
        vi.spyOn(img, "getBoundingClientRect").mockReturnValue({ left: 0, top: 0, width: 300, height: 400 } as DOMRect);
        fireEvent.click(img, { clientX: x, clientY: y });
    }

    it("pusty folder: okno mówi, że nie ma czego podpisać, i pozwala odświeżyć listę", async () => {
        const { listFiles } = renderSource(search, []);
        expect(await screen.findByText(/Nie ma plików, które można podpisać w folderze oferty/)).toBeInTheDocument();
        expect(screen.queryByText("Zaznacz co najmniej jeden plik do podpisu.")).not.toBeInTheDocument();
        expect(footerButton(/^Podpisz/)).toBeDisabled();
        fireEvent.click(screen.getByRole("button", { name: "Odśwież listę plików" }));
        await waitFor(() => expect(listFiles).toHaveBeenCalledTimes(2));
    });

    it("bez grafiki nie szuka miejsca, a zlecenie nie zawiera placement", async () => {
        const { locate, createJob } = renderSource();
        await screen.findByText(file.name);
        expect(graphic()).not.toBeChecked();
        expect(locate).not.toHaveBeenCalled();
        expect(footerButton(/^Podpisz/)).toBeEnabled();
        fireEvent.click(footerButton(/^Podpisz/));
        await waitFor(() => expect(createJob).toHaveBeenCalledWith([{ kind: "DRIVE_FILE", gdFileId: file.gdFileId, withGraphic: false }]));
    });

    it("grafika jest domyślnie wyłączona także gdy lista sugeruje withGraphic", async () => {
        const { locate } = renderSource(search, [{ ...file, withGraphic: true }]);
        await screen.findByText(file.name);
        expect(graphic()).not.toBeChecked();
        expect(locate).not.toHaveBeenCalled();
    });

    it("jeden kandydat jest przyjęty automatycznie; createJob dostaje placement bez label", async () => {
        const { locate, createJob } = renderSource({ ...search, candidates: [candidate] });
        await screen.findByText(file.name);
        fireEvent.click(graphic());
        expect(screen.getByText("Szukam w dokumencie miejsca na podpis…")).toBeInTheDocument();
        expect(footerButton(/^Podpisz/)).toBeDisabled();
        expect(await screen.findByText("Grafika stanie na stronie 2, przy napisie „podpis wykonawcy”.")).toBeInTheDocument();
        expect(locate).toHaveBeenCalledWith(file);
        expect(screen.getByRole("button", { name: "Pokaż lub zmień miejsce" })).toBeInTheDocument();
        expect(footerButton(/^Podpisz/)).toBeEnabled();
        fireEvent.click(footerButton(/^Podpisz/));
        await waitFor(() => expect(createJob).toHaveBeenCalledWith([{
            kind: "DRIVE_FILE", gdFileId: file.gdFileId, withGraphic: true, placement: { page: 2, rect: candidate.rect },
        }]));
    });

    it("zero kandydatów blokuje podpis; wskazanie w tym samym oknie odblokowuje i trafia do createJob", async () => {
        const { createJob } = renderSource();
        await screen.findByText(file.name);
        fireEvent.click(graphic());
        expect(await screen.findByText(/Nie znalazłem w dokumencie miejsca na podpis/)).toBeInTheDocument();
        expect(footerButton(/^Podpisz/)).toBeDisabled();
        expect(screen.getByText("Wskaż miejsce grafiki w pliku „Oferta.pdf” albo wyłącz dla niego grafikę.")).toBeInTheDocument();
        fireEvent.click(screen.getByRole("button", { name: "Wskaż miejsce" }));
        expect(screen.getByText("Miejsce grafiki — Oferta.pdf")).toBeInTheDocument();
        expect(screen.getByText("Wybór plików")).toHaveAttribute("aria-current", "step");
        expect(document.querySelectorAll(".modal")).toHaveLength(1);
        expect(document.querySelectorAll(".modal-footer")).toHaveLength(1);
        await clickPage(2);
        fireEvent.click(footerButton(/Zatwierdź miejsce/));
        // bez oznaczonego miejsca podgląd zaczyna od ostatniej strony (tu: 2 z 2)
        expect(await screen.findByText("Grafika stanie na stronie 2, w miejscu wskazanym przez Ciebie.")).toBeInTheDocument();
        expect(footerButton(/^Podpisz/)).toBeEnabled();
        fireEvent.click(footerButton(/^Podpisz/));
        await waitFor(() => expect(createJob).toHaveBeenCalledWith([{
            kind: "DRIVE_FILE", gdFileId: file.gdFileId, withGraphic: true,
            placement: { page: 2, rect: { x: 240, y: 360, width: 120, height: 80 } },
        }]));
    });

    it.each([[2, "są 2 miejsca"], [5, "jest 5 miejsc"]] as const)("%s kandydatów wymaga wyboru; podgląd zaczyna się na stronie pierwszego", async (count, description) => {
        const { pageImage } = renderSource({ ...search, candidates: Array.from({ length: count }, (_, index) => ({ ...candidate, page: index === 0 ? 2 : 1 })) });
        await screen.findByText(file.name);
        fireEvent.click(graphic());
        expect(await screen.findByText(`W dokumencie ${description} na podpis. Wskaż właściwe.`)).toBeInTheDocument();
        expect(footerButton(/^Podpisz/)).toBeDisabled();
        fireEvent.click(screen.getByRole("button", { name: "Wskaż miejsce" }));
        await screen.findByAltText("Strona 2 dokumentu Oferta.pdf");
        expect(pageImage).toHaveBeenCalledWith(file, 2);
        expect(footerButton(/Zatwierdź miejsce/)).toBeDisabled();
        await clickPage(2);
        fireEvent.click(footerButton(/Zatwierdź miejsce/));
        expect(footerButton(/^Podpisz/)).toBeEnabled();
    });

    it("błąd locate pokazuje komunikat i ponowienie, zachowując zaznaczoną grafikę", async () => {
        const { locate } = renderSource({ ...search, candidates: [candidate] });
        locate.mockRejectedValueOnce(new Error("Nie mogę pobrać pliku z Dysku."));
        await screen.findByText(file.name);
        fireEvent.click(graphic());
        expect(await screen.findByText("Nie udało się sprawdzić dokumentu: Nie mogę pobrać pliku z Dysku.")).toBeInTheDocument();
        expect(graphic()).toBeChecked();
        expect(footerButton(/^Podpisz/)).toBeDisabled();
        fireEvent.click(screen.getByRole("button", { name: "Spróbuj ponownie" }));
        await screen.findByText(/Grafika stanie na stronie 2, przy napisie/);
        expect(locate).toHaveBeenCalledTimes(2);
        expect(footerButton(/^Podpisz/)).toBeEnabled();
    });

    it("odznaczenie grafiki zdejmuje blokadę i wysyła zlecenie bez placement", async () => {
        const { createJob } = renderSource();
        await screen.findByText(file.name);
        fireEvent.click(graphic());
        await screen.findByText(/Nie znalazłem w dokumencie/);
        fireEvent.click(graphic());
        expect(screen.queryByRole("button", { name: "Wskaż miejsce" })).toBeNull();
        expect(footerButton(/^Podpisz/)).toBeEnabled();
        fireEvent.click(footerButton(/^Podpisz/));
        await waitFor(() => expect(createJob).toHaveBeenCalledWith([{ kind: "DRIVE_FILE", gdFileId: file.gdFileId, withGraphic: false }]));
    });

    it("wszystkie strony obrócone wyłączają grafikę, zostawiają wyjaśnienie i umożliwiają podpis", async () => {
        renderSource({ ...search, pages: search.pages.map((page) => ({ ...page, placeable: false })), candidates: [candidate] });
        await screen.findByText(file.name);
        fireEvent.click(graphic());
        expect(await screen.findByText("W tym pliku nie da się ustawić grafiki (strony są obrócone). Podpisz go bez grafiki.")).toBeInTheDocument();
        expect(graphic()).not.toBeChecked();
        expect(footerButton(/^Podpisz/)).toBeEnabled();
        expect(screen.queryByRole("button", { name: "Wskaż miejsce" })).toBeNull();
    });

    it("Anuluj podgląd zachowuje poprzednie miejsce", async () => {
        const { createJob, pageImage } = renderSource({ ...search, candidates: [candidate] });
        await screen.findByText(file.name);
        fireEvent.click(graphic());
        fireEvent.click(await screen.findByRole("button", { name: "Pokaż lub zmień miejsce" }));
        await screen.findByAltText("Strona 2 dokumentu Oferta.pdf");
        expect(screen.getByLabelText("Tu stanie grafika podpisu")).toBeInTheDocument();
        expect(pageImage).toHaveBeenCalledWith(file, 2);
        await clickPage(2);
        fireEvent.click(footerButton(/^Anuluj$/));
        await screen.findByText(/przy napisie „podpis wykonawcy”/);
        fireEvent.click(footerButton(/^Podpisz/));
        await waitFor(() => expect(createJob).toHaveBeenCalledWith([{
            kind: "DRIVE_FILE", gdFileId: file.gdFileId, withGraphic: true, placement: { page: 2, rect: candidate.rect },
        }]));
    });

    it("zatwierdzenie podglądu bez zmiany zachowuje opis automatycznego miejsca", async () => {
        renderSource({ ...search, candidates: [candidate] });
        await screen.findByText(file.name);
        fireEvent.click(graphic());
        fireEvent.click(await screen.findByRole("button", { name: "Pokaż lub zmień miejsce" }));
        await screen.findByAltText("Strona 2 dokumentu Oferta.pdf");
        fireEvent.click(footerButton(/Zatwierdź miejsce/));
        expect(screen.getByText("Grafika stanie na stronie 2, przy napisie „podpis wykonawcy”.")).toBeInTheDocument();
    });

    it("przesunięcie automatycznego miejsca zmienia opis i wysyłany prostokąt", async () => {
        const { createJob } = renderSource({ ...search, candidates: [candidate] });
        await screen.findByText(file.name);
        fireEvent.click(graphic());
        fireEvent.click(await screen.findByRole("button", { name: "Pokaż lub zmień miejsce" }));
        await clickPage(2);
        fireEvent.click(footerButton(/Zatwierdź miejsce/));
        expect(screen.getByText("Grafika stanie na stronie 2, w miejscu wskazanym przez Ciebie.")).toBeInTheDocument();
        fireEvent.click(footerButton(/^Podpisz/));
        await waitFor(() => expect(createJob).toHaveBeenCalledWith([{
            kind: "DRIVE_FILE", gdFileId: file.gdFileId, withGraphic: true,
            placement: { page: 2, rect: { x: 240, y: 360, width: 120, height: 80 } },
        }]));
    });

    it("błąd createJob zachowuje miejsce, a Odśwież listę plików je czyści", async () => {
        const { createJob, listFiles, locate } = renderSource({ ...search, candidates: [candidate] });
        createJob.mockRejectedValueOnce(new Error("Odśwież listę."));
        await screen.findByText(file.name);
        fireEvent.click(graphic());
        await screen.findByText(/przy napisie „podpis wykonawcy”/);
        fireEvent.click(footerButton(/^Podpisz/));
        await screen.findByText("Odśwież listę.");
        expect(screen.getByText(/przy napisie „podpis wykonawcy”/)).toBeInTheDocument();
        expect(footerButton(/^Podpisz/)).toBeEnabled();
        fireEvent.click(screen.getByRole("button", { name: "Odśwież listę plików" }));
        await waitFor(() => expect(listFiles).toHaveBeenCalledTimes(2));
        await screen.findByText(file.name);
        expect(graphic()).not.toBeChecked();
        expect(screen.queryByText(/Grafika stanie na stronie/)).toBeNull();
        fireEvent.click(graphic());
        await waitFor(() => expect(locate).toHaveBeenCalledTimes(2));
    });

    it("Wróć do wyboru plików zachowuje miejsce po zakończeniu zlecenia", async () => {
        api.getJobState.mockResolvedValue(jobState({ status: "failed", failureMessage: "Nie udało się podpisać." }));
        const { locate } = renderSource({ ...search, candidates: [candidate] });
        await screen.findByText(file.name);
        fireEvent.click(graphic());
        await screen.findByText(/przy napisie „podpis wykonawcy”/);
        fireEvent.click(footerButton(/^Podpisz/));
        fireEvent.click(await screen.findByRole("button", { name: "Wróć do wyboru plików" }));
        expect(screen.getByText(/przy napisie „podpis wykonawcy”/)).toBeInTheDocument();
        expect(graphic()).toBeChecked();
        expect(locate).toHaveBeenCalledOnce();
    });

    it("odświeżenie listy unieważnia także szukanie miejsca w toku", async () => {
        let resolve!: (result: GraphicPlaceSearch) => void;
        const { createJob, locate, listFiles } = renderSource({ ...search, candidates: [candidate] });
        createJob.mockRejectedValueOnce(new Error("Odśwież listę."));
        await screen.findByText(file.name);
        fireEvent.click(graphic());
        await screen.findByText(/przy napisie „podpis wykonawcy”/);
        fireEvent.click(footerButton(/^Podpisz/));
        await screen.findByText("Odśwież listę.");
        fireEvent.click(graphic());
        locate.mockImplementationOnce(() => new Promise<GraphicPlaceSearch>((done) => { resolve = done; }));
        fireEvent.click(graphic());
        fireEvent.click(screen.getByRole("button", { name: "Odśwież listę plików" }));
        await waitFor(() => expect(listFiles).toHaveBeenCalledTimes(2));
        await screen.findByText(file.name);
        await act(async () => resolve({ ...search, candidates: [candidate] }));
        expect(graphic()).not.toBeChecked();
        expect(screen.queryByText(/Grafika stanie na stronie/)).toBeNull();
    });

    it.each(["grafika", "podpisz"])("odznaczenie %s czyści miejsce, ponowne zaznaczenie szuka od nowa i ignoruje starszy wynik", async (toggle) => {
        let resolveOld!: (result: GraphicPlaceSearch) => void;
        let resolveNew!: (result: GraphicPlaceSearch) => void;
        const { locate } = renderSource();
        locate.mockImplementationOnce(() => new Promise<GraphicPlaceSearch>((resolve) => { resolveOld = resolve; }))
            .mockImplementationOnce(() => new Promise<GraphicPlaceSearch>((resolve) => { resolveNew = resolve; }));
        await screen.findByText(file.name);
        fireEvent.click(graphic());
        const checkbox = toggle === "grafika" ? graphic() : sign();
        fireEvent.click(checkbox);
        expect(screen.queryByText("Szukam w dokumencie miejsca na podpis…")).toBeNull();
        fireEvent.click(checkbox);
        expect(locate).toHaveBeenCalledTimes(2);
        await act(async () => resolveNew(search));
        await screen.findByText(/Nie znalazłem w dokumencie/);
        await act(async () => resolveOld({ ...search, candidates: [candidate] }));
        expect(screen.queryByText(/przy napisie/)).toBeNull();
        expect(footerButton(/^Podpisz/)).toBeDisabled();
    });

    it("wynik po wyłączeniu grafiki nie przywraca miejsca ani ostrzeżenia", async () => {
        let reject!: (error: Error) => void;
        const { locate } = renderSource();
        locate.mockImplementationOnce(() => new Promise((_, fail) => { reject = fail; }));
        await screen.findByText(file.name);
        fireEvent.click(graphic());
        fireEvent.click(graphic());
        await act(async () => reject(new Error("Stary błąd")));
        expect(screen.queryByText(/Stary błąd/)).toBeNull();
        expect(footerButton(/^Podpisz/)).toBeEnabled();
    });

    it("wynik po zamknięciu nie zmienia stanu nowo otwartego okna", async () => {
        let resolve!: (result: GraphicPlaceSearch) => void;
        const { locate, source, onHide, rerender } = renderSource();
        locate.mockImplementationOnce(() => new Promise<GraphicPlaceSearch>((done) => { resolve = done; }));
        await screen.findByText(file.name);
        fireEvent.click(graphic());
        rerender(<SignDocumentsModal show={false} source={source} onHide={onHide} />);
        rerender(<SignDocumentsModal show source={source} onHide={onHide} />);
        await screen.findByText(file.name);
        await act(async () => resolve({ ...search, candidates: [candidate] }));
        expect(graphic()).not.toBeChecked();
        expect(screen.queryByText(/Grafika stanie na stronie/)).toBeNull();
        expect(footerButton(/^Podpisz/)).toBeEnabled();
    });

    it("miejsca są niezależne dla plików; blokada wskazuje pierwszy brak i liczbę pozostałych", async () => {
        const second = { ...file, gdFileId: "SECOND", name: "Załącznik.pdf" };
        const { locate } = renderSource(search, [file, second]);
        locate.mockResolvedValueOnce({ ...search, candidates: [candidate] });
        await screen.findByText(file.name);
        fireEvent.click(graphic());
        await screen.findByText(/Grafika stanie na stronie 2/);
        fireEvent.click(document.getElementById("graphic-F:SECOND") as HTMLInputElement);
        await screen.findByText(/Nie znalazłem w dokumencie/);
        expect(screen.getByText(/Wskaż miejsce grafiki w pliku „Załącznik.pdf”/)).toBeInTheDocument();
        expect(footerButton(/^Podpisz/)).toBeDisabled();
        fireEvent.click(graphic());
        fireEvent.click(graphic());
        await waitFor(() => expect(screen.getAllByText(/Nie znalazłem w dokumencie/)).toHaveLength(2));
        expect(screen.getByText(/Wskaż miejsce grafiki w pliku „Oferta.pdf”.*Pozostałe pliki bez miejsca: 1/)).toBeInTheDocument();
        fireEvent.click(document.getElementById("sign-F:SECOND") as HTMLInputElement);
        expect(screen.queryByText(/Pozostałe pliki bez miejsca/)).toBeNull();
    });
});

describe("SignDocumentsModal — regresja źródła bez graphicPlace", () => {
    it("zachowuje tekst o prawym dolnym rogu i wysyła grafikę bez placement", async () => {
        vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => undefined);
        const source = letterSigningSource(6168, "6168");
        expect(source.graphicPlace).toBeUndefined();
        render(<SignDocumentsModal show source={source} onHide={vi.fn()} />);
        await screen.findByText("Pismo próbne");
        fireEvent.click(document.getElementById("graphic-F:ATTACHPDF0000001") as HTMLInputElement);
        expect(screen.getByText("Grafika trafi do prawego dolnego rogu ostatniej strony.")).toBeInTheDocument();
        expect(screen.queryByText(/Szukam w dokumencie/)).toBeNull();
        expect(screen.queryByRole("button", { name: "Wskaż miejsce" })).toBeNull();
        fireEvent.click(footerButton(/^Podpisz/));
        await waitFor(() => expect(api.createJob).toHaveBeenCalledWith(6168, [
            { kind: "LETTER_DOC", gdFileId: undefined, withGraphic: true },
            { kind: "DRIVE_FILE", gdFileId: "ATTACHPDF0000001", withGraphic: true },
            { kind: "DRIVE_FILE", gdFileId: "ATTACHDOC0000001", withGraphic: false },
        ]));
    });
});
