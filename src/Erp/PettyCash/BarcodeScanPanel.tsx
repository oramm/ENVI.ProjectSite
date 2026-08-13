import React, { useState } from "react";
import { Alert, Button, Card } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCamera, faStop } from "@fortawesome/free-solid-svg-icons";
import { useBarcodeScanner, ScannerStatus } from "./useBarcodeScanner";
import { REJECTION_MESSAGES } from "./trackingNumber";

const STATUS_TEXT: Record<ScannerStatus, string> = {
    idle: "",
    starting: "Uruchamiam kamerę…",
    scanning: "Przyłóż kod kreskowy z potwierdzenia nadania.",
    denied: "Brak zgody na dostęp do kamery. Numer możesz wpisać ręcznie.",
    unavailable: "Ta przeglądarka nie udostępnia kamery. Numer możesz wpisać ręcznie.",
    error: "Nie udało się uruchomić kamery. Numer możesz wpisać ręcznie.",
};

/**
 * Skanowanie numerów nadania z kamery.
 *
 * Panel zostaje otwarty po udanym odczycie, żeby stos potwierdzeń dało się przeskanować
 * jedno po drugim bez klikania. Numer, który nie przejdzie cyfry kontrolnej, nie trafia
 * na listę — pokazujemy prośbę o ponowne przyłożenie zamiast wpuszczać zły odczyt.
 */
export default function BarcodeScanPanel({
    knownNumbers,
    onScanned,
}: {
    knownNumbers: readonly string[];
    onScanned: (trackingNumber: string) => void;
}) {
    const [active, setActive] = useState(false);
    const { videoRef, status, rejection, acceptedCount } = useBarcodeScanner({
        active,
        knownNumbers,
        onAccepted: onScanned,
    });

    if (!active)
        return (
            <Button variant="outline-primary" onClick={() => setActive(true)}>
                <FontAwesomeIcon icon={faCamera} className="me-2" />
                Skanuj potwierdzenia
            </Button>
        );

    const cameraFailed = status === "denied" || status === "unavailable" || status === "error";

    return (
        <Card>
            <Card.Body>
                <div className="d-flex justify-content-between align-items-center mb-2">
                    <span className="fw-semibold">Skanowanie potwierdzeń</span>
                    <Button variant="outline-secondary" size="sm" onClick={() => setActive(false)}>
                        <FontAwesomeIcon icon={faStop} className="me-2" />
                        Zakończ
                    </Button>
                </div>

                {!cameraFailed && (
                    <video
                        ref={videoRef}
                        muted
                        playsInline
                        style={{
                            width: "100%",
                            maxHeight: 260,
                            objectFit: "cover",
                            background: "#000",
                            borderRadius: 4,
                        }}
                    />
                )}

                <div className="text-muted small mt-2">{STATUS_TEXT[status]}</div>

                {rejection && (
                    <Alert variant="warning" className="py-2 mt-2 mb-0">
                        {REJECTION_MESSAGES[rejection]}
                    </Alert>
                )}

                {acceptedCount > 0 && (
                    <div className="text-success small mt-2">
                        Zeskanowano listów: {acceptedCount}
                    </div>
                )}
            </Card.Body>
        </Card>
    );
}
