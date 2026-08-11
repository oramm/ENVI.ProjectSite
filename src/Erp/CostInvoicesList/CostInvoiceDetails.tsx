import React, { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
    Container,
    Card,
    Row,
    Col,
    Table,
    Form,
    Button,
    Alert,
    Spinner,
} from "react-bootstrap";
import { CostInvoice, CostInvoiceItem } from "../../../Typings/bussinesTypes";
import {
    fetchCostInvoiceDetails,
    fetchCostInvoiceQr,
    updateCostInvoice,
    checkWhiteList,
    CostInvoiceApiError,
    CostInvoiceQrData,
    PaymentStatus,
    PaymentStatuses,
} from "./CostInvoicesController";
import { PaymentMethodBadge, InvoiceTypeBadge, WhiteListStatusBadge } from "./CostInvoicesBadges";
import Tools from "../../React/Tools/Tools";
import ToolsDate from "../../React/Tools/ToolsDate";
import { SpinnerBootstrap } from "../../View/Resultsets/CommonComponents";
import { QRCodeSVG } from "qrcode.react";

export default function CostInvoiceDetails() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [invoice, setInvoice] = useState<CostInvoice | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [qrData, setQrData] = useState<CostInvoiceQrData | null>(null);
    const [qrLoading, setQrLoading] = useState(false);
    const [qrError, setQrError] = useState<string | null>(null);
    const [whiteListChecking, setWhiteListChecking] = useState(false);
    const [whiteListError, setWhiteListError] = useState<string | null>(null);

    // Edytowalne pola faktury
    const [notes, setNotes] = useState("");
    const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>(PaymentStatuses.UNPAID);
    const [paidAmount, setPaidAmount] = useState(0);

    const updateListCaches = useCallback((updatedInvoice: CostInvoice) => {
        if (!updatedInvoice?.id) return;

        const updateById = <T extends { id?: number }>(items: T[], nextItem: T): T[] => {
            if (!Array.isArray(items)) return items;
            let found = false;
            const updated = items.map((item) => {
                if (item?.id === nextItem.id) {
                    found = true;
                    return { ...item, ...nextItem };
                }
                return item;
            });
            return found ? updated : items;
        };

        try {
            const repoRaw = sessionStorage.getItem("costInvoices");
            if (repoRaw) {
                const repoParsed = JSON.parse(repoRaw);
                const updatedItems = updateById(repoParsed?.items || [], updatedInvoice);
                sessionStorage.setItem(
                    "costInvoices",
                    JSON.stringify({ ...repoParsed, items: updatedItems })
                );
            }
        } catch (error) {
            console.warn("[CostInvoiceDetails] Nie udało się zaktualizować cache repozytorium", error);
        }

        try {
            const snapshotKey = "filtersableTableSnapshot_costInvoices";
            const snapshotRaw = sessionStorage.getItem(snapshotKey);
            if (snapshotRaw) {
                const snapshotParsed = JSON.parse(snapshotRaw);
                const updatedStoredObjects = updateById(
                    snapshotParsed?.storedObjects || [],
                    updatedInvoice
                );
                sessionStorage.setItem(
                    snapshotKey,
                    JSON.stringify({ ...snapshotParsed, storedObjects: updatedStoredObjects })
                );
            }
        } catch (error) {
            console.warn("[CostInvoiceDetails] Nie udało się zaktualizować snapshotu listy", error);
        }
    }, []);

    useEffect(() => {
        if (!id) return;
        loadData();
    }, [id]);

    const loadData = useCallback(async () => {
        if (!id) return;
        setLoading(true);
        setError(null);

        try {
            const invoiceData = await fetchCostInvoiceDetails(Number(id));

            setInvoice(invoiceData);

            // Ustaw wartości edytowalnych pól
            setNotes(invoiceData.notes || "");
            setPaymentStatus(invoiceData.paymentStatus ?? PaymentStatuses.UNPAID);
            setPaidAmount(invoiceData.paidAmount ?? 0);

            document.title = `Faktura ${invoiceData.invoiceNumber} | ${invoiceData.supplierName}`;
        } catch (err) {
            setError(err instanceof Error ? err.message : "Błąd ładowania danych");
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        if (!invoice?.id) return;

        setQrLoading(true);
        setQrError(null);
        setQrData(null);

        fetchCostInvoiceQr(invoice.id)
            .then((data) => {
                setQrData(data);
            })
            .catch((err) => {
                if (err instanceof CostInvoiceApiError) {
                    setQrError(err.message);
                    return;
                }
                setQrError(err instanceof Error ? err.message : "Błąd pobierania danych QR");
            })
            .finally(() => {
                setQrLoading(false);
            });
    }, [invoice?.id]);

    const handleSave = async () => {
        if (!invoice) return;
        if (paymentStatus === PaymentStatuses.PARTIALLY_PAID && paidAmount <= 0) {
            setError("Dla statusu 'Częściowo zapłacona' kwota zapłacona musi być większa od 0.");
            return;
        }
        setSaving(true);
        setError(null);
        setSuccess(null);

        try {
            const updatedInvoice = await updateCostInvoice(invoice.id, {
                notes: notes || null,
                paymentStatus,
                paidAmount,
            });

            updateListCaches(updatedInvoice);
            setInvoice((prev) => (prev ? { ...prev, ...updatedInvoice } : updatedInvoice));
            setPaymentStatus(updatedInvoice.paymentStatus ?? PaymentStatuses.UNPAID);
            setPaidAmount(updatedInvoice.paidAmount ?? 0);

            setSuccess("Zmiany zostały zapisane");

            // Odśwież dane
            await loadData();
        } catch (err) {
            setError(err instanceof Error ? err.message : "Błąd zapisywania");
        } finally {
            setSaving(false);
        }
    };

    const copyQrLink = async (qrLink: string) => {
        try {
            if (navigator.clipboard?.writeText) {
                await navigator.clipboard.writeText(qrLink);
            } else {
                const textarea = document.createElement("textarea");
                textarea.value = qrLink;
                textarea.setAttribute("readonly", "true");
                textarea.style.position = "absolute";
                textarea.style.left = "-9999px";
                document.body.appendChild(textarea);
                textarea.select();
                document.execCommand("copy");
                document.body.removeChild(textarea);
            }

            setSuccess("Link QR został skopiowany do schowka.");
        } catch (err) {
            setError(err instanceof Error ? err.message : "Nie udało się skopiować linku QR");
        }
    };

    /**
     * NIP-K2 — ręczna (re-)weryfikacja Białej Listy VAT (KAS wl-api). Nadpisuje
     * poprzedni wynik i odświeża badge. Weryfikacja jest tylko ostrzegawcza
     * (patrz alert NIEZGODNOŚĆ niżej).
     */
    const handleCheckWhiteList = async () => {
        if (!invoice?.id) return;
        setWhiteListChecking(true);
        setWhiteListError(null);
        try {
            const updated = await checkWhiteList(invoice.id);
            updateListCaches(updated);
            setInvoice((prev) => (prev ? { ...prev, ...updated } : updated));
        } catch (err) {
            setWhiteListError(
                err instanceof CostInvoiceApiError
                    ? err.message
                    : err instanceof Error
                    ? err.message
                    : "Błąd weryfikacji Białej Listy"
            );
        } finally {
            setWhiteListChecking(false);
        }
    };

    if (loading) {
        return (
            <div className="text-center m-5">
                <SpinnerBootstrap />
                <div className="mt-3">Ładowanie danych faktury...</div>
            </div>
        );
    }

    if (!invoice) {
        return (
            <Alert variant="danger" className="m-3">
                Nie znaleziono faktury
            </Alert>
        );
    }

    const supplierBankAccount = invoice.supplierBankAccount?.trim();
    const canMarkPartiallyPaid = invoice.grossAmount > 0;
    const items = invoice._items || [];

    return (
        <Container fluid className="py-3">
            {error && (
                <Alert variant="danger" onClose={() => setError(null)} dismissible>
                    {error}
                </Alert>
            )}
            {success && (
                <Alert variant="success" onClose={() => setSuccess(null)} dismissible>
                    {success}
                </Alert>
            )}

            {/* Nagłówek faktury */}
            <Card className="mb-3">
                <Card.Header>
                    <Row className="align-items-center">
                        <Col>
                            <h4 className="mb-0">
                                Faktura {invoice.invoiceNumber}
                                <InvoiceTypeBadge invoiceType={invoice.invoiceType} />
                                {" "}
                                <WhiteListStatusBadge
                                    status={invoice.whiteListStatus}
                                    checkedAt={invoice.whiteListCheckedAt}
                                    requestId={invoice.whiteListRequestId}
                                />
                            </h4>
                        </Col>
                        <Col xs="auto">
                            <Button
                                variant="outline-secondary"
                                size="sm"
                                onClick={() => navigate("/costInvoices")}
                            >
                                ← Powrót do listy
                            </Button>
                        </Col>
                    </Row>
                </Card.Header>
                <Card.Body>
                    <Row>
                        <Col md={6}>
                            <h6>Dostawca</h6>
                            <p className="mb-1">
                                <strong>{invoice.supplierName}</strong>
                            </p>
                            <p className="mb-1 text-muted">NIP: {invoice.supplierNip}</p>
                            {invoice.supplierAddress && (
                                <p className="mb-1 text-muted small">{invoice.supplierAddress}</p>
                            )}
                            <p className="mb-0 small">
                                <span className="text-muted">Konto: </span>
                                {supplierBankAccount ? (
                                    <>
                                        <code>{supplierBankAccount}</code>
                                        <Button
                                            variant="link"
                                            size="sm"
                                            className="py-0 px-1"
                                            title="Kopiuj numer rachunku"
                                            onClick={() => navigator.clipboard.writeText(supplierBankAccount)}
                                        >
                                            ⎘
                                        </Button>
                                    </>
                                ) : (
                                    <span className="text-muted">brak</span>
                                )}
                            </p>
                        </Col>
                        <Col md={3}>
                            <h6>Daty</h6>
                            <p className="mb-1">
                                <small className="text-muted">Wystawienia:</small>{" "}
                                {ToolsDate.dateYMDtoDMY(invoice.issueDate)}
                            </p>
                            {invoice.saleDate && (
                                <p className="mb-1">
                                    <small className="text-muted">Sprzedaży:</small>{" "}
                                    {ToolsDate.dateYMDtoDMY(invoice.saleDate)}
                                </p>
                            )}
                            {invoice.dueDate && (
                                <p className="mb-1">
                                    <small className="text-muted">Płatności:</small>{" "}
                                    {ToolsDate.dateYMDtoDMY(invoice.dueDate)}
                                </p>
                            )}
                            {invoice.paymentDate && (
                                <p className="mb-0">
                                    <small className="text-muted">Zapłacono:</small>{" "}
                                    <strong className="text-success">{ToolsDate.dateYMDtoDMY(invoice.paymentDate)}</strong>
                                </p>
                            )}
                        </Col>
                        <Col md={3}>
                            <h6>Wartości</h6>
                            <p className="mb-1">
                                <small className="text-muted">Netto:</small>{" "}
                                <strong>{Tools.formatNumber(invoice.netAmount)} {invoice.currency}</strong>
                            </p>
                            <p className="mb-1">
                                <small className="text-muted">VAT:</small>{" "}
                                {Tools.formatNumber(invoice.vatAmount)} {invoice.currency}
                            </p>
                            <p className="mb-0">
                                <small className="text-muted">Brutto:</small>{" "}
                                <strong>{Tools.formatNumber(invoice.grossAmount)} {invoice.currency}</strong>
                            </p>
                        </Col>
                    </Row>
                    <Row className="mt-3">
                        <Col>
                            <small className="text-muted">Nr KSeF: </small>
                            <code className="small">{invoice.ksefNumber}</code>
                        </Col>
                    </Row>
                </Card.Body>
            </Card>

            <Card className="mb-3">
                <Card.Header>
                    <h5 className="mb-0">KSeF - kod QR</h5>
                </Card.Header>
                <Card.Body>
                    {qrLoading && (
                        <div className="mb-3">
                            <Spinner animation="border" size="sm" className="me-2" />
                            Ładowanie danych QR...
                        </div>
                    )}

                    {qrError && (
                        <Alert variant="info" className="mb-0">
                            {qrError}
                        </Alert>
                    )}

                    {!qrLoading && !qrError && qrData && (
                        <Row className="align-items-center g-3">
                            <Col md={4} className="text-center">
                                <div className="d-inline-flex p-2 bg-white border rounded-3 shadow-sm">
                                    <QRCodeSVG
                                        value={qrData.qrVerificationUrl}
                                        size={176}
                                        level="M"
                                        includeMargin
                                    />
                                </div>
                                <div className="mt-2 small text-muted">Kod QR dla faktury kosztowej</div>
                                <div className="fw-bold">{qrData.qrLabel}</div>
                            </Col>
                            <Col md={8}>
                                <div className="fw-semibold mb-2">Link weryfikacyjny KSeF</div>
                                <div className="small text-break mb-3">
                                    <code>{qrData.qrVerificationUrl}</code>
                                </div>
                                <div className="d-flex gap-2 flex-wrap">
                                    <Button
                                        as="a"
                                        href={qrData.qrVerificationUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        variant="outline-primary"
                                        size="sm"
                                    >
                                        Otwórz link
                                    </Button>
                                    <Button
                                        variant="outline-secondary"
                                        size="sm"
                                        onClick={() => copyQrLink(qrData.qrVerificationUrl)}
                                    >
                                        Kopiuj link
                                    </Button>
                                </div>
                            </Col>
                        </Row>
                    )}

                    {!qrLoading && !qrError && !qrData && (
                        <Alert variant="info" className="mb-0">
                            Brak danych do wygenerowania kodu QR.
                        </Alert>
                    )}
                </Card.Body>
            </Card>

            {/* Płatność i notatki */}
            <Card className="mb-3">
                <Card.Header className="d-flex align-items-center justify-content-between">
                    <h5 className="mb-0">Płatność</h5>
                    <Button
                        variant="outline-secondary"
                        size="sm"
                        onClick={handleCheckWhiteList}
                        disabled={whiteListChecking}
                    >
                        {whiteListChecking ? (
                            <>
                                <Spinner animation="border" size="sm" className="me-1" />
                                Weryfikacja...
                            </>
                        ) : (
                            "Zweryfikuj rachunek (Biała lista)"
                        )}
                    </Button>
                </Card.Header>
                <Card.Body>
                    {whiteListError && (
                        <Alert variant="danger" className="mb-3" onClose={() => setWhiteListError(null)} dismissible>
                            {whiteListError}
                        </Alert>
                    )}
                    {invoice.whiteListStatus === "VERIFIED_MISMATCH" && (
                        <Alert variant="danger" className="mb-3">
                            <strong>⚠️ Niezgodność na Białej Liście VAT:</strong> numer rachunku dostawcy nie
                            figuruje na Białej Liście na sprawdzaną datę. To ostrzeżenie, nie blokada — ale
                            zweryfikuj rachunek przed wykonaniem przelewu.
                        </Alert>
                    )}

                    <Row>
                        <Col md={12}>
                            <Form.Label>Status płatności</Form.Label>
                            <div className="mb-2">
                                <PaymentMethodBadge paymentMethod={invoice.paymentMethod} />
                            </div>
                            <div className="d-flex gap-2 flex-wrap mb-2">
                                {([
                                    { value: PaymentStatuses.UNPAID, label: "● Niezapłacona" },
                                    { value: PaymentStatuses.PARTIALLY_PAID, label: "◑ Częściowo" },
                                    { value: PaymentStatuses.PAID, label: "✓ Zapłacona" },
                                    { value: PaymentStatuses.NOT_APPLICABLE, label: "– Nie dotyczy" },
                                ] as const).map(({ value, label }) => (
                                    <Button
                                        key={value}
                                        size="sm"
                                        variant={paymentStatus === value ? "primary" : "outline-secondary"}
                                        disabled={value === PaymentStatuses.PARTIALLY_PAID && !canMarkPartiallyPaid}
                                        onClick={() => {
                                            setPaymentStatus(value);
                                            if (value === PaymentStatuses.PAID) setPaidAmount(invoice.grossAmount);
                                            if (value === PaymentStatuses.UNPAID || value === PaymentStatuses.NOT_APPLICABLE) setPaidAmount(0);
                                        }}
                                    >
                                        {label}
                                    </Button>
                                ))}
                            </div>
                            {!canMarkPartiallyPaid && (
                                <div className="text-muted small mb-2">
                                    Dla dokumentów z ujemnym brutto status częściowej płatności nie jest dostępny.
                                </div>
                            )}
                            {paymentStatus === PaymentStatuses.PARTIALLY_PAID && (
                                <Row className="align-items-center g-2">
                                    <Col xs="auto">
                                        <Form.Label className="mb-0 small">Kwota zapłacona</Form.Label>
                                    </Col>
                                    <Col xs="auto">
                                        <Form.Control
                                            type="number"
                                            size="sm"
                                            min={0}
                                            max={invoice.grossAmount}
                                            step={0.01}
                                            value={paidAmount}
                                            onChange={(e) => setPaidAmount(parseFloat(e.target.value) || 0)}
                                            style={{ width: "130px" }}
                                        />
                                    </Col>
                                    <Col xs="auto">
                                        <span className="text-muted small">
                                            z {Tools.formatNumber(invoice.grossAmount)} {invoice.currency}
                                            {" · "}pozostało:{" "}
                                            <strong className={invoice.grossAmount - paidAmount > 0 ? "text-danger" : "text-success"}>
                                                {Tools.formatNumber(invoice.grossAmount - paidAmount)} {invoice.currency}
                                            </strong>
                                        </span>
                                    </Col>
                                </Row>
                            )}
                        </Col>
                    </Row>

                    <Row className="mt-3">
                        <Col md={12}>
                            <Form.Group className="mb-0">
                                <Form.Label>Notatki</Form.Label>
                                <Form.Control
                                    as="textarea"
                                    rows={2}
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                    placeholder="Dodatkowe informacje..."
                                />
                            </Form.Group>
                        </Col>
                    </Row>
                </Card.Body>
            </Card>

            {/* Pozycje faktury */}
            <Card className="mb-3">
                <Card.Header>
                    <h5 className="mb-0">Pozycje faktury ({items.length})</h5>
                </Card.Header>
                <Card.Body className="p-0">
                    {items.length === 0 ? (
                        <div className="p-3 text-muted small">Brak pozycji</div>
                    ) : (
                        <Table striped hover responsive className="mb-0">
                            <thead>
                                <tr>
                                    <th>Lp.</th>
                                    <th>Opis</th>
                                    <th className="text-end">Ilość</th>
                                    <th className="text-end">Cena jedn.</th>
                                    <th className="text-end">Netto</th>
                                    <th className="text-center">VAT</th>
                                    <th className="text-end">Brutto</th>
                                </tr>
                            </thead>
                            <tbody>
                                {items.map((item: CostInvoiceItem) => (
                                    <tr key={item.id}>
                                        <td>{item.lineNumber}</td>
                                        <td>{item.description}</td>
                                        <td className="text-end">
                                            {item.quantity} {item.unit}
                                        </td>
                                        <td className="text-end">{Tools.formatNumber(item.unitPrice)}</td>
                                        <td className="text-end">{Tools.formatNumber(item.netValue)}</td>
                                        <td className="text-center">{item.vatRate}%</td>
                                        <td className="text-end">{Tools.formatNumber(item.grossValue)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </Table>
                    )}
                </Card.Body>
            </Card>

            {/* Przyciski akcji */}
            <div className="d-flex gap-2">
                <Button variant="primary" onClick={handleSave} disabled={saving}>
                    {saving ? (
                        <>
                            <Spinner animation="border" size="sm" className="me-1" />
                            Zapisywanie...
                        </>
                    ) : (
                        "💾 Zapisz zmiany"
                    )}
                </Button>
            </div>
        </Container>
    );
}
