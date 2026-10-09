import {
    faArrowUpRightFromSquare,
    faCircleCheck,
    faDownload,
    faFileLines,
    faFilePdf,
    faTriangleExclamation,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { Alert, Badge, Button, Form, Modal, Spinner } from "react-bootstrap";
import { invalidateLetterSignatures } from "./letterSignaturesStore";
import {
    CreatedSigningJob,
    FINISHED_JOB_STATUSES,
    LetterSignature,
    ManualUploadResult,
    SignableFile,
    SignableFilesResult,
    SigningApi,
    SigningJobState,
} from "./SigningApi";
import { CANCEL_REASON_FROM_PS, explainCancelReason, formatCheckCode, pluralFiles, pluralPages } from "./signingTexts";
import { UploadSignedPanel } from "./UploadSignedPanel";

/** Po tylu sekundach bez reakcji programu zakładamy, że programu nie ma na tym komputerze. */
export const PROGRAM_MISSING_AFTER_MS = 20_000;
/** Jak często pytamy serwer o stan zlecenia. */
const POLL_MS = 1500;

type Phase = "loading" | "loadError" | "select" | "starting" | "job" | "upload";
type Selection = Record<string, { sign: boolean; graphic: boolean }>;

const fileKey = (file: Pick<SignableFile, "kind" | "gdFileId">) =>
    file.kind === "LETTER_DOC" ? "LETTER_DOC" : `F:${file.gdFileId}`;

function describeFormat(file: SignableFile): string {
    if (file.mimeType === "application/pdf") return "PDF";
    if (file.mimeType === "application/vnd.google-apps.document") return "Dokument Google — zamienię go na PDF";
    if (file.mimeType === "application/vnd.google-apps.spreadsheet") return "Arkusz Google — zamienię go na PDF";
    return file.mimeType;
}

/** Otwiera program przez własny protokół, nie opuszczając strony (kliknięcie niewidocznego linku). */
function launchProtocol(href: string) {
    const link = document.createElement("a");
    link.href = href;
    link.style.display = "none";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

function formatClock(iso: string): string {
    const date = new Date(iso);
    if (Number.isNaN(date.getTime())) return "";
    return date.toLocaleTimeString("pl-PL", { hour: "2-digit", minute: "2-digit" });
}

const STEPS = ["Wybór plików", "Program ENVI Podpis", "Kontrola i PIN", "Zapis na Dysku"];

function Stepper({ current }: { current: number }) {
    return (
        <ol
            className="list-unstyled d-flex flex-wrap mb-3 p-0"
            style={{ gap: "6px 18px", fontSize: ".85rem" }}
            aria-label="Postęp podpisywania"
        >
            {STEPS.map((label, index) => {
                const done = index < current;
                const active = index === current;
                return (
                    <li
                        key={label}
                        aria-current={active ? "step" : undefined}
                        className={active ? "fw-bold text-success" : done ? "text-success" : "text-muted"}
                    >
                        <span
                            className="d-inline-flex align-items-center justify-content-center me-1"
                            style={{
                                width: "20px",
                                height: "20px",
                                borderRadius: "50%",
                                fontSize: ".72rem",
                                border: "1px solid currentColor",
                                backgroundColor: done || active ? "currentColor" : "transparent",
                            }}
                        >
                            <span style={{ color: done || active ? "#fff" : "inherit" }}>{done ? "✓" : index + 1}</span>
                        </span>
                        {label}
                    </li>
                );
            })}
        </ol>
    );
}

function Waiting({ title, children }: { title: string; children?: React.ReactNode }) {
    return (
        <Alert variant="info" className="d-flex align-items-start" style={{ gap: "12px" }} role="status">
            <Spinner animation="border" size="sm" role="status" aria-hidden="true" className="mt-1" />
            <div>
                <strong>{title}</strong>
                {children && <div className="mt-1">{children}</div>}
            </div>
        </Alert>
    );
}

type ContentProps = {
    letterId: number;
    letterNumber?: string | number | null;
    onHide: () => void;
    /** Wywoływane raz, gdy zlecenie zakończyło się podpisem (odświeżenie listy, komunikat). */
    onSigned?: (signedFiles: number) => void;
    /** Wywoływane po przyjęciu pliku wgranego ręcznie („Wgraj podpisany” w tym oknie). */
    onUploaded?: (result: ManualUploadResult) => void;
    /** Otwórz od razu widok „Wgraj podpisany”. */
    startInUpload?: boolean;
};

/**
 * Okno „PDF z podpisem”: wybór plików → program ENVI Podpis → kontrola i PIN → zapis na Dysku.
 * W każdym stanie okno mówi, co się właśnie dzieje i co użytkownik ma teraz zrobić.
 */
function SignLetterModalContent({ letterId, letterNumber, onHide, onSigned, onUploaded, startInUpload }: ContentProps) {
    const [phase, setPhase] = useState<Phase>(startInUpload ? "upload" : "loading");
    const [signable, setSignable] = useState<SignableFilesResult | null>(null);
    const [selection, setSelection] = useState<Selection>({});
    const [loadError, setLoadError] = useState<string | null>(null);
    const [startError, setStartError] = useState<string | null>(null);
    const [existing, setExisting] = useState<LetterSignature[]>([]);

    const [job, setJob] = useState<CreatedSigningJob | null>(null);
    const [state, setState] = useState<SigningJobState | null>(null);
    const [launchedAt, setLaunchedAt] = useState<number>(0);
    const [now, setNow] = useState<number>(Date.now());
    const [pollProblem, setPollProblem] = useState(false);
    const [actionError, setActionError] = useState<string | null>(null);
    const [cancelling, setCancelling] = useState(false);
    const reportedDone = useRef(false);
    const mounted = useRef(true);

    useEffect(() => {
        mounted.current = true;
        return () => {
            mounted.current = false;
        };
    }, []);

    // ------------------------------------------------------------------ 1. lista plików

    const loadFiles = useCallback(async () => {
        setPhase("loading");
        setLoadError(null);
        try {
            const result = await SigningApi.listSignableFiles(letterId);
            if (!mounted.current) return;
            setSignable(result);
            const initial: Selection = {};
            for (const file of result.files) initial[fileKey(file)] = { sign: true, graphic: file.withGraphic };
            setSelection(initial);
            setPhase("select");
        } catch (error) {
            if (!mounted.current) return;
            setLoadError(error instanceof Error ? error.message : "Nie udało się wczytać listy plików.");
            setPhase("loadError");
        }
        // Ostrzeżenie o już istniejących podpisach jest dodatkiem: jego błąd nie blokuje podpisywania.
        try {
            const result = await SigningApi.listLetterSignatures(letterId);
            if (mounted.current) setExisting(result.signatures);
        } catch {
            if (mounted.current) setExisting([]);
        }
    }, [letterId]);

    useEffect(() => {
        if (!startInUpload) loadFiles();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // ------------------------------------------------------------------ 2. zakładanie zlecenia

    const selectedFiles = (signable?.files ?? []).filter((file) => selection[fileKey(file)]?.sign);

    async function startJob() {
        if (!signable || selectedFiles.length === 0) return;
        setStartError(null);
        setActionError(null);
        setPhase("starting");
        // Poprzednie zlecenie (jeszcze aktywne) zamykamy, żeby nie wisiał ważny token.
        await cancelSilently();
        try {
            const created = await SigningApi.createJob(
                letterId,
                selectedFiles.map((file) => ({
                    kind: file.kind,
                    gdFileId: file.kind === "DRIVE_FILE" ? file.gdFileId : undefined,
                    withGraphic: file.graphicLocked ? true : !!selection[fileKey(file)]?.graphic,
                }))
            );
            if (!mounted.current) return;
            reportedDone.current = false;
            setJob(created);
            setState(null);
            setPollProblem(false);
            setLaunchedAt(Date.now());
            setNow(Date.now());
            setPhase("job");
            launchProtocol(created.protocolUrl);
        } catch (error) {
            if (!mounted.current) return;
            setStartError(error instanceof Error ? error.message : "Nie udało się założyć zlecenia podpisu.");
            setPhase("select");
        }
    }

    async function cancelSilently() {
        if (job && (!state || !FINISHED_JOB_STATUSES.includes(state.status))) {
            try {
                await SigningApi.cancelJob(job.jobId, CANCEL_REASON_FROM_PS);
            } catch {
                // zlecenie i tak wygasa samo po kilku minutach
            }
        }
        setJob(null);
        setState(null);
    }

    // ------------------------------------------------------------------ 3-6. odpytywanie zlecenia

    const jobId = job?.jobId;
    useEffect(() => {
        if (jobId === undefined) return;
        let stopped = false;
        let timer: ReturnType<typeof setTimeout> | undefined;

        const tick = async () => {
            let finished = false;
            try {
                const next = await SigningApi.getJobState(jobId);
                if (stopped) return;
                setState(next);
                setPollProblem(false);
                finished = FINISHED_JOB_STATUSES.includes(next.status);
            } catch {
                if (stopped) return;
                // Chwilowy brak łączności nie kończy zlecenia: pokazujemy uwagę i pytamy dalej.
                setPollProblem(true);
            }
            if (!finished && !stopped) timer = setTimeout(tick, POLL_MS);
        };
        tick();

        return () => {
            stopped = true;
            if (timer) clearTimeout(timer);
        };
    }, [jobId]);

    // Zegar odświeżający odliczanie („nie widzę programu”, godzina wygaśnięcia).
    const jobActive = !!job && (!state || !FINISHED_JOB_STATUSES.includes(state.status));
    useEffect(() => {
        if (!jobActive) return;
        const interval = setInterval(() => setNow(Date.now()), 1000);
        return () => clearInterval(interval);
    }, [jobActive]);

    useEffect(() => {
        if (state?.status === "done" && !reportedDone.current) {
            reportedDone.current = true;
            invalidateLetterSignatures(letterId);
            onSigned?.(state.files.length);
        }
    }, [state, letterId, onSigned]);

    async function cancelFromPs() {
        if (!job) return;
        setCancelling(true);
        setActionError(null);
        try {
            await SigningApi.cancelJob(job.jobId, CANCEL_REASON_FROM_PS);
            if (!mounted.current) return;
            setState({
                jobId: job.jobId,
                letterId,
                status: "cancelled",
                expiresAt: job.expiresAt,
                failureMessage: null,
                cancelReason: CANCEL_REASON_FROM_PS,
                signer: null,
                certChangedWarning: false,
                files: [],
            });
        } catch (error) {
            if (!mounted.current) return;
            setActionError(
                error instanceof Error
                    ? `${error.message} Poczekaj chwilę i sprawdź, co pokazuje to okno.`
                    : "Nie udało się anulować zlecenia."
            );
        } finally {
            if (mounted.current) setCancelling(false);
        }
    }

    /** „Wgraj podpisany” zamyka aktywne zlecenie, żeby nie podpisać dwa razy (programem i ręcznie). */
    async function openUpload() {
        await cancelSilently();
        setActionError(null);
        setPhase("upload");
    }

    function backToSelection() {
        setJob(null);
        setState(null);
        setActionError(null);
        setStartError(null);
        setPhase("select");
    }

    // ------------------------------------------------------------------ widoki

    const status = state?.status ?? (job ? "created" : undefined);
    const programMissing = status === "created" && now - launchedAt >= PROGRAM_MISSING_AFTER_MS;
    const locked = phase === "starting" || (phase === "job" && jobActive);
    const closable = !locked && status !== "finalizing";

    // Po zakończeniu bez podpisu (anulowane, wygasłe, nieudane) „postęp” nic już nie mówi — chowamy go.
    const jobStopped = phase === "job" && (status === "cancelled" || status === "expired" || status === "failed");
    const currentStep =
        phase !== "job"
            ? 0
            : status === "created" || status === "preparing"
              ? 1
              : status === "prepared"
                ? 2
                : 3;

    const title = `PDF z podpisem — pismo ${letterNumber ?? signable?.letterNumber ?? ""}`.trim();

    function renderSelect() {
        if (!signable) return null;
        const letterFile = signable.files.find((file) => file.kind === "LETTER_DOC");
        const attachments = signable.files.filter((file) => file.kind !== "LETTER_DOC");
        const rows = letterFile ? [letterFile, ...attachments] : attachments;

        function setSign(file: SignableFile, sign: boolean) {
            setSelection((prev) => ({ ...prev, [fileKey(file)]: { ...prev[fileKey(file)], sign } }));
        }
        function setGraphic(file: SignableFile, graphic: boolean) {
            setSelection((prev) => ({ ...prev, [fileKey(file)]: { ...prev[fileKey(file)], graphic } }));
        }

        return (
            <>
                <p className="mb-1">
                    <strong>Zaznacz pliki, które mają zostać podpisane kartą kwalifikowaną.</strong>
                </p>
                <p className="text-muted small">
                    Podpisane kopie zapiszę w folderze pisma na Dysku Google jako „nazwa_pdp.pdf”. Oryginały
                    zostają bez zmian. Po kliknięciu „Podpisz” otworzy się program ENVI Podpis na Twoim komputerze:
                    tam wybierzesz certyfikat i wpiszesz PIN.
                </p>

                {existing.length > 0 && (
                    <Alert variant="warning" className="py-2 small">
                        To pismo ma już {pluralFiles(existing.length)} podpisanych (ostatni: „{existing[0].signedName}”,{" "}
                        {existing[0].signerName}). Kolejny podpis doda nowy plik z datą w nazwie — niczego nie nadpisze.
                    </Alert>
                )}

                {startError && (
                    <Alert variant="danger" className="py-2">
                        <strong>Nie udało się rozpocząć podpisywania.</strong>
                        <br />
                        {startError}
                        <div className="mt-2">
                            <Button size="sm" variant="outline-danger" onClick={loadFiles}>
                                Odśwież listę plików
                            </Button>
                        </div>
                    </Alert>
                )}

                <div className="mb-3">
                    {rows.map((file) => {
                        const key = fileKey(file);
                        const choice = selection[key] ?? { sign: true, graphic: file.withGraphic };
                        const isLetter = file.kind === "LETTER_DOC";
                        return (
                            <div
                                key={key}
                                className="border rounded p-2 mb-2"
                                style={{ backgroundColor: choice.sign ? "#f7fbf8" : "transparent" }}
                            >
                                <div
                                    className="d-flex flex-wrap align-items-center justify-content-between"
                                    style={{ gap: "8px 16px" }}
                                >
                                    <div style={{ minWidth: 0, flex: "1 1 260px", wordBreak: "break-word" }}>
                                        <FontAwesomeIcon
                                            icon={isLetter ? faFileLines : faFilePdf}
                                            className={isLetter ? "text-success me-2" : "text-danger me-2"}
                                        />
                                        <strong>{file.name}</strong>
                                        {isLetter && (
                                            <Badge bg="success" className="ms-2">
                                                pismo
                                            </Badge>
                                        )}
                                        <div className="small text-muted">{describeFormat(file)}</div>
                                    </div>
                                    <div className="d-flex" style={{ gap: "18px" }}>
                                        <Form.Check
                                            type="checkbox"
                                            id={`sign-${key}`}
                                            label="podpisz"
                                            checked={choice.sign}
                                            onChange={(event) => setSign(file, event.target.checked)}
                                        />
                                        <Form.Check
                                            type="checkbox"
                                            id={`graphic-${key}`}
                                            label="grafika"
                                            checked={file.graphicLocked ? true : choice.graphic}
                                            disabled={file.graphicLocked || !choice.sign}
                                            onChange={(event) => setGraphic(file, event.target.checked)}
                                        />
                                    </div>
                                </div>
                                {file.graphicLocked ? (
                                    <div className="small text-muted mt-1">
                                        Pismo zawsze dostaje widoczny podpis z grafiką ENVI (pod „Z poważaniem”), więc
                                        tego pola nie da się wyłączyć.
                                    </div>
                                ) : (
                                    choice.sign &&
                                    choice.graphic && (
                                        <div className="small text-muted mt-1">
                                            Grafika trafi do prawego dolnego rogu ostatniej strony.
                                        </div>
                                    )
                                )}
                            </div>
                        );
                    })}
                    {!letterFile && (
                        <div className="small text-muted">Pismo nie ma dokumentu na Dysku — nie ma czego podpisać.</div>
                    )}
                </div>

                {signable.notSignable.length > 0 && (
                    <div className="mb-3">
                        <div className="small fw-semibold text-muted mb-1">Tych plików nie podpiszemy:</div>
                        {signable.notSignable.map((file) => (
                            <div
                                key={file.gdFileId}
                                className="border rounded p-2 mb-1 small text-muted"
                                style={{ backgroundColor: "#f3f4f4", wordBreak: "break-word" }}
                            >
                                <FontAwesomeIcon icon={faFilePdf} className="me-2" style={{ opacity: 0.45 }} />
                                <span>{file.name}</span>
                                <div>{file.reason}</div>
                            </div>
                        ))}
                    </div>
                )}

                {selectedFiles.length === 0 && (
                    <div className="small text-danger">Zaznacz co najmniej jeden plik do podpisu.</div>
                )}
            </>
        );
    }

    function renderJob() {
        if (!job) return null;
        const files = state?.files ?? [];
        const expiresAt = state?.expiresAt ?? job.expiresAt;

        const problem = pollProblem && (
            <Alert variant="warning" className="py-2 small">
                Chwilowo nie mam łączności z PS. Próbuję dalej — nic nie klikaj. Podpisywanie w programie trwa
                niezależnie od tego okna.
            </Alert>
        );

        if (status === "created") {
            if (programMissing) {
                return (
                    <>
                        {problem}
                        <Alert variant="warning">
                            <div className="d-flex align-items-start" style={{ gap: "10px" }}>
                                <FontAwesomeIcon icon={faTriangleExclamation} className="mt-1" />
                                <div>
                                    <strong>Nie widzę programu ENVI Podpis.</strong>
                                    <div className="mt-1">
                                        Jeśli to Twój pierwszy podpis na tym komputerze, trzeba zainstalować program
                                        (jeden raz): pobierz go, kliknij dwa razy, wróć tu i kliknij „Podpisz”.
                                    </div>
                                </div>
                            </div>
                        </Alert>
                        <div className="d-flex flex-wrap mb-3" style={{ gap: "10px" }}>
                            <a className="btn btn-primary" href={SigningApi.programDownloadUrl()}>
                                <FontAwesomeIcon icon={faDownload} className="me-2" />
                                Pobierz program ENVI Podpis
                            </a>
                            <Button variant="outline-success" onClick={startJob}>
                                Mam już program — spróbuj ponownie
                            </Button>
                            <Button variant="outline-secondary" onClick={openUpload}>
                                Wgraj podpisany
                            </Button>
                        </div>
                        <ul className="small text-muted ps-3">
                            <li>
                                Program już się otworzył i coś pokazał? Dokończ w nim — to okno odświeży się samo.
                                Program może też prosić o nowszą wersję: wtedy pobierz ją przyciskiem wyżej.
                            </li>
                            <li>
                                Przeglądarka mogła zapytać „otworzyć ENVI Podpis?”. Zezwól (możesz zaznaczyć „zawsze”).
                                Nie ma okna pytania? <a href={job.protocolUrl}>Otwórz program ręcznie</a>.
                            </li>
                            <li>
                                Podpisujesz kartą i nie możesz zainstalować programu? Użyj „Wgraj podpisany”: podpiszesz
                                plik w innym programie, a tutaj tylko go wgrasz.
                            </li>
                        </ul>
                        <div className="small text-muted">
                            Nadal czekam na program. Zlecenie jest ważne do {formatClock(expiresAt)}.
                        </div>
                    </>
                );
            }
            return (
                <>
                    {problem}
                    <Waiting title="Otwieram program ENVI Podpis…">
                        Jeśli przeglądarka zapyta „otworzyć ENVI Podpis?”, pozwól otworzyć (możesz zaznaczyć „zawsze”).
                        Potem w programie wybierz certyfikat i postępuj według jego instrukcji.
                    </Waiting>
                    <div className="small text-muted">
                        Okno programu się nie pojawiło?{" "}
                        <a href={job.protocolUrl}>Otwórz program jeszcze raz</a>. Zlecenie jest ważne do{" "}
                        {formatClock(expiresAt)}.
                    </div>
                </>
            );
        }

        if (status === "preparing") {
            return (
                <>
                    {problem}
                    <Waiting title="Program przesłał certyfikat. Przygotowuję pliki do podpisu…">
                        Pobieram pliki z Dysku Google i dodaję grafikę podpisu. To trwa zwykle kilka sekund — nic nie
                        klikaj.
                    </Waiting>
                </>
            );
        }

        if (status === "prepared" || status === "finalizing") {
            const finalizing = status === "finalizing";
            return (
                <>
                    {problem}
                    {finalizing ? (
                        <Waiting title="Zapisuję podpisane pliki na Dysku…">
                            PIN został przyjęty. Nie zamykaj tego okna, to potrwa chwilę.
                        </Waiting>
                    ) : (
                        <Alert variant="info" role="status">
                            <strong>Pliki są gotowe do podpisu{state?.signer ? ` (podpisze: ${state.signer.name})` : ""}.</strong>
                            <div className="mt-1">
                                Obejrzyj je, porównaj kod kontrolny z kodem w programie ENVI Podpis, a potem wpisz PIN w
                                programie. Jeśli coś się nie zgadza — anuluj. Czekam na Twoje potwierdzenie w programie
                                (zlecenie ważne do {formatClock(expiresAt)}).
                            </div>
                        </Alert>
                    )}

                    {state?.certChangedWarning && (
                        <Alert variant="warning" className="py-2 small">
                            <strong>Uwaga:</strong> ta karta ma inny certyfikat niż ostatnio używany do podpisywania w
                            PS. Jeśli wymieniałeś kartę — to normalne. Jeśli nie, anuluj i sprawdź, czyją kartę
                            włożono.
                        </Alert>
                    )}

                    {files.map((file) => (
                        <div key={file.index} className="border rounded p-3 mb-2" style={{ wordBreak: "break-word" }}>
                            <div className="d-flex flex-wrap justify-content-between" style={{ gap: "8px 16px" }}>
                                <div style={{ flex: "1 1 240px", minWidth: 0 }}>
                                    <FontAwesomeIcon icon={faFilePdf} className="text-danger me-2" />
                                    <strong>{file.name}</strong>
                                    <div className="small text-muted">
                                        {file.pages ? pluralPages(file.pages) : ""}
                                        {file.withGraphic ? " · z grafiką podpisu" : " · bez grafiki"}
                                    </div>
                                    {file.previewAvailable && (
                                        <a
                                            href={SigningApi.previewUrl(job.jobId, file.index)}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="small"
                                        >
                                            Zobacz gotowy PDF w nowej karcie{" "}
                                            <FontAwesomeIcon icon={faArrowUpRightFromSquare} />
                                        </a>
                                    )}
                                </div>
                                {file.checkCode && (
                                    <div className="text-center" style={{ flex: "0 0 auto" }}>
                                        <div className="small text-muted">kod kontrolny</div>
                                        <div
                                            aria-label={`Kod kontrolny ${formatCheckCode(file.checkCode)}`}
                                            style={{
                                                fontFamily: 'ui-monospace, "Cascadia Mono", Consolas, monospace',
                                                fontSize: "1.7rem",
                                                fontWeight: 700,
                                                letterSpacing: ".08em",
                                                lineHeight: 1.1,
                                            }}
                                        >
                                            {formatCheckCode(file.checkCode)}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                    {!finalizing && (
                        <p className="small text-muted mt-2 mb-0">
                            Porównaj kod z kodem w programie ENVI Podpis, potem wpisz PIN w programie.
                        </p>
                    )}
                </>
            );
        }

        if (status === "done") {
            return (
                <>
                    <Alert variant="success">
                        <FontAwesomeIcon icon={faCircleCheck} className="me-2" />
                        <strong>Gotowe. Podpisane pliki są już w folderze pisma na Dysku Google.</strong>
                        <div className="mt-1">Na liście pism pismo ma teraz plakietkę „podpisane”.</div>
                    </Alert>
                    {state?.files.map((file) => (
                        <div key={file.index} className="mb-2" style={{ wordBreak: "break-word" }}>
                            <FontAwesomeIcon icon={faFilePdf} className="text-danger me-2" />
                            {file.signedUrl ? (
                                <a href={file.signedUrl} target="_blank" rel="noopener noreferrer">
                                    {file.signedName ?? file.name}
                                </a>
                            ) : (
                                <span>{file.signedName ?? file.name}</span>
                            )}
                        </div>
                    ))}
                </>
            );
        }

        if (status === "expired") {
            return (
                <Alert variant="warning">
                    <strong>Zlecenie podpisu wygasło.</strong>
                    <div className="mt-1">
                        Jest ważne 10 minut od kliknięcia „Podpisz”, a w tym czasie nie dokończono podpisywania w
                        programie. Nic nie zostało podpisane ani zapisane. Kliknij „Spróbuj ponownie”.
                    </div>
                </Alert>
            );
        }

        if (status === "failed") {
            return (
                <Alert variant="danger">
                    <strong>Podpisywanie się nie udało.</strong>
                    <div className="mt-1">
                        {state?.failureMessage ?? "Coś poszło nie tak po stronie PS."} Nic nie zostało zapisane na
                        Dysku.
                    </div>
                    <div className="mt-1 small">
                        Kliknij „Spróbuj ponownie”. Jeśli błąd się powtarza, użyj „Wgraj podpisany” albo zgłoś problem.
                    </div>
                </Alert>
            );
        }

        // cancelled
        const explanation = explainCancelReason(state?.cancelReason);
        return (
            <Alert variant="secondary">
                <strong>Podpisywanie przerwane.</strong>
                <div className="mt-1">{explanation.message}</div>
                {explanation.suggestUpload && (
                    <div className="mt-1 small">Użyj „Wgraj podpisany”, żeby dokończyć sprawę bez karty w programie.</div>
                )}
            </Alert>
        );
    }

    function renderBody() {
        if (phase === "loading" || phase === "starting") {
            return (
                <Waiting
                    title={phase === "loading" ? "Wczytuję pliki z folderu pisma…" : "Zakładam zlecenie podpisu…"}
                >
                    {phase === "loading"
                        ? "Sprawdzam, co leży w folderze tego pisma na Dysku Google. To trwa kilka sekund."
                        : "Za chwilę otworzy się program ENVI Podpis."}
                </Waiting>
            );
        }
        if (phase === "loadError") {
            return (
                <Alert variant="danger">
                    <strong>Nie udało się wczytać plików pisma.</strong>
                    <div className="mt-1">{loadError}</div>
                    <div className="mt-1 small">Sprawdź połączenie i kliknij „Spróbuj ponownie”.</div>
                </Alert>
            );
        }
        if (phase === "upload") {
            return (
                <UploadSignedPanel letterId={letterId} onUploaded={onUploaded} />
            );
        }
        if (phase === "job") return renderJob();
        return renderSelect();
    }

    function renderFooter() {
        if (phase === "loading") {
            return <Button variant="outline-secondary" onClick={onHide}>Zamknij</Button>;
        }
        if (phase === "starting") return null;
        if (phase === "loadError") {
            return (
                <>
                    <Button variant="outline-secondary" onClick={onHide}>
                        Zamknij
                    </Button>
                    <Button variant="success" onClick={loadFiles}>
                        Spróbuj ponownie
                    </Button>
                </>
            );
        }
        if (phase === "upload") {
            return (
                <>
                    {!startInUpload && (
                        <Button variant="outline-success" onClick={() => (signable ? setPhase("select") : loadFiles())}>
                            Wróć do podpisywania w programie
                        </Button>
                    )}
                    <Button variant="outline-secondary" onClick={onHide}>
                        Zamknij
                    </Button>
                </>
            );
        }
        if (phase === "select") {
            return (
                <>
                    <Button variant="outline-secondary" onClick={onHide}>
                        Zamknij
                    </Button>
                    <Button variant="outline-primary" onClick={openUpload}>
                        Wgraj podpisany
                    </Button>
                    <Button variant="success" disabled={selectedFiles.length === 0} onClick={startJob}>
                        Podpisz {selectedFiles.length > 0 ? `(${pluralFiles(selectedFiles.length)})` : ""}
                    </Button>
                </>
            );
        }
        // job
        if (status === "finalizing") {
            return <span className="text-muted small">Poczekaj, zapisuję pliki…</span>;
        }
        if (jobActive) {
            return (
                <>
                    {actionError && <span className="text-danger small me-auto">{actionError}</span>}
                    <Button variant="outline-danger" disabled={cancelling} onClick={cancelFromPs}>
                        {cancelling ? "Anuluję…" : "Anuluj podpisywanie"}
                    </Button>
                </>
            );
        }
        if (status === "done") {
            return (
                <Button variant="success" onClick={onHide}>
                    Zamknij
                </Button>
            );
        }
        const explanation = status === "cancelled" ? explainCancelReason(state?.cancelReason) : null;
        const uploadFirst = explanation?.suggestUpload;
        return (
            <>
                <Button variant="outline-secondary" onClick={onHide}>
                    Zamknij
                </Button>
                <Button variant="outline-secondary" onClick={backToSelection}>
                    Wróć do wyboru plików
                </Button>
                <Button variant={uploadFirst ? "success" : "outline-primary"} onClick={openUpload}>
                    Wgraj podpisany
                </Button>
                {!uploadFirst && (
                    <Button variant="success" onClick={startJob}>
                        Spróbuj ponownie
                    </Button>
                )}
            </>
        );
    }

    return (
        <Modal
            size="lg"
            show
            onHide={closable ? onHide : undefined}
            backdrop={closable ? true : "static"}
            keyboard={closable}
            enforceFocus={false}
        >
            <Modal.Header closeButton={closable}>
                <Modal.Title as="h5">{title}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {phase !== "upload" && !jobStopped && <Stepper current={currentStep} />}
                {phase === "upload" && (
                    <h6 className="mb-2">Wgraj podpisany — plik podpisany poza PS</h6>
                )}
                {renderBody()}
            </Modal.Body>
            <Modal.Footer>{renderFooter()}</Modal.Footer>
        </Modal>
    );
}

/** Okno „PDF z podpisem”. Zawartość montuje się od nowa przy każdym otwarciu (czysty stan). */
export function SignLetterModal({
    show,
    ...rest
}: ContentProps & {
    show: boolean;
}) {
    if (!show) return null;
    return <SignLetterModalContent {...rest} />;
}
