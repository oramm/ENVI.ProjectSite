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
import { CostInvoice, CostInvoiceCategory, CostInvoiceItem } from "../../../Typings/bussinesTypes";
import {
    fetchCostInvoiceDetails,
    fetchCategories,
    updateCostInvoice,
    updateCostInvoiceItem,
    bookCostInvoice,
    CostInvoiceApiError,
    CostInvoiceStatus,
    CostInvoiceStatuses,
    PaymentStatus,
    PaymentStatuses,
} from "./CostInvoicesController";
import { CostInvoiceStatusBadge, PaymentMethodBadge, InvoiceTypeBadge } from "./CostInvoicesBadges";
import Tools from "../../React/Tools/Tools";
import ToolsDate from "../../React/Tools/ToolsDate";
import { SpinnerBootstrap } from "../../View/Resultsets/CommonComponents";

export default function CostInvoiceDetails() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [invoice, setInvoice] = useState<CostInvoice | null>(null);
    const [categories, setCategories] = useState<CostInvoiceCategory[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [validationDetails, setValidationDetails] = useState<string[]>([]);
    const [success, setSuccess] = useState<string | null>(null);

    // Edytowalne pola faktury
    const [categoryId, setCategoryId] = useState<number | null>(null);
    const [bookingPercentage, setBookingPercentage] = useState(100);
    const [vatDeductionPercentage, setVatDeductionPercentage] = useState(100);
    const [notes, setNotes] = useState("");
    const [status, setStatus] = useState<CostInvoiceStatus>(CostInvoiceStatuses.NEW);
    const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>(PaymentStatuses.UNPAID);
    const [paidAmount, setPaidAmount] = useState(0);

    // Edytowalne pozycje
    const [editedItems, setEditedItems] = useState<Map<number, Partial<CostInvoiceItem>>>(new Map());

    useEffect(() => {
        if (!id) return;
        loadData();
    }, [id]);

    const loadData = useCallback(async () => {
        if (!id) return;
        setLoading(true);
        setError(null);

        try {
            const [invoiceData, categoriesData] = await Promise.all([
                fetchCostInvoiceDetails(Number(id)),
                fetchCategories(),
            ]);

            const invoiceWithItems = { ...invoiceData };

            setInvoice(invoiceWithItems);
            setCategories(categoriesData);

            // Ustaw wartości edytowalnych pól
            setCategoryId(invoiceWithItems.categoryId || null);
            setBookingPercentage(invoiceWithItems.bookingPercentage);
            setVatDeductionPercentage(invoiceWithItems.vatDeductionPercentage);
            setNotes(invoiceWithItems.notes || "");
            setStatus(invoiceWithItems.status);
            setPaymentStatus(invoiceWithItems.paymentStatus ?? PaymentStatuses.UNPAID);
            setPaidAmount(invoiceWithItems.paidAmount ?? 0);

            document.title = `Faktura ${invoiceWithItems.invoiceNumber} | ${invoiceWithItems.supplierName}`;
        } catch (err) {
            setError(err instanceof Error ? err.message : "Błąd ładowania danych");
        } finally {
            setLoading(false);
        }
    }, [id]);

    const handleCategoryChange = (newCategoryId: number | null) => {
        setCategoryId(newCategoryId);

        // Ustaw domyślny % odliczenia VAT dla kategorii
        if (newCategoryId) {
            const category = categories.find((c) => c.id === newCategoryId);
            if (category) {
                setVatDeductionPercentage(category.vatDeductionDefault);
            }
        }
    };

    const handleItemChange = (
        itemId: number,
        field: keyof CostInvoiceItem,
        value: any
    ) => {
        setEditedItems((prev) => {
            const newMap = new Map(prev);
            const existing = newMap.get(itemId) || {};
            newMap.set(itemId, { ...existing, [field]: value });
            return newMap;
        });
    };

    const handleSave = async () => {
        if (!invoice) return;
        if (paymentStatus === PaymentStatuses.PARTIALLY_PAID && paidAmount <= 0) {
            setError("Dla statusu 'Częściowo zapłacona' kwota zapłacona musi być większa od 0.");
            return;
        }
        setSaving(true);
        setError(null);
        setValidationDetails([]);
        setSuccess(null);

        try {
            await persistChanges(invoice.id);

            setSuccess("Zmiany zostały zapisane");

            // Odśwież dane
            await loadData();
        } catch (err) {
            if (err instanceof CostInvoiceApiError) {
                setValidationDetails(err.details);
            }
            setError(err instanceof Error ? err.message : "Błąd zapisywania");
        } finally {
            setSaving(false);
        }
    };

    const persistChanges = async (invoiceId: number) => {
        await updateCostInvoice(invoiceId, {
            categoryId,
            bookingPercentage,
            vatDeductionPercentage,
            notes: notes || null,
            status,
            paymentStatus,
            paidAmount,
        });

        for (const [itemId, changes] of editedItems) {
            if (Object.keys(changes).length > 0) {
                await updateCostInvoiceItem(invoiceId, itemId, changes);
            }
        }

        setEditedItems(new Map());
    };

    const handleBook = async () => {
        if (!invoice) return;
        setSaving(true);
        setError(null);
        setValidationDetails([]);

        try {
            await persistChanges(invoice.id);
            const updated = await bookCostInvoice(invoice.id);
            setInvoice((prev) => (prev ? { ...updated, _items: prev._items || updated._items } : updated));
            setStatus(updated.status);
            setSuccess("Faktura została zaksięgowana");
        } catch (err) {
            if (err instanceof CostInvoiceApiError) {
                setValidationDetails(err.details);

                console.error("[CostInvoiceDetails] Błąd walidacji księgowania", {
                    invoiceId: invoice.id,
                    status: err.status,
                    details: err.details,
                    payload: err.payload,
                });
            }
            setError(err instanceof Error ? err.message : "Błąd księgowania");
        } finally {
            setSaving(false);
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

    const isBooked = invoice.status === CostInvoiceStatuses.BOOKED;
    const supplierBankAccount = invoice.supplierBankAccount?.trim();

    const getItemSelection = (item: CostInvoiceItem) => {
        const edited = editedItems.get(item.id) || {};
        return {
            isSelected: edited.isSelectedForBooking ?? item.isSelectedForBooking,
            bookingPercentage: edited.bookingPercentage ?? item.bookingPercentage,
            vatDeductionPercentage: edited.vatDeductionPercentage ?? item.vatDeductionPercentage,
        };
    };

    const costItems = (invoice._items || []).filter((item) => getItemSelection(item).isSelected);
    const nonCostItems = (invoice._items || []).filter((item) => !getItemSelection(item).isSelected);

    const renderItemsTable = (items: CostInvoiceItem[], title: string) => (
        <div className="mb-3">
            <div className="px-3 pt-3 fw-semibold">
                {title} ({items.length})
            </div>
            {items.length === 0 ? (
                <div className="px-3 pb-3 text-muted small">Brak pozycji</div>
            ) : (
                <Table striped hover responsive className="mb-0">
                    <thead>
                        <tr>
                            <th style={{ width: "40px" }}>
                                <Form.Check
                                    type="checkbox"
                                    disabled={isBooked}
                                    checked={items.every((i) => getItemSelection(i).isSelected)}
                                    onChange={(e) => {
                                        items.forEach((item) => {
                                            handleItemChange(item.id, "isSelectedForBooking", e.target.checked);
                                        });
                                    }}
                                />
                            </th>
                            <th>Lp.</th>
                            <th>Opis</th>
                            <th className="text-end">Ilość</th>
                            <th className="text-end">Cena jedn.</th>
                            <th className="text-end">Netto</th>
                            <th className="text-center">VAT</th>
                            <th className="text-end">Brutto</th>
                            <th style={{ width: "100px" }}>Księg. %</th>
                            <th style={{ width: "100px" }}>VAT odl. %</th>
                        </tr>
                    </thead>
                    <tbody>
                        {items.map((item) => {
                            const { isSelected, bookingPercentage, vatDeductionPercentage } = getItemSelection(item);

                            return (
                                <tr key={item.id} className={!isSelected ? "text-muted" : ""}>
                                    <td>
                                        <Form.Check
                                            type="checkbox"
                                            checked={isSelected}
                                            disabled={isBooked}
                                            onChange={(e) =>
                                                handleItemChange(item.id, "isSelectedForBooking", e.target.checked)
                                            }
                                        />
                                    </td>
                                    <td>{item.lineNumber}</td>
                                    <td>{item.description}</td>
                                    <td className="text-end">
                                        {item.quantity} {item.unit}
                                    </td>
                                    <td className="text-end">{Tools.formatNumber(item.unitPrice)}</td>
                                    <td className="text-end">{Tools.formatNumber(item.netValue)}</td>
                                    <td className="text-center">{item.vatRate}%</td>
                                    <td className="text-end">{Tools.formatNumber(item.grossValue)}</td>
                                    <td>
                                        <Form.Control
                                            type="number"
                                            size="sm"
                                            min={0}
                                            max={100}
                                            value={bookingPercentage}
                                            disabled={isBooked || !isSelected}
                                            onChange={(e) =>
                                                handleItemChange(item.id, "bookingPercentage", Number(e.target.value))
                                            }
                                        />
                                    </td>
                                    <td>
                                        <Form.Control
                                            type="number"
                                            size="sm"
                                            min={0}
                                            max={100}
                                            value={vatDeductionPercentage}
                                            disabled={isBooked || !isSelected}
                                            onChange={(e) =>
                                                handleItemChange(item.id, "vatDeductionPercentage", Number(e.target.value))
                                            }
                                        />
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </Table>
            )}
        </div>
    );

    return (
        <Container fluid className="py-3">
            {error && (
                <Alert
                    variant="danger"
                    onClose={() => {
                        setError(null);
                        setValidationDetails([]);
                    }}
                    dismissible
                >
                    <div>{error}</div>
                    {validationDetails.length > 0 && (
                        <ul className="mb-0 mt-2">
                            {validationDetails.map((detail, index) => (
                                <li key={`${index}_${detail}`}>{detail}</li>
                            ))}
                        </ul>
                    )}
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
                                <CostInvoiceStatusBadge status={status} />
                                <InvoiceTypeBadge invoiceType={invoice.invoiceType} />
                            </h4>
                        </Col>
                        <Col xs="auto" className="d-flex align-items-center gap-2">
                            <Form.Label className="mb-0 small text-muted">Status</Form.Label>
                            <Form.Select
                                size="sm"
                                value={status}
                                onChange={(e) => setStatus(e.target.value as CostInvoiceStatus)}
                                disabled={isBooked || saving}
                                aria-label="Status faktury"
                            >
                                <option value={CostInvoiceStatuses.NEW}>Nowa</option>
                                <option value={CostInvoiceStatuses.EXCLUDED}>Poza kosztami</option>
                            </Form.Select>
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

            {/* Ustawienia księgowania */}
            <Card className="mb-3">
                <Card.Header>
                    <h5 className="mb-0">Ustawienia księgowania</h5>
                </Card.Header>
                <Card.Body>
                    <Row>
                        <Col md={3}>
                            <Form.Group className="mb-3">
                                <Form.Label>Kategoria kosztu</Form.Label>
                                <Form.Select
                                    value={categoryId || ""}
                                    onChange={(e) =>
                                        handleCategoryChange(e.target.value ? Number(e.target.value) : null)
                                    }
                                    disabled={isBooked}
                                >
                                    <option value="">-- Wybierz kategorię --</option>
                                    {categories.map((cat) => (
                                        <option key={cat.id} value={cat.id}>
                                            {cat.name} (VAT: {cat.vatDeductionDefault}%)
                                        </option>
                                    ))}
                                </Form.Select>
                            </Form.Group>
                        </Col>
                        <Col md={3}>
                            <Form.Group className="mb-3">
                                <Form.Label>% do księgowania</Form.Label>
                                <Form.Control
                                    type="number"
                                    min={0}
                                    max={100}
                                    value={bookingPercentage}
                                    onChange={(e) => setBookingPercentage(Number(e.target.value))}
                                    disabled={isBooked}
                                />
                                <Form.Text className="text-muted">
                                    Do zaksięgowania: {Tools.formatNumber((invoice.netAmount * bookingPercentage) / 100)} zł
                                </Form.Text>
                            </Form.Group>
                        </Col>
                        <Col md={3}>
                            <Form.Group className="mb-3">
                                <Form.Label>% odliczenia VAT</Form.Label>
                                <Form.Control
                                    type="number"
                                    min={0}
                                    max={100}
                                    value={vatDeductionPercentage}
                                    onChange={(e) => setVatDeductionPercentage(Number(e.target.value))}
                                    disabled={isBooked}
                                />
                                <Form.Text className="text-muted">
                                    VAT do odliczenia: {Tools.formatNumber((invoice.vatAmount * vatDeductionPercentage) / 100)} zł
                                </Form.Text>
                            </Form.Group>
                        </Col>
                    </Row>
                    <Row>
                        <Col md={12}>
                            <Form.Group className="mb-3">
                                <Form.Label>Notatki</Form.Label>
                                <Form.Control
                                    as="textarea"
                                    rows={2}
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                    disabled={isBooked}
                                    placeholder="Dodatkowe informacje..."
                                />
                            </Form.Group>
                        </Col>
                    </Row>

                    <Row className="mt-2">
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
                                ] as const).map(({ value, label }) => (
                                    <Button
                                        key={value}
                                        size="sm"
                                        variant={paymentStatus === value ? "primary" : "outline-secondary"}
                                        disabled={isBooked}
                                        onClick={() => {
                                            setPaymentStatus(value);
                                            if (value === PaymentStatuses.PAID) setPaidAmount(invoice.grossAmount);
                                            if (value === PaymentStatuses.UNPAID) setPaidAmount(0);
                                        }}
                                    >
                                        {label}
                                    </Button>
                                ))}
                            </div>
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
                                            disabled={isBooked}
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

                    {isBooked && invoice.bookedAt && (
                        <Alert variant="info" className="mb-0 mt-3">
                            <strong>Zaksięgowano:</strong> {ToolsDate.dateToDDmmmYYYYHHMM(invoice.bookedAt)}
                            {invoice._bookedByPerson && (
                                <> przez {invoice._bookedByPerson.name} {invoice._bookedByPerson.surname}</>
                            )}
                        </Alert>
                    )}
                </Card.Body>
            </Card>

            {/* Pozycje faktury */}
            <Card className="mb-3">
                <Card.Header>
                    <h5 className="mb-0">Pozycje faktury</h5>
                </Card.Header>
                <Card.Body className="p-0">
                    {renderItemsTable(costItems, "Pozycje kosztowe")}
                    {renderItemsTable(nonCostItems, "Pozycje poza kosztami")}
                </Card.Body>
            </Card>

            {/* Przyciski akcji */}
            {!isBooked && (
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
                    {status !== CostInvoiceStatuses.EXCLUDED && (
                        <Button variant="success" onClick={handleBook} disabled={saving}>
                            {saving ? (
                                <>
                                    <Spinner animation="border" size="sm" className="me-1" />
                                    Księgowanie...
                                </>
                            ) : (
                                "✅ Zaksięguj fakturę"
                            )}
                        </Button>
                    )}
                </div>
            )}
        </Container>
    );
}
