import React, { useState } from "react";
import { Button, Modal } from "react-bootstrap";
import { SignedPdfIconButton, SuccessToast, UploadSignedPdfIconButton } from "../View/Resultsets/CommonComponents";
import { RowActionMenuItemProps } from "../View/Resultsets/FilterableTable/FilterableTableTypes";
import { SignDocumentsModal } from "./SignDocumentsModal";
import { SigningSource } from "./SigningSource";
import { pluralFiles } from "./signingTexts";
import { UploadSignedPanel } from "./UploadSignedPanel";

type RowLayout = RowActionMenuItemProps["layout"];

/**
 * Akcja wiersza „PDF z podpisem” — niezależna od tego, co podpisujemy: o pliku mówi tylko `source`.
 * Pismo i oferta dostają tu ten sam przycisk i to samo okno; różnią się wyłącznie teksty źródła.
 */
export function SignPdfRowAction({ source, layout }: { source: SigningSource; layout: RowLayout }) {
    const [show, setShow] = useState(false);
    const [toast, setToast] = useState<{ header: string; message: string } | null>(null);

    return (
        <>
            <SignedPdfIconButton layout={layout} onClick={() => setShow(true)} />
            <SignDocumentsModal
                show={show}
                source={source}
                onHide={() => setShow(false)}
                onSigned={(count) =>
                    setToast({
                        header: "Podpisano",
                        message: `Podpisano ${pluralFiles(count)}. Podpisane pliki są ${source.texts.inFolder} na Dysku Google.`,
                    })
                }
                onUploaded={(result) =>
                    setToast({
                        header: "Wgrano podpisany plik",
                        message: `Przyjęto plik podpisany przez ${result.signerName}. Zapisano: ${result.signedName}.`,
                    })
                }
            />
            <SuccessToast
                header={toast?.header}
                message={toast?.message ?? ""}
                show={!!toast}
                onClose={() => setToast(null)}
            />
        </>
    );
}

/** Akcja wiersza „Wgraj podpisany” — własne okno, bez przechodzenia przez program ENVI Podpis. */
export function UploadSignedRowAction({ source, layout }: { source: SigningSource; layout: RowLayout }) {
    const [show, setShow] = useState(false);
    const [toast, setToast] = useState<string | null>(null);

    return (
        <>
            <UploadSignedPdfIconButton layout={layout} onClick={() => setShow(true)} />
            {show && (
                <Modal size="lg" show onHide={() => setShow(false)} enforceFocus={false}>
                    <Modal.Header closeButton>
                        <Modal.Title as="h5">{`Wgraj podpisany — ${source.texts.subject}`}</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <UploadSignedPanel
                            source={source}
                            onUploaded={(result) =>
                                setToast(`Przyjęto plik podpisany przez ${result.signerName}. Zapisano: ${result.signedName}.`)
                            }
                        />
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="outline-secondary" onClick={() => setShow(false)}>
                            Zamknij
                        </Button>
                    </Modal.Footer>
                </Modal>
            )}
            <SuccessToast header="Wgrano podpisany plik" message={toast ?? ""} show={!!toast} onClose={() => setToast(null)} />
        </>
    );
}
