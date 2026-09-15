import React, { useState } from "react";
import { Alert, Badge, Button } from "react-bootstrap";
import PrivacyNoticeSections from "../../../Privacy/PrivacyNoticeSections";
import { PublicProfileSubmissionPrivacyNoticeDto } from "./publicProfileSubmissionApi.types";

interface Props {
    /** Treść z backendu; brak (starszy backend) = komponent nic nie renderuje. */
    notice: PublicProfileSubmissionPrivacyNoticeDto | undefined;
    /** Tryb zwinięty na kroku wysyłki: jedno zdanie przypomnienia i przycisk rozwijający pełną treść. */
    compact?: boolean;
}

export const PRIVACY_NOTICE_PLACEHOLDER_LABEL = "Tekst zastępczy - do zastąpienia przez administratora danych";

/**
 * ROD-7: informacja o przetwarzaniu danych osobowych na publicznym formularzu. Treść przychodzi
 * z backendu razem z informacją o zgłoszeniu (jedno źródło dla strony i maila z linkiem) - tu tylko
 * wyświetlanie. Plakietka „tekst zastępczy" ma być nie do przeoczenia, dopóki owner nie wstawi treści.
 */
export function PublicProfilePrivacyNotice({ notice, compact = false }: Props) {
    const [expanded, setExpanded] = useState(!compact);
    if (!notice) return null;

    return (
        <section className="mb-3" aria-label={notice.title} data-testid="privacy-notice">
            {compact && (
                <div className="small text-muted mb-2">
                    Informacja o przetwarzaniu danych osobowych jest dostępna do ponownego wglądu.{" "}
                    <Button
                        variant="link"
                        size="sm"
                        className="p-0 align-baseline"
                        onClick={() => setExpanded((value) => !value)}
                    >
                        {expanded ? "Ukryj informację" : "Pokaż informację"}
                    </Button>
                </div>
            )}
            {expanded && (
                <Alert variant="light" className="border mb-0">
                    <div className="d-flex align-items-center flex-wrap gap-2 mb-2">
                        <h6 className="mb-0">{notice.title}</h6>
                        {notice.isPlaceholder && <Badge bg="danger">{PRIVACY_NOTICE_PLACEHOLDER_LABEL}</Badge>}
                    </div>
                    <PrivacyNoticeSections sections={notice.sections} />
                </Alert>
            )}
        </section>
    );
}
