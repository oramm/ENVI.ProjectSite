import { faCircleCheck } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { useRef, useState } from "react";
import { Alert, Button, Form, Spinner } from "react-bootstrap";
import { invalidateLetterSignatures } from "./letterSignaturesStore";
import { ManualUploadResult, SigningApi } from "./SigningApi";

/** Zgodny z limitem serwera (MAX_UPLOAD_BYTES = 10 MB); serwer i tak sprawdza to sam. */
const MAX_UPLOAD_MB = 10;

type UploadState =
    | { kind: "idle" }
    | { kind: "uploading"; fileName: string }
    | { kind: "done"; result: ManualUploadResult }
    | { kind: "error"; message: string };

/**
 * „Wgraj podpisany”: ręczne wgranie PDF-a podpisanego poza PS (na przykład w programie Szafir).
 * Serwer sprawdza podpis i certyfikat, zapisuje plik w folderze pisma i oddaje nazwisko z certyfikatu
 * albo powód odmowy po polsku. Ten sam panel stoi w oknie podpisu (jako alternatywa) i we własnym oknie.
 */
export function UploadSignedPanel({
    letterId,
    onUploaded,
}: {
    letterId: number;
    onUploaded?: (result: ManualUploadResult) => void;
}) {
    const [state, setState] = useState<UploadState>({ kind: "idle" });
    const inputRef = useRef<HTMLInputElement>(null);

    async function handleFile(file: File | undefined) {
        if (!file) return;
        if (!/\.pdf$/i.test(file.name) && file.type !== "application/pdf") {
            setState({ kind: "error", message: "To nie jest plik PDF. Wybierz podpisany plik z rozszerzeniem .pdf." });
            return;
        }
        if (file.size > MAX_UPLOAD_MB * 1024 * 1024) {
            setState({ kind: "error", message: `Plik jest za duży (limit ${MAX_UPLOAD_MB} MB).` });
            return;
        }
        setState({ kind: "uploading", fileName: file.name });
        try {
            const result = await SigningApi.uploadSigned(letterId, file);
            invalidateLetterSignatures(letterId);
            setState({ kind: "done", result });
            onUploaded?.(result);
        } catch (error) {
            setState({
                kind: "error",
                message: error instanceof Error ? error.message : "Nie udało się wgrać pliku. Spróbuj ponownie.",
            });
        } finally {
            if (inputRef.current) inputRef.current.value = "";
        }
    }

    const busy = state.kind === "uploading";

    return (
        <div>
            <p className="mb-2">
                Masz PDF podpisany kwalifikowanym podpisem w innym programie (na przykład w Szafirze)? Wybierz go tutaj.
                Po wybraniu pliku sprawdzę podpis i zapiszę go w folderze tego pisma na Dysku Google.
            </p>
            <p className="small text-muted">
                Nie porównuję treści pliku z pismem w PS — wybierz właściwy plik. Przyjmuję tylko PDF z ważnym
                podpisem kwalifikowanym (do {MAX_UPLOAD_MB} MB).
            </p>

            <Form.Group controlId={`signed-upload-${letterId}`} className="mb-3">
                <Form.Label className="visually-hidden">Podpisany plik PDF</Form.Label>
                <Form.Control
                    ref={inputRef}
                    type="file"
                    accept=".pdf,application/pdf"
                    disabled={busy}
                    onChange={(event) => handleFile((event.target as HTMLInputElement).files?.[0])}
                />
            </Form.Group>

            {state.kind === "uploading" && (
                <Alert variant="info" className="d-flex align-items-center" style={{ gap: "12px" }}>
                    <Spinner animation="border" size="sm" role="status" aria-hidden="true" />
                    <span>
                        <strong>Sprawdzam podpis i zapisuję plik „{state.fileName}” na Dysku…</strong>
                        <br />
                        To trwa zwykle kilka sekund. Nic nie klikaj, poczekaj na wynik.
                    </span>
                </Alert>
            )}

            {state.kind === "error" && (
                <Alert variant="danger">
                    <strong>Nie przyjąłem tego pliku.</strong>
                    <br />
                    {state.message}
                    <br />
                    <span className="small">Wybierz inny plik albo podpisz ten ponownie i wgraj jeszcze raz.</span>
                </Alert>
            )}

            {state.kind === "done" && (
                <Alert variant="success">
                    <FontAwesomeIcon icon={faCircleCheck} className="me-2" />
                    <strong>Przyjęto. Plik podpisał(a): {state.result.signerName}.</strong>
                    <br />
                    Zapisałem go w folderze pisma jako{" "}
                    <a href={state.result.signedUrl} target="_blank" rel="noopener noreferrer">
                        {state.result.signedName}
                    </a>
                    .
                    {state.result.certChangedWarning && (
                        <div className="mt-2">
                            <strong>Uwaga:</strong> ten certyfikat różni się od tego, którym ta osoba podpisywała w PS
                            wcześniej. Jeśli karta była wymieniana, to normalne; jeśli nie, sprawdź, kto podpisał.
                        </div>
                    )}
                </Alert>
            )}

        </div>
    );
}
