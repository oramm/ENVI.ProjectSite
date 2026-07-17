import React, { useState } from "react";
import { Modal, Button, Form, Spinner, Alert } from "react-bootstrap";
import { RowActionMenuItemProps } from "../../View/Resultsets/FilterableTable/FilterableTableTypes";
import { UploadIconButton, SuccessToast } from "../../View/Resultsets/CommonComponents";
import ToolsFetch from "../../React/Tools/ToolsFetch";
import MainSetup from "../../React/MainSetupReact";

type CreatedGdFile = { id: string; name: string; webViewLink: string };

/** Akcja menu wiersza: dodawanie plików oraz tworzenie dokumentów Google
 * (Docs/Sheets) w folderze Google Drive danego węzła drzewa TasksGlobal.
 * Renderuje się tylko dla węzłów z realnym folderem GD (gdFolderId). */
export function AddFilesToFolderButton({ dataObject, layout }: RowActionMenuItemProps) {
    const gdFolderId = (dataObject as { gdFolderId?: string }).gdFolderId;

    const [show, setShow] = useState(false);
    const [files, setFiles] = useState<FileList | null>(null);
    const [docName, setDocName] = useState("");
    const [pending, setPending] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [toastMsg, setToastMsg] = useState<string | null>(null);
    // remount inputu plików po udanym wgraniu (reset wyboru bez ref-ów)
    const [resetKey, setResetKey] = useState(0);

    if (!gdFolderId) return null;

    async function handleUpload() {
        if (!files || files.length === 0) {
            setError("Wybierz pliki do wgrania");
            return;
        }
        setPending(true);
        setError(null);
        try {
            const fd = new FormData();
            fd.append("gdFolderId", gdFolderId as string);
            Array.from(files).forEach((f) => fd.append("file", f, f.name));
            // bez retry: POST tworzy zasoby (upload) — ponowienie po utracie odpowiedzi dałoby duplikaty
            const created: CreatedGdFile[] = await ToolsFetch.fetchJsonWithSafeError(
                MainSetup.serverUrl + "gdFolderFiles",
                { method: "POST", credentials: "include", body: fd }
            );
            setToastMsg(`Wgrano plików: ${Array.isArray(created) ? created.length : ""}`);
            setFiles(null);
            setResetKey((k) => k + 1);
        } catch (e) {
            setError(e instanceof Error ? e.message : "Błąd wgrywania plików");
        } finally {
            setPending(false);
        }
    }

    async function handleCreateDocument(type: "document" | "spreadsheet") {
        if (!docName.trim()) {
            setError("Podaj nazwę dokumentu");
            return;
        }
        setPending(true);
        setError(null);
        try {
            // bez retry: POST tworzy dokument — ponowienie po utracie odpowiedzi dałoby duplikat
            const created: CreatedGdFile = await ToolsFetch.fetchJsonWithSafeError(
                MainSetup.serverUrl + "gdFolderDocument",
                {
                    method: "POST",
                    credentials: "include",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ gdFolderId, name: docName.trim(), type }),
                }
            );
            if (created?.webViewLink) window.open(created.webViewLink, "_blank");
            setToastMsg(`Utworzono: ${created?.name ?? docName.trim()}`);
            setDocName("");
        } catch (e) {
            setError(e instanceof Error ? e.message : "Błąd tworzenia dokumentu");
        } finally {
            setPending(false);
        }
    }

    return (
        <>
            <UploadIconButton layout={layout} onClick={() => setShow(true)} />
            <Modal show={show} onHide={() => setShow(false)} centered enforceFocus={false}>
                {/* zatrzymanie propagacji: klik w modalu nie może zaznaczać/nawigować sekcji drzewa */}
                <div onClick={(e) => e.stopPropagation()} onDoubleClick={(e) => e.stopPropagation()}>
                    <Modal.Header closeButton>
                        <Modal.Title>Dodaj pliki do folderu</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        {error && (
                            <Alert variant="danger" onClose={() => setError(null)} dismissible>
                                {error}
                            </Alert>
                        )}

                        <Form.Group className="mb-3">
                            <Form.Label className="fw-bold">Wgraj pliki</Form.Label>
                            <Form.Control
                                key={resetKey}
                                type="file"
                                multiple
                                disabled={pending}
                                onChange={(e) => setFiles((e.target as HTMLInputElement).files)}
                            />
                            <div className="mt-2">
                                <Button
                                    variant="outline-primary"
                                    size="sm"
                                    disabled={pending || !files?.length}
                                    onClick={handleUpload}
                                >
                                    Wgraj{" "}
                                    {pending && <Spinner as="span" animation="border" size="sm" role="status" />}
                                </Button>
                            </div>
                        </Form.Group>

                        <hr />

                        <Form.Group className="mb-2">
                            <Form.Label className="fw-bold">Nowy dokument Google</Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="Nazwa dokumentu"
                                value={docName}
                                disabled={pending}
                                onChange={(e) => setDocName(e.target.value)}
                            />
                            <div className="mt-2 d-flex gap-2">
                                <Button
                                    variant="outline-secondary"
                                    size="sm"
                                    disabled={pending || !docName.trim()}
                                    onClick={() => handleCreateDocument("document")}
                                >
                                    Dokument Google
                                </Button>
                                <Button
                                    variant="outline-secondary"
                                    size="sm"
                                    disabled={pending || !docName.trim()}
                                    onClick={() => handleCreateDocument("spreadsheet")}
                                >
                                    Arkusz Google
                                </Button>
                            </div>
                        </Form.Group>
                    </Modal.Body>
                </div>
            </Modal>
            <SuccessToast message={toastMsg ?? ""} show={!!toastMsg} onClose={() => setToastMsg(null)} />
        </>
    );
}
