import { faCircleCheck, faFilePdf } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React from "react";
import { Badge, OverlayTrigger, Popover } from "react-bootstrap";
import ToolsDate from "../../React/Tools/ToolsDate";
import { useLetterSignatures } from "./letterSignaturesStore";

/**
 * Plakietka „podpisane” przy numerze pisma w rejestrze. Klik otwiera listę podpisanych plików
 * (z odnośnikami do Dysku, nazwą podpisującego i datą). Pisma bez podpisów nie dostają niczego.
 */
export function LetterSignedBadge({ letterId }: { letterId: number }) {
    const entry = useLetterSignatures(letterId);
    if (!entry || entry.count === 0) return null;

    const popover = (
        <Popover id={`letter-signed-${letterId}`} style={{ maxWidth: "460px" }}>
            <Popover.Header as="h6">Podpisane pliki tego pisma</Popover.Header>
            <Popover.Body>
                <ul className="list-unstyled mb-0 d-flex flex-column" style={{ gap: "8px" }}>
                    {entry.signatures.map((signature) => (
                        <li key={signature.id} style={{ wordBreak: "break-word" }}>
                            <FontAwesomeIcon icon={faFilePdf} className="text-danger me-1" />
                            <a href={signature.signedUrl} target="_blank" rel="noopener noreferrer">
                                {signature.signedName}
                            </a>
                            <div className="small text-muted">
                                {signature.signerName} · {ToolsDate.dateToDDmmmYYYYHHMM(new Date(signature.signedAt))}
                                {signature.method === "MANUAL_UPLOAD" ? " · wgrany ręcznie" : ""}
                            </div>
                        </li>
                    ))}
                </ul>
            </Popover.Body>
        </Popover>
    );

    return (
        <OverlayTrigger trigger="click" rootClose placement="bottom" overlay={popover}>
            <Badge
                bg="success"
                role="button"
                tabIndex={0}
                title="Pokaż podpisane pliki"
                style={{ cursor: "pointer", fontWeight: 600 }}
            >
                <FontAwesomeIcon icon={faCircleCheck} className="me-1" />
                podpisane{entry.count > 1 ? ` (${entry.count})` : ""}
            </Badge>
        </OverlayTrigger>
    );
}
