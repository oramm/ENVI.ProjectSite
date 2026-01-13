import React, { useState, useCallback, useRef } from "react";
import { Alert, Button, Card, Container, Row, Col, Spinner } from "react-bootstrap";
import { Invoice } from "../../../../Typings/bussinesTypes";
import ToolsDate from "../../../React/Tools/ToolsDate";
import MainSetup from "../../../React/MainSetupReact";

// Typy dla odpowiedzi API KSeF
interface KsefSendResponse {
    invoiceId: number;
    referenceNumber: string;
    status: string;
    message: string;
}

interface KsefStatusResponse {
    invoiceId: number;
    referenceNumber?: string;
    ksefNumber?: string | null;
    status?: {
        code: number;
        description: string;
        extensions?: {
            originalKsefNumber?: string;
        };
    };
    acquisitionDate?: string;
    invoicingDate?: string;
    upoDownloadUrl?: string;
    error?: string;
}

interface KsefSectionProps {
    invoice: Invoice;
    onInvoiceUpdate: (updatedInvoice: Invoice) => void;
}

type AlertState = {
    type: "success" | "danger" | "warning" | "info";
    message: string;
} | null;

export default function KsefSection({ invoice, onInvoiceUpdate }: KsefSectionProps) {
    const [loading, setLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState("");
    const [alert, setAlert] = useState<AlertState>(null);
    const [statusDetails, setStatusDetails] = useState<KsefStatusResponse | null>(null);
    const pollingRef = useRef<NodeJS.Timeout | null>(null);

    // Sprawdź czy przycisk "Wyślij do KSeF" powinien być widoczny
    const canSendToKsef = useCallback(() => {
        // Nie pokazuj jeśli faktura już ma numer KSeF
        if (invoice.ksefNumber) return false;
        
        // Nie pokazuj jeśli faktura została już wysłana do KSeF (status PENDING lub inny)
        if (invoice.ksefStatus) return false;
        
        // Nie pokazuj jeśli faktura ma już sessionId (była wysłana)
        if (invoice.ksefSessionId) return false;
        
        // Pokaż tylko dla statusów "Wystawiona" (DONE) lub "Wysłana" (SENT)
        const allowedStatuses = [
            MainSetup.InvoiceStatuses.DONE,
            MainSetup.InvoiceStatuses.SENT,
        ];
        return allowedStatuses.includes(invoice.status);
    }, [invoice.ksefNumber, invoice.ksefStatus, invoice.ksefSessionId, invoice.status]);

    // Sprawdź czy można pobrać UPO - tylko gdy faktycznie ma numer KSeF
    const canDownloadUpo = !!invoice.ksefNumber && invoice.ksefNumber.trim().length > 0;

    // Funkcja do wysyłania faktury do KSeF
    const sendToKsef = async () => {
        setLoading(true);
        setLoadingMessage("Wysyłanie do KSeF...");
        setAlert(null);
        setStatusDetails(null);

        try {
            // 1. Wyślij fakturę
            const sendResponse = await fetch(`${MainSetup.serverUrl}invoice/${invoice.id}/ksef/send`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: "include",
            });

            if (!sendResponse.ok) {
                const errorData = await sendResponse.json();
                if (sendResponse.status === 400 && errorData.details) {
                    // Błąd walidacji - wyświetl szczegóły
                    const detailsList = errorData.details.join("\n• ");
                    throw new Error(`Błąd walidacji:\n• ${detailsList}`);
                }
                // Obsługa różnych formatów błędów
                const errorMessage = errorData.error 
                    || errorData.errorMessage 
                    || errorData.message 
                    || `Błąd serwera (${sendResponse.status})`;
                
                // Dodaj szczegóły jeśli dostępne
                const details = errorData.details 
                    ? `\n\nSzczegóły:\n• ${errorData.details.join("\n• ")}`
                    : "";
                
                throw new Error(errorMessage + details);
            }

            const sendResult: KsefSendResponse = await sendResponse.json();
            
            // Aktualizuj fakturę z sessionId
            const updatedInvoice: Invoice = {
                ...invoice,
                ksefStatus: "PENDING",
                ksefSessionId: sendResult.referenceNumber,
            };
            onInvoiceUpdate(updatedInvoice);

            setAlert({
                type: "info",
                message: sendResult.message,
            });

            // 2. Rozpocznij polling statusu
            setLoadingMessage("Sprawdzanie statusu w KSeF...");
            startStatusPolling();

        } catch (error) {
            setLoading(false);
            setLoadingMessage("");
            setAlert({
                type: "danger",
                message: error instanceof Error ? error.message : "Błąd wysyłki do KSeF",
            });
        }
    };

    // Polling statusu KSeF
    const startStatusPolling = useCallback(() => {
        let attempts = 0;
        const maxAttempts = 10;
        const pollingInterval = 3000; // 3 sekundy

        const checkStatus = async () => {
            attempts++;

            try {
                const statusResponse = await fetch(`${MainSetup.serverUrl}invoice/${invoice.id}/ksef/status`, {
                    method: "GET",
                    credentials: "include",
                });

                if (!statusResponse.ok) {
                    const errorData = await statusResponse.json();
                    throw new Error(errorData.error || "Błąd sprawdzania statusu");
                }

                const statusResult: KsefStatusResponse = await statusResponse.json();
                setStatusDetails(statusResult);

                // Sukces - faktura przyjęta
                if (statusResult.ksefNumber || statusResult.status?.code === 200) {
                    stopPolling();
                    setLoading(false);
                    setLoadingMessage("");
                    
                    const updatedInvoice: Invoice = {
                        ...invoice,
                        ksefNumber: statusResult.ksefNumber,
                        ksefStatus: String(statusResult.status?.code || "200"),
                    };
                    onInvoiceUpdate(updatedInvoice);

                    setAlert({
                        type: "success",
                        message: `Faktura przyjęta w KSeF!\nNumer: ${statusResult.ksefNumber}`,
                    });
                    return;
                }

                // Duplikat
                if (statusResult.status?.code === 440) {
                    stopPolling();
                    setLoading(false);
                    setLoadingMessage("");
                    
                    const originalNumber = statusResult.status.extensions?.originalKsefNumber;
                    setAlert({
                        type: "warning",
                        message: `Faktura już istnieje w KSeF${originalNumber ? `:\n${originalNumber}` : ""}`,
                    });
                    return;
                }

                // Kontynuuj polling jeśli status 100 (w przetwarzaniu)
                if (attempts < maxAttempts) {
                    pollingRef.current = setTimeout(checkStatus, pollingInterval);
                } else {
                    // Timeout
                    stopPolling();
                    setLoading(false);
                    setLoadingMessage("");
                    setAlert({
                        type: "info",
                        message: "Przetwarzanie trwa dłużej niż zwykle.\nSprawdź status później przyciskiem 'Odśwież status'.",
                    });
                }

            } catch (error) {
                stopPolling();
                setLoading(false);
                setLoadingMessage("");
                setAlert({
                    type: "danger",
                    message: error instanceof Error ? error.message : "Błąd sprawdzania statusu",
                });
            }
        };

        // Rozpocznij polling z opóźnieniem
        pollingRef.current = setTimeout(checkStatus, pollingInterval);
    }, [invoice, onInvoiceUpdate]);

    const stopPolling = () => {
        if (pollingRef.current) {
            clearTimeout(pollingRef.current);
            pollingRef.current = null;
        }
    };

    // Ręczne odświeżenie statusu
    const refreshStatus = async () => {
        setLoading(true);
        setLoadingMessage("Sprawdzanie statusu...");
        setAlert(null);

        try {
            const statusResponse = await fetch(`${MainSetup.serverUrl}invoice/${invoice.id}/ksef/status`, {
                method: "GET",
                credentials: "include",
            });

            if (!statusResponse.ok) {
                const errorData = await statusResponse.json();
                throw new Error(errorData.error || "Błąd sprawdzania statusu");
            }

            const statusResult: KsefStatusResponse = await statusResponse.json();
            setStatusDetails(statusResult);

            // Aktualizuj fakturę jeśli otrzymano numer KSeF
            if (statusResult.ksefNumber) {
                const updatedInvoice: Invoice = {
                    ...invoice,
                    ksefNumber: statusResult.ksefNumber,
                    ksefStatus: String(statusResult.status?.code || "200"),
                };
                onInvoiceUpdate(updatedInvoice);

                setAlert({
                    type: "success",
                    message: `Faktura przyjęta w KSeF!\nNumer: ${statusResult.ksefNumber}`,
                });
            } else if (statusResult.status?.code === 440) {
                const originalNumber = statusResult.status.extensions?.originalKsefNumber;
                setAlert({
                    type: "warning",
                    message: `Faktura już istnieje w KSeF${originalNumber ? `:\n${originalNumber}` : ""}`,
                });
            } else if (statusResult.status?.code === 100) {
                setAlert({
                    type: "info",
                    message: "Faktura w trakcie przetwarzania. Spróbuj ponownie za chwilę.",
                });
            } else {
                setAlert({
                    type: "info",
                    message: `Status: ${statusResult.status?.description || "Nieznany"}`,
                });
            }

        } catch (error) {
            setAlert({
                type: "danger",
                message: error instanceof Error ? error.message : "Błąd sprawdzania statusu",
            });
        } finally {
            setLoading(false);
            setLoadingMessage("");
        }
    };

    // Pobieranie/Otwieranie UPO – bezpośredni GET do endpointu backendu
    const downloadUpo = async () => {
        setAlert(null);

        try {
            const response = await fetch(`${MainSetup.serverUrl}invoice/${invoice.id}/ksef/upo`, {
                method: "GET",
                credentials: "include",
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                const errorMessage = errorData.error
                    || errorData.errorMessage
                    || errorData.message
                    || `Błąd pobierania UPO (${response.status})`;
                throw new Error(errorMessage);
            }

            // Otwórz/ściągnij plik
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.download = `UPO_faktura_${invoice.id}.xml`;
            link.target = "_blank";
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);

            setAlert({
                type: "success",
                message: "UPO zostało pobrane/otwarte",
            });
        } catch (error) {
            setAlert({
                type: "danger",
                message: error instanceof Error ? error.message : "Błąd pobierania UPO",
            });
        }
    };

    // Funkcja do renderowania statusu
    const renderStatus = () => {
        if (invoice.ksefNumber) {
            return <span className="text-success fw-bold">✅ Przyjęta</span>;
        }
        if (invoice.ksefStatus === "PENDING") {
            return <span className="text-warning fw-bold">🟡 Wysłana - oczekuje na potwierdzenie</span>;
        }
        return <span className="text-muted">⚪ Nie wysłana</span>;
    };

    // Formatowanie daty
    const formatDate = (dateString?: string) => {
        if (!dateString) return "-";
        const date = new Date(dateString);
        return ToolsDate.dateToDDmmmYYYYHHMM(date.toISOString());
    };

    return (
        <Container className="mt-3 p-0">
            <Row className="align-items-center mb-2">
                <Col>
                    <h6 className="mb-0"><strong>KSeF - Krajowy System e-Faktur</strong></h6>
                </Col>
            </Row>
            <Row className="bg-light p-3 rounded-3">
                <Col>
                    {/* Alert */}
                    {alert && (
                        <Alert
                            variant={alert.type}
                            onClose={() => setAlert(null)}
                            dismissible
                            style={{ whiteSpace: "pre-wrap" }}
                        >
                            {alert.message}
                        </Alert>
                    )}

                    {/* Loading */}
                    {loading && (
                        <div className="mb-3">
                            <Spinner animation="border" size="sm" className="me-2" />
                            {loadingMessage}
                        </div>
                    )}

                    {/* Informacje o statusie */}
                    <div className="mb-3">
                        <Row>
                            <Col md={3}>
                                <strong>Status:</strong>
                            </Col>
                            <Col md={9}>
                                {renderStatus()}
                            </Col>
                        </Row>

                        {invoice.ksefNumber && (
                            <Row className="mt-2">
                                <Col md={3}>
                                    <strong>Numer KSeF:</strong>
                                </Col>
                                <Col md={9}>
                                    <code>{invoice.ksefNumber}</code>
                                </Col>
                            </Row>
                        )}

                        {invoice.ksefSessionId && !invoice.ksefNumber && (
                            <Row className="mt-2">
                                <Col md={3}>
                                    <strong>Nr referencyjny:</strong>
                                </Col>
                                <Col md={9}>
                                    <code className="small">{invoice.ksefSessionId}</code>
                                </Col>
                            </Row>
                        )}

                        {statusDetails?.acquisitionDate && (
                            <Row className="mt-2">
                                <Col md={3}>
                                    <strong>Data przyjęcia:</strong>
                                </Col>
                                <Col md={9}>
                                    {formatDate(statusDetails.acquisitionDate)}
                                </Col>
                            </Row>
                        )}
                    </div>

                    {/* Przyciski akcji */}
                    <div className="d-flex gap-2 flex-wrap">
                        {canSendToKsef() && (
                            <Button
                                variant="primary"
                                onClick={sendToKsef}
                                disabled={loading}
                            >
                                {loading ? (
                                    <>
                                        <Spinner animation="border" size="sm" className="me-2" />
                                        Wysyłanie...
                                    </>
                                ) : (
                                    "Wyślij do KSeF"
                                )}
                            </Button>
                        )}

                        {(invoice.ksefStatus || invoice.ksefSessionId) && (
                            <Button
                                variant="outline-secondary"
                                onClick={refreshStatus}
                                disabled={loading}
                            >
                                Odśwież status
                            </Button>
                        )}

                        {canDownloadUpo && (
                            <Button
                                variant="outline-success"
                                onClick={downloadUpo}
                                disabled={loading}
                            >
                                📄 Pobierz UPO
                            </Button>
                        )}
                    </div>
                </Col>
            </Row>
        </Container>
    );
}
