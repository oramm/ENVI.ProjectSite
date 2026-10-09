import React, { useState } from "react";
import { Button, Modal } from "react-bootstrap";
import { Letter } from "../../../Typings/bussinesTypes";
import { SignedPdfIconButton, SuccessToast, UploadSignedPdfIconButton } from "../../View/Resultsets/CommonComponents";
import { RowActionMenuItemProps } from "../../View/Resultsets/FilterableTable/FilterableTableTypes";
import { SignLetterModal } from "./SignLetterModal";
import { pluralFiles } from "./signingTexts";
import { UploadSignedPanel } from "./UploadSignedPanel";

type RowLetter = Letter & { isOur: boolean };

/**
 * Akcja wiersza „PDF z podpisem” — obok zwykłego „PDF”. Tylko dla pism naszych (wychodzących);
 * ten sam komponent obsługuje rejestr pism kontraktowych i ofertowych, bo serwer rozpoznaje pismo po id.
 */
export function SignOurLetterPdfButton({ dataObject, layout }: RowActionMenuItemProps<RowLetter>) {
    const [show, setShow] = useState(false);
    const [toast, setToast] = useState<{ header: string; message: string } | null>(null);

    if (!dataObject.isOur) return null;

    return (
        <>
            <SignedPdfIconButton layout={layout} onClick={() => setShow(true)} />
            <SignLetterModal
                show={show}
                letterId={dataObject.id}
                letterNumber={dataObject.number}
                onHide={() => setShow(false)}
                onSigned={(count) =>
                    setToast({
                        header: "Podpisano",
                        message: `Podpisano ${pluralFiles(count)}. Podpisane pliki są w folderze pisma na Dysku Google.`,
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
export function UploadSignedLetterButton({ dataObject, layout }: RowActionMenuItemProps<RowLetter>) {
    const [show, setShow] = useState(false);
    const [toast, setToast] = useState<string | null>(null);

    if (!dataObject.isOur) return null;

    return (
        <>
            <UploadSignedPdfIconButton layout={layout} onClick={() => setShow(true)} />
            {show && (
                <Modal size="lg" show onHide={() => setShow(false)} enforceFocus={false}>
                    <Modal.Header closeButton>
                        <Modal.Title as="h5">Wgraj podpisany — pismo {dataObject.number}</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <UploadSignedPanel
                            letterId={dataObject.id}
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
