import React, { useState, useCallback, useRef } from "react";
import { Alert, Button, Container, Row, Col, Spinner, Form } from "react-bootstrap";
import { Invoice } from "../../../../Typings/bussinesTypes";
import ToolsDate from "../../../React/Tools/ToolsDate";
import MainSetup from "../../../React/MainSetupReact";
import { Link } from "react-router-dom";

// Typy dla odpowiedzi API KSeF
interface KsefSendResponse {
    invoiceId: number;
    referenceNumber: string;
    status: string;
    message: string;
}

interface CorrectionSendPayload {
    originalKsefNumber: string;
    originalInvoiceNumber?: string;
    originalIssueDate?: string;
    correctionReason?: string;
    correctionType?: 1 | 2 | 3;
}

const KSEF_CORRECTION_TYPES = {
    1: "Korekta skutkująca w dacie ujęcia faktury pierwotnej",
    2: "Korekta skutkująca w dacie wystawienia faktury korygującej",
    3: "Korekta skutkująca w dacie innej, w tym gdy dla różnych pozycji faktury korygującej daty te są różne",
} as const;

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
    correctedInvoiceNumber?: string | null;
}

type AlertState = {
    type: "success" | "danger" | "warning" | "info";
    message: string;
} | null;

export default function KsefSection({ invoice, onInvoiceUpdate, correctedInvoiceNumber }: KsefSectionProps) {
    const [loading, setLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState("");
    const [copyingXml, setCopyingXml] = useState(false);
    const [alert, setAlert] = useState<AlertState>(null);
    const [statusDetails, setStatusDetails] = useState<KsefStatusResponse | null>(null);
    const [ksefCorrectionType, setKsefCorrectionType] = useState<1 | 2 | 3 | null>(null);
    const pollingRef = useRef<NodeJS.Timeout | null>(null);

    // Faktura jest korektą jeśli ma ustawione correctedInvoiceId
    const isCorrectionInvoice = !!invoice.correctedInvoiceId;

    React.useEffect(() => {
        if (!isCorrectionInvoice || !invoice.id) {
            return;
        }

        const fromInvoice = Number(invoice.ksefCorrectionType);
        if (fromInvoice >= 1 && fromInvoice <= 3) {
            setKsefCorrectionType(fromInvoice as 1 | 2 | 3);
            return;
        }

        setKsefCorrectionType(null);
    }, [invoice.id, invoice.ksefCorrectionType, isCorrectionInvoice]);

    const persistCorrectionType = async (nextCorrectionType: 1 | 2 | 3 | null): Promise<boolean> => {
        if (!invoice.id) {
            return false;
        }

        try {
            const response = await fetch(`${MainSetup.serverUrl}invoice/${invoice.id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: "include",
                body: JSON.stringify({
                    ...invoice,
                    ksefCorrectionType: nextCorrectionType,
                    _fieldsToUpdate: ["ksefCorrectionType"],
                }),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(
                    errorData.error
                        || errorData.errorMessage
                        || errorData.message
                        || `Błąd zapisu typu korekty (${response.status})`,
                );
            }

            const updatedInvoiceFromServer = await response.json();
            onInvoiceUpdate({
                ...invoice,
                ...updatedInvoiceFromServer,
                ksefCorrectionType: nextCorrectionType,
            });
            return true;
        } catch (error) {
            setAlert({
                type: "danger",
                message: error instanceof Error ? error.message : "Nie udało się zapisać typu korekty",
            });
            return false;
        }
    };

    // Sprawdź czy przycisk "Wyślij do KSeF" powinien być widoczny
    const canSendToKsef = useCallback(() => {
        // Nie pokazuj jeśli faktura już ma numer KSeF
        if (invoice.ksefNumber) return false;

        // Nie pokazuj jeśli faktura została już wysłana do KSeF
        if (invoice.ksefStatus) return false;

        // Nie pokazuj jeśli faktura ma już sessionId (była wysłana)
        if (invoice.ksefSessionId) return false;

        // Pokaż tylko gdy faktura jest ustawiona jako "Wysłana" (SENT)
        return invoice.status === MainSetup.InvoiceStatuses.SENT;
    }, [invoice.ksefNumber, invoice.ksefStatus, invoice.ksefSessionId, invoice.status]);

    const resolveCorrectionSendPayload = async (): Promise<CorrectionSendPayload> => {
        const originalKsefNumberFromInvoice =
            invoice.originalKsefNumber || invoice._correctedInvoice?.ksefNumber || null;

        if (originalKsefNumberFromInvoice) {
            const payload: CorrectionSendPayload = {
                originalKsefNumber: originalKsefNumberFromInvoice,
                originalInvoiceNumber: invoice._correctedInvoice?.number || undefined,
                originalIssueDate: invoice._correctedInvoice?.issueDate || undefined,
                correctionReason: invoice.correctionReason || undefined,
            };
            if (ksefCorrectionType !== null) {
                payload.correctionType = ksefCorrectionType;
            }
            return {
                ...payload,
            };
        }

        if (!invoice.correctedInvoiceId) {
            throw new Error("Brak correctedInvoiceId dla faktury korygującej");
        }

        const originalResponse = await fetch(`${MainSetup.serverUrl}invoices`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            credentials: "include",
            body: JSON.stringify({
                orConditions: [{ id: invoice.correctedInvoiceId }],
            }),
        });

        if (!originalResponse.ok) {
            throw new Error("Nie udało się pobrać faktury źródłowej do wysyłki korekty");
        }

        const originalInvoices = await originalResponse.json();
        const originalInvoice: Invoice | undefined = Array.isArray(originalInvoices)
            ? originalInvoices[0]
            : undefined;

        const originalKsefNumber = originalInvoice?.ksefNumber || null;
        if (!originalKsefNumber) {
            throw new Error("Faktura źródłowa nie ma numeru KSeF (originalKsefNumber)");
        }

        const payload: CorrectionSendPayload = {
            originalKsefNumber,
            originalInvoiceNumber: originalInvoice?.number || undefined,
            originalIssueDate: originalInvoice?.issueDate || undefined,
            correctionReason: invoice.correctionReason || undefined,
        };
        if (ksefCorrectionType !== null) {
            payload.correctionType = ksefCorrectionType;
        }

        return payload;
    };

    // Sprawdź czy można pobrać UPO - tylko gdy faktycznie ma numer KSeF
    const canDownloadUpo = !!invoice.ksefNumber && invoice.ksefNumber.trim().length > 0;

    const openPdfPreview = () => {
        const previewUrl = `${window.location.origin}${window.location.pathname}#/invoice/${invoice.id}/ksef/pdf-preview`;
        window.open(previewUrl, "_blank", "noopener,noreferrer");
    };

    const copyCurrentXml = async () => {
        setCopyingXml(true);
        setAlert(null);

        try {
            const previewUrl = `${MainSetup.serverUrl}invoice/${invoice.id}/ksef/xml-preview`;

            const response = await fetch(previewUrl, {
                method: "GET",
                credentials: "include",
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                if (response.status === 400 && errorData.details) {
                    const detailsList = errorData.details.join("\n• ");
                    throw new Error(`Błąd walidacji:\n• ${detailsList}`);
                }

                throw new Error(
                    errorData.error
                        || errorData.errorMessage
                        || errorData.message
                        || `Błąd serwera (${response.status})`,
                );
            }

            const xml = await response.text();

            if (navigator.clipboard?.writeText) {
                await navigator.clipboard.writeText(xml);
            } else {
                const textarea = document.createElement("textarea");
                textarea.value = xml;
                textarea.setAttribute("readonly", "true");
                textarea.style.position = "absolute";
                textarea.style.left = "-9999px";
                document.body.appendChild(textarea);
                textarea.select();
                document.execCommand("copy");
                document.body.removeChild(textarea);
            }

            setAlert({
                type: "success",
                message: isCorrectionInvoice
                    ? "XML faktury korygującej został skopiowany do schowka."
                    : "XML faktury został skopiowany do schowka.",
            });
        } catch (error) {
            setAlert({
                type: "danger",
                message: error instanceof Error ? error.message : "Nie udało się skopiować XML",
            });
        } finally {
            setCopyingXml(false);
        }
    };

    // Funkcja do wysyłania faktury do KSeF
    const sendToKsef = async () => {
        setLoading(true);
        setLoadingMessage("Wysyłanie do KSeF...");
        setAlert(null);
        setStatusDetails(null);

        try {
            let sendResponse: Response;
            if (isCorrectionInvoice) {
                const correctionPayload = await resolveCorrectionSendPayload();
                sendResponse = await fetch(`${MainSetup.serverUrl}invoice/${invoice.id}/ksef/correction`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    credentials: "include",
                    body: JSON.stringify(correctionPayload),
                });
            } else {
                sendResponse = await fetch(`${MainSetup.serverUrl}invoice/${invoice.id}/ksef/send`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    credentials: "include",
                });
            }

            if (!sendResponse.ok) {
                const errorData = await sendResponse.json();
                if (sendResponse.status === 400 && errorData.details) {
                    const detailsList = errorData.details.join("\n• ");
                    throw new Error(`Błąd walidacji:\n• ${detailsList}`);
                }
                const errorMessage = errorData.error 
                    || errorData.errorMessage 
                    || errorData.message 
                    || `Błąd serwera (${sendResponse.status})`;
                const details = errorData.details 
                    ? `\n\nSzczegóły:\n• ${errorData.details.join("\n• ")}`
                    : "";
                throw new Error(errorMessage + details);
            }

            const sendResult: KsefSendResponse = await sendResponse.json();
            
            const updatedInvoice: Invoice = {
                ...invoice,
                ksefStatus: isCorrectionInvoice ? "PENDING_CORRECTION" : "PENDING",
                ksefSessionId: sendResult.referenceNumber,
            };
            onInvoiceUpdate(updatedInvoice);

            setAlert({
                type: "info",
                message: sendResult.message,
            });

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
        const pollingInterval = 3000;

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

    // Pobieranie UPO
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
                message: "UPO zostało pobrane",
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
        if (invoice.ksefStatus === "PENDING" || invoice.ksefStatus === "PENDING_CORRECTION") {
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

                    {/* Info o korekcie */}
                    {isCorrectionInvoice && (
                        <Alert variant="info" className="mb-3">
                            <strong>📋 To jest faktura korygująca</strong>
                            <br />
                            Koryguje fakturę:{" "}
                            <Link to={`/invoice/${invoice.correctedInvoiceId}`}>
                                {invoice._correctedInvoice?.number || correctedInvoiceNumber || `#${invoice.correctedInvoiceId}`}
                            </Link>
                            {invoice.correctionReason && (
                                <>
                                    <br />
                                    <strong>Przyczyna:</strong> {invoice.correctionReason}
                                </>
                            )}
                            {invoice.originalKsefNumber && (
                                <>
                                    <br />
                                    <strong>Nr KSeF faktury źródłowej:</strong>{" "}
                                    <code>{invoice.originalKsefNumber}</code>
                                </>
                            )}
                        </Alert>
                    )}

                    {/* Informacje o statusie */}
                    <div className="mb-3">
                        <Row>
                            <Col md={3}>
                                <strong>Status KSeF:</strong>
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

                        {isCorrectionInvoice && (
                            <Row className="mt-2">
                                <Col md={3}>
                                    <strong>Typ korekty KSeF:</strong>
                                </Col>
                                <Col md={9}>
                                    <Form.Select
                                        size="sm"
                                        value={ksefCorrectionType ?? ""}
                                        onChange={async (e) => {
                                            const rawValue = e.target.value;
                                            const nextValue = rawValue ? (Number(rawValue) as 1 | 2 | 3) : null;
                                            const previousValue = ksefCorrectionType;

                                            setKsefCorrectionType(nextValue);
                                            const saved = await persistCorrectionType(nextValue);
                                            if (!saved) {
                                                setKsefCorrectionType(previousValue);
                                            }
                                        }}
                                    >
                                        <option value="">Wybierz</option>
                                        {Object.entries(KSEF_CORRECTION_TYPES).map(([value, label]) => (
                                            <option key={value} value={value}>
                                                {label}
                                            </option>
                                        ))}
                                    </Form.Select>
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
                        <Button variant="outline-secondary" onClick={openPdfPreview} disabled={loading || copyingXml}>
                            Podgląd PDF
                        </Button>

                        <Button variant="outline-primary" onClick={copyCurrentXml} disabled={loading || copyingXml}>
                            {copyingXml ? "Kopiowanie XML..." : "Kopiuj XML"}
                        </Button>

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
