/**
 * SIG-4 — okno „PDF z podpisem”. Sprawdza, że w każdym stanie zlecenia użytkownik widzi zdanie
 * o tym, co się dzieje, i następny krok, oraz że do serwera idzie dokładnie to, co zaznaczył.
 * Serwer jest zaślepiony na granicy SigningApi; odpytywanie idzie prawdziwym timerem (1,5 s).
 */
import { act, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import React from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { SigningJobState } from "./SigningApi";

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

import { PROGRAM_MISSING_AFTER_MS, SignLetterModal } from "./SignLetterModal";

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
        letterId: 6168,
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
    render(<SignLetterModal show letterId={6168} letterNumber="6168" onHide={onHide} onSigned={onSigned} {...extra} />);
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

describe("SignLetterModal — wybór plików", () => {
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

describe("SignLetterModal — przebieg zlecenia", () => {
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

describe("SignLetterModal — wgraj podpisany", () => {
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
