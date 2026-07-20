import React, { useState } from "react";
import { Modal, Button, Form, Spinner, Alert, Badge } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faUpload,
    faFileLines,
    faTableCells,
    faFolderPlus,
    faArrowUpRightFromSquare,
} from "@fortawesome/free-solid-svg-icons";
import { RowActionMenuItemProps } from "../../View/Resultsets/FilterableTable/FilterableTableTypes";
import { UploadIconButton, SuccessToast } from "../../View/Resultsets/CommonComponents";
import ToolsFetch from "../../React/Tools/ToolsFetch";
import MainSetup from "../../React/MainSetupReact";

type CreatedGdFile = { id: string; name: string; webViewLink: string };

/** Akcja menu wiersza: dodawanie plików, tworzenie dokumentów Google
 * (Docs/Sheets) oraz podfolderów w folderze Google Drive danego węzła drzewa
 * TasksGlobal. Renderuje się tylko dla węzłów z realnym folderem GD (gdFolderId). */
export function AddFilesToFolderButton({ dataObject, layout }: RowActionMenuItemProps) {
    const gdFolderId = (dataObject as { gdFolderId?: string }).gdFolderId;
    const folderUrl = dataObject._gdFolderUrl;
    const folderPath = dataObject._folderPath;

    const [show, setShow] = useState(false);
    const [files, setFiles] = useState<FileList | null>(null);
    const [docName, setDocName] = useState("");
    const [subfolderName, setSubfolderName] = useState("");
    // id aktualnie wykonywanej akcji ("upload" | "document" | "spreadsheet" | "folder")
    // — spinner pokazujemy tylko na klikniętym przycisku, nie na wszystkich.
    const [busy, setBusy] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [toastMsg, setToastMsg] = useState<string | null>(null);
    // remount inputu plików po udanym wgraniu (reset wyboru bez ref-ów)
    const [resetKey, setResetKey] = useState(0);

    if (!gdFolderId) return null;

    /** Wspólna obsługa żądania: spinner (per akcja), błąd, toast. */
    async function run(actionId: string, action: () => Promise<string>) {
        setBusy(actionId);
        setError(null);
        try {
            setToastMsg(await action());
        } catch (e) {
            setError(e instanceof Error ? e.message : "Wystąpił błąd");
        } finally {
            setBusy(null);
        }
    }

    function handleUpload() {
        if (!files?.length) {
            setError("Wybierz pliki do wgrania");
            return;
        }
        run("upload", async () => {
            const fd = new FormData();
            fd.append("gdFolderId", gdFolderId as string);
            Array.from(files).forEach((f) => fd.append("file", f, f.name));
            // bez retry: POST tworzy zasoby (upload) — ponowienie po utracie odpowiedzi dałoby duplikaty
            const created: CreatedGdFile[] = await ToolsFetch.fetchJsonWithSafeError(
                MainSetup.serverUrl + "gdFolderFiles",
                { method: "POST", credentials: "include", body: fd }
            );
            setFiles(null);
            setResetKey((k) => k + 1);
            return `Wgrano plików: ${Array.isArray(created) ? created.length : ""}`;
        });
    }

    function handleCreateDocument(type: "document" | "spreadsheet") {
        if (!docName.trim()) {
            setError("Podaj nazwę dokumentu");
            return;
        }
        run(type, async () => {
            const created = await postJson<CreatedGdFile>("gdFolderDocument", {
                gdFolderId,
                name: docName.trim(),
                type,
            });
            if (created?.webViewLink) window.open(created.webViewLink, "_blank");
            setDocName("");
            return `Utworzono: ${created?.name ?? docName.trim()}`;
        });
    }

    function handleCreateFolder() {
        if (!subfolderName.trim()) {
            setError("Podaj nazwę folderu");
            return;
        }
        run("folder", async () => {
            const created = await postJson<CreatedGdFile>("gdFolderSubfolder", {
                gdFolderId,
                name: subfolderName.trim(),
            });
            setSubfolderName("");
            return `Utworzono folder: ${created?.name ?? subfolderName.trim()}`;
        });
    }

    return (
        <>
            <UploadIconButton layout={layout} onClick={() => setShow(true)} />
            <Modal show={show} onHide={() => setShow(false)} size="lg" centered enforceFocus={false}>
                {/* zatrzymanie propagacji: klik w modalu nie może zaznaczać/nawigować sekcji drzewa */}
                <div onClick={(e) => e.stopPropagation()} onDoubleClick={(e) => e.stopPropagation()}>
                    <Modal.Header closeButton>
                        <div className="me-2">
                            <h5 className="mb-1">Dodaj do folderu</h5>
                            <div className="d-flex flex-wrap align-items-center gap-2">
                                {folderPath && (
                                    <Badge
                                        bg="secondary"
                                        text="light"
                                        pill
                                        className="text-break"
                                        style={{ whiteSpace: "normal" }}
                                    >
                                        {folderPath}
                                    </Badge>
                                )}
                                {folderUrl && (
                                    <a href={folderUrl} target="_blank" rel="noreferrer" className="small">
                                        otwórz w Drive{" "}
                                        <FontAwesomeIcon icon={faArrowUpRightFromSquare} size="xs" />
                                    </a>
                                )}
                            </div>
                        </div>
                    </Modal.Header>
                    <Modal.Body>
                        {error && (
                            <Alert variant="danger" onClose={() => setError(null)} dismissible>
                                {error}
                            </Alert>
                        )}

                        <div className="p-3 mb-3 bg-light border rounded">
                            <Form.Label className="fw-bold">
                                <FontAwesomeIcon icon={faUpload} className="me-2 text-primary" />
                                Wgraj pliki
                            </Form.Label>
                            <Form.Control
                                key={resetKey}
                                type="file"
                                multiple
                                disabled={!!busy}
                                onChange={(e) => setFiles((e.target as HTMLInputElement).files)}
                            />
                            <div className="mt-2 text-end">
                                <Button
                                    variant="primary"
                                    disabled={!!busy || !files?.length}
                                    onClick={handleUpload}
                                >
                                    Wgraj{" "}
                                    {busy === "upload" && (
                                        <Spinner as="span" animation="border" size="sm" role="status" />
                                    )}
                                </Button>
                            </div>
                        </div>

                        <div className="p-3 mb-3 bg-light border rounded">
                            <Form.Label className="fw-bold">
                                <FontAwesomeIcon icon={faFileLines} className="me-2 text-primary" />
                                Nowy dokument Google
                            </Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="Nazwa dokumentu"
                                value={docName}
                                disabled={!!busy}
                                onChange={(e) => setDocName(e.target.value)}
                            />
                            <div className="mt-2 d-flex gap-2 justify-content-end flex-wrap">
                                <Button
                                    variant="outline-primary"
                                    disabled={!!busy || !docName.trim()}
                                    onClick={() => handleCreateDocument("document")}
                                >
                                    {busy === "document" ? (
                                        <Spinner as="span" animation="border" size="sm" role="status" className="me-2" />
                                    ) : (
                                        <FontAwesomeIcon icon={faFileLines} className="me-2" />
                                    )}
                                    Dokument
                                </Button>
                                <Button
                                    variant="outline-success"
                                    disabled={!!busy || !docName.trim()}
                                    onClick={() => handleCreateDocument("spreadsheet")}
                                >
                                    {busy === "spreadsheet" ? (
                                        <Spinner as="span" animation="border" size="sm" role="status" className="me-2" />
                                    ) : (
                                        <FontAwesomeIcon icon={faTableCells} className="me-2" />
                                    )}
                                    Arkusz
                                </Button>
                            </div>
                        </div>

                        <div className="p-3 bg-light border rounded">
                            <Form.Label className="fw-bold">
                                <FontAwesomeIcon icon={faFolderPlus} className="me-2 text-warning" />
                                Nowy folder
                            </Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="Nazwa folderu"
                                value={subfolderName}
                                disabled={!!busy}
                                onChange={(e) => setSubfolderName(e.target.value)}
                            />
                            <div className="mt-2 text-end">
                                <Button
                                    variant="outline-secondary"
                                    disabled={!!busy || !subfolderName.trim()}
                                    onClick={handleCreateFolder}
                                >
                                    {busy === "folder" ? (
                                        <Spinner as="span" animation="border" size="sm" role="status" className="me-2" />
                                    ) : (
                                        <FontAwesomeIcon icon={faFolderPlus} className="me-2" />
                                    )}
                                    Utwórz folder
                                </Button>
                            </div>
                        </div>
                    </Modal.Body>
                </div>
            </Modal>
            <SuccessToast message={toastMsg ?? ""} show={!!toastMsg} onClose={() => setToastMsg(null)} />
        </>
    );
}

/** POST JSON bez retry — endpointy tworzą zasoby, ponowienie dałoby duplikat. */
function postJson<T>(route: string, body: unknown): Promise<T> {
    return ToolsFetch.fetchJsonWithSafeError(MainSetup.serverUrl + route, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
    });
}
