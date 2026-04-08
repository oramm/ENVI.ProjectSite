import React, { useState, useEffect } from "react";
import { Modal, Button, Form, Alert, Spinner, Table } from "react-bootstrap";
import { Invoice, InvoiceItem } from "../../../../Typings/bussinesTypes";
import MainSetup from "../../../React/MainSetupReact";
import Tools from "../../../React/Tools/Tools";
import { invoiceItemsRepository } from "../InvoicesController";

interface CorrectionModalProps {
    show: boolean;
    onHide: () => void;
    invoice: Invoice;
    onCorrectionCreated: (correctionInvoice: Invoice) => void;
}

interface CustomItem {
    description: string;
    quantity: string | number;
    unitPrice: string | number;
    vatTax: number;
}

type CorrectionType = "zero" | "custom";

const KSEF_CORRECTION_TYPES = {
    1: "Korekta skutkująca w dacie ujęcia faktury pierwotnej",
    2: "Korekta skutkująca w dacie wystawienia faktury korygującej",
    3: "Korekta skutkująca w dacie innej, w tym gdy dla różnych pozycji faktury korygującej daty te są różne",
} as const;

export default function CorrectionModal({
    show,
    onHide,
    invoice,
    onCorrectionCreated,
}: CorrectionModalProps) {
    const [correctionType, setCorrectionType] = useState<CorrectionType>("zero");
    const [correctionReason, setCorrectionReason] = useState("");
    const [issueDate, setIssueDate] = useState(invoice.issueDate || new Date().toISOString().slice(0, 10));
    const [sentDate, setSentDate] = useState(new Date().toISOString().slice(0, 10));
    const [ksefCorrectionType, setKsefCorrectionType] = useState<1 | 2 | 3 | null>(null);
    const [customItems, setCustomItems] = useState<CustomItem[]>([
        { description: "", quantity: "1", unitPrice: "0", vatTax: 23 },
    ]);
    const [originalItems, setOriginalItems] = useState<InvoiceItem[]>([]);
    const [loadingItems, setLoadingItems] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [step, setStep] = useState<"create" | "created">("create");
    const [createdCorrection, setCreatedCorrection] = useState<Invoice | null>(null);

    const resetForm = () => {
        setCorrectionType("zero");
        setCorrectionReason("");
        setIssueDate(invoice.issueDate || new Date().toISOString().slice(0, 10));
        setSentDate(new Date().toISOString().slice(0, 10));
        setKsefCorrectionType(null);
        setCustomItems([{ description: "", quantity: 1, unitPrice: 0, vatTax: 23 }]);
        setOriginalItems([]);
        setError(null);
        setStep("create");
        setCreatedCorrection(null);
    };

    // Pobierz pozycje oryginalnej faktury przy otwarciu modala lub zmianie typu korekty
    useEffect(() => {
        if (show && correctionType === "custom" && originalItems.length === 0) {
            loadOriginalItems();
        }
    }, [show, correctionType]);

    useEffect(() => {
        if (show) {
            setIssueDate(invoice.issueDate || new Date().toISOString().slice(0, 10));
            setSentDate(new Date().toISOString().slice(0, 10));
        }
    }, [show, invoice.id, invoice.issueDate]);

    const loadOriginalItems = async () => {
        setLoadingItems(true);
        try {
            const items = await invoiceItemsRepository.loadItemsFromServerPOST(
                [{ invoiceId: invoice.id }],
                undefined,
                { skipCache: true }
            );
            setOriginalItems(items || []);
            
            // Wypełnij customItems danymi z oryginalnej faktury (z ujemnymi wartościami dla pełnej korekty)
            if (items && items.length > 0) {
                setCustomItems(items.map((item: InvoiceItem) => ({
                    description: item.description,
                    quantity: -item.quantity, // Ujemna ilość = anulowanie pozycji
                    unitPrice: item.unitPrice,
                    vatTax: item.vatTax,
                })));
            }
        } catch (err) {
            console.error("Błąd pobierania pozycji faktury:", err);
        } finally {
            setLoadingItems(false);
        }
    };

    const handleClose = () => {
        resetForm();
        onHide();
    };

    const addCustomItem = () => {
        setCustomItems([...customItems, { description: "", quantity: "1", unitPrice: "0", vatTax: 23 }]);
    };

    const removeCustomItem = (index: number) => {
        setCustomItems(customItems.filter((_, i) => i !== index));
    };

    const updateCustomItem = (index: number, field: keyof CustomItem, value: string | number) => {
        const updated = [...customItems];
        if (field === "description") {
            updated[index][field] = value as string;
        } else {
            // keep raw string while user types (allows entering '-' or partial decimals)
            updated[index][field] = value as any;
        }
        setCustomItems(updated);
    };

    // Krok 1: Utwórz korektę w systemie
    const handleCreateCorrection = async () => {
        if (!correctionReason.trim()) {
            setError("Przyczyna korekty jest wymagana");
            return;
        }

        if (correctionType === "custom" && customItems.length === 0) {
            setError("Dodaj co najmniej jedną pozycję korekty");
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const currentPerson = MainSetup.getCurrentUserAsPerson();
            
            // Debug logging
            console.log("📋 CorrectionModal - Creating correction:", {
                correctionType,
                correctionTypeType: typeof correctionType,
                correctionReason,
                issueDate,
                sentDate,
                ownerId: currentPerson?.id,
            });
            
            const formData = new FormData();
            formData.append("correctionType", correctionType);
            formData.append("correctionReason", correctionReason.trim());
            formData.append("issueDate", issueDate);
            formData.append("sentDate", sentDate);
            if (currentPerson?.id) formData.append("ownerId", String(currentPerson.id));

            if (correctionType === "custom") {
                const filtered = customItems.filter((item) => item.description.trim());
                const converted = filtered.map((item) => {
                    const quantity = Number(item.quantity);
                    const unitPrice = Number(item.unitPrice);
                    const vatTax = Number(item.vatTax);
                    if (!isFinite(quantity) || !isFinite(unitPrice) || !isFinite(vatTax)) {
                        throw new Error("Nieprawidłowe wartości w pozycjach korekty");
                    }
                    return {
                        description: item.description.trim(),
                        quantity,
                        unitPrice,
                        vatTax,
                    };
                });
                formData.append("customItems", JSON.stringify(converted));
            }

            const response = await fetch(`${MainSetup.serverUrl}invoice/${invoice.id}/correction`, {
                method: "POST",
                credentials: "include",
                body: formData,
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || errorData.message || "Błąd tworzenia korekty");
            }

            const result = await response.json();
            console.log("Correction create response:", result);
            if (!result || !result.correctionInvoice || !result.correctionInvoice.id) {
                setError("Otrzymano niepełną odpowiedź z serwera: brak id utworzonej korekty");
                setLoading(false);
                return;
            }
            setCreatedCorrection(result.correctionInvoice);
            setStep("created");
        } catch (err) {
            setError(err instanceof Error ? err.message : "Błąd tworzenia korekty");
        } finally {
            setLoading(false);
        }
    };

    const handleGoToDetails = async () => {
        if (!createdCorrection) return;

        if (!createdCorrection.id) {
            setError("Brak ID korekty - nie można przejść do szczegółów.");
            return;
        }

        if (ksefCorrectionType === null) {
            onCorrectionCreated(createdCorrection);
            handleClose();
            return;
        }

        try {
            setLoading(true);
            const saveResponse = await fetch(`${MainSetup.serverUrl}invoice/${createdCorrection.id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: "include",
                body: JSON.stringify({
                    ...createdCorrection,
                    ksefCorrectionType,
                    _fieldsToUpdate: ["ksefCorrectionType"],
                }),
            });

            if (!saveResponse.ok) {
                const errorData = await saveResponse.json().catch(() => ({}));
                throw new Error(
                    errorData.error
                        || errorData.errorMessage
                        || errorData.message
                        || "Nie udało się zapisać typu korekty",
                );
            }

            const updatedCorrection = await saveResponse.json();
            onCorrectionCreated({
                ...createdCorrection,
                ...updatedCorrection,
                ksefCorrectionType,
            });
            handleClose();
        } catch (err) {
            setError(err instanceof Error ? err.message : "Nie udało się zapisać typu korekty");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal show={show} onHide={handleClose} size="lg">
            <Modal.Header closeButton>
                <Modal.Title>
                    {step === "create" ? "Utwórz fakturę korygującą" : "Wyślij korektę do KSeF"}
                </Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {error && (
                    <Alert variant="danger" onClose={() => setError(null)} dismissible>
                        {error}
                    </Alert>
                )}

                {step === "create" && (
                    <>
                        {/* Info o fakturze źródłowej */}
                        <Alert variant="info">
                            <strong>Faktura źródłowa:</strong> {invoice.number || `#${invoice.id}`}
                            <br />
                            <strong>Wartość netto:</strong>{" "}
                            {invoice._totalNetValue ? Tools.formatNumber(invoice._totalNetValue) + " zł" : "-"}
                            {invoice.ksefNumber && (
                                <>
                                    <br />
                                    <strong>Nr KSeF:</strong> <code>{invoice.ksefNumber}</code>
                                </>
                            )}
                        </Alert>

                        {/* Typ korekty */}
                        <Form.Group className="mb-3">
                            <Form.Label>
                                <strong>Typ korekty</strong>
                            </Form.Label>
                            <div>
                                <Form.Check
                                    type="radio"
                                    id="correction-zero"
                                    name="correctionType"
                                    value="zero"
                                    label="Wyzeruj całą fakturę (anulowanie)"
                                    checked={correctionType === "zero"}
                                    onChange={(e) => {
                                        console.log("Radio zero changed:", e.target.value);
                                        setCorrectionType("zero");
                                    }}
                                />
                                <Form.Check
                                    type="radio"
                                    id="correction-custom"
                                    name="correctionType"
                                    value="custom"
                                    label="Podaj własne pozycje korekty"
                                    checked={correctionType === "custom"}
                                    onChange={(e) => {
                                        console.log("Radio custom changed:", e.target.value);
                                        setCorrectionType("custom");
                                    }}
                                />
                            </div>
                        </Form.Group>

                        {/* Przyczyna korekty */}
                        <Form.Group className="mb-3">
                            <Form.Label>
                                <strong>Przyczyna korekty</strong> <span className="text-danger">*</span>
                            </Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={2}
                                value={correctionReason}
                                onChange={(e) => setCorrectionReason(e.target.value)}
                                placeholder="Np. Błąd w cenie, Zwrot towaru, Rabat..."
                                required
                            />
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>
                                <strong>Data sprzedaży</strong>
                            </Form.Label>
                            <Form.Control
                                type="date"
                                value={issueDate}
                                onChange={(e) => setIssueDate(e.target.value)}
                                required
                            />
                            <Form.Text className="text-muted">
                                Domyślnie ustawiona data sprzedaży z faktury źródłowej.
                            </Form.Text>
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>
                                <strong>Data wysłania korekty</strong>
                            </Form.Label>
                            <Form.Control
                                type="date"
                                value={sentDate}
                                onChange={(e) => setSentDate(e.target.value)}
                                required
                            />
                        </Form.Group>

                        {/* Pozycje korekty - tylko dla custom */}
                        {correctionType === "custom" && (
                            <Form.Group className="mb-3">
                                <Form.Label>
                                    <strong>Pozycje korekty</strong>
                                </Form.Label>
                                
                                {loadingItems ? (
                                    <div className="text-center py-3">
                                        <Spinner animation="border" size="sm" /> Ładowanie pozycji...
                                    </div>
                                ) : (
                                    <>
                                        <Alert variant="secondary" className="mb-3">
                                            <strong>📋 Jak działa korekta pozycji:</strong>
                                            <ul className="mb-0 mt-2">
                                                <li><strong>Ujemna ilość</strong> = anulowanie pozycji (całkowite lub częściowe)</li>
                                                <li><strong>Dodatnia ilość</strong> = dodanie nowej pozycji do faktury</li>
                                                <li><strong>Zmiana ceny</strong> = pozostaw ilość ujemną i wpisz nową cenę jednostkową</li>
                                            </ul>
                                            <hr className="my-2" />
                                            <small>
                                                <strong>Przykład:</strong> Jeśli oryginalna faktura miała pozycję "Usługa" x 2 szt. po 100 zł,
                                                a chcesz zmienić cenę na 80 zł, wpisz dwie pozycje:
                                                <br />1. "Usługa" ilość: <code>-2</code>, cena: <code>100</code> (anulowanie starej)
                                                <br />2. "Usługa" ilość: <code>2</code>, cena: <code>80</code> (nowa wartość)
                                                <br />
                                                <br />
                                                <strong>Uwaga dotycząca częściowych zmian:</strong>
                                                <br />Jeżeli faktura ma kilka pozycji, a chcesz zmienić tylko jedną z nich, nie musisz dodawać pozostałych pozycji do korekty.
                                                Korekta powinna zawierać jedynie różnice: anulowanie starej pozycji (ujemna ilość) i ewentualne dodanie nowej pozycji (dodatnia ilość)
                                                z nową ceną. Pozostałe pozycje nie powinny się znaleźć w korekcie.
                                            </small>
                                        </Alert>

                                        {originalItems.length > 0 && (
                                            <Alert variant="info" className="mb-2">
                                                <small>
                                                    <strong>ℹ️ Poniżej wczytano pozycje z oryginalnej faktury z ujemnymi ilościami.</strong>
                                                    <br />Zmodyfikuj je według potrzeb lub dodaj nowe pozycje.
                                                </small>
                                            </Alert>
                                        )}

                                        <Table size="sm" bordered>
                                    <thead>
                                        <tr>
                                            <th>Opis</th>
                                            <th style={{ width: "80px" }}>Ilość</th>
                                            <th style={{ width: "120px" }}>Cena netto</th>
                                            <th style={{ width: "80px" }}>VAT %</th>
                                            <th style={{ width: "50px" }}></th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {customItems.map((item, index) => (
                                            <tr key={index}>
                                                <td>
                                                    <Form.Control
                                                        size="sm"
                                                        type="text"
                                                        value={item.description}
                                                        onChange={(e) =>
                                                            updateCustomItem(index, "description", e.target.value)
                                                        }
                                                        placeholder="Opis pozycji"
                                                    />
                                                </td>
                                                <td>
                                                    <Form.Control
                                                        size="sm"
                                                        type="number"
                                                        value={item.quantity}
                                                        onChange={(e) =>
                                                            updateCustomItem(index, "quantity", e.target.value)
                                                        }
                                                    />
                                                </td>
                                                <td>
                                                    <Form.Control
                                                        size="sm"
                                                        type="number"
                                                        step="0.01"
                                                        value={item.unitPrice}
                                                        onChange={(e) =>
                                                            updateCustomItem(index, "unitPrice", e.target.value)
                                                        }
                                                    />
                                                </td>
                                                <td>
                                                    <Form.Select
                                                        size="sm"
                                                        value={item.vatTax}
                                                        onChange={(e) =>
                                                            updateCustomItem(index, "vatTax", e.target.value)
                                                        }
                                                    >
                                                        <option value={23}>23%</option>
                                                        <option value={8}>8%</option>
                                                        <option value={5}>5%</option>
                                                        <option value={0}>0%</option>
                                                    </Form.Select>
                                                </td>
                                                <td>
                                                    <Button
                                                        variant="outline-danger"
                                                        size="sm"
                                                        onClick={() => removeCustomItem(index)}
                                                        disabled={customItems.length === 1}
                                                    >
                                                        ×
                                                    </Button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </Table>
                                <Button variant="outline-secondary" size="sm" onClick={addCustomItem}>
                                    + Dodaj pozycję
                                </Button>
                                    </>
                                )}
                            </Form.Group>
                        )}

                    </>
                )}

                {step === "created" && createdCorrection && (
                    <>
                        <Alert variant="success">
                            ✅ Korekta została utworzona: <strong>{createdCorrection.number || `#${createdCorrection.id}`}</strong>
                        </Alert>

                        <Form.Group className="mb-3">
                            <Form.Label>
                                <strong>Typ korekty KSeF</strong>
                            </Form.Label>
                            <Form.Select
                                value={ksefCorrectionType ?? ""}
                                onChange={(e) => {
                                    const rawValue = e.target.value;
                                    setKsefCorrectionType(rawValue ? (Number(rawValue) as 1 | 2 | 3) : null);
                                }}
                            >
                                <option value="">Wybierz</option>
                                {Object.entries(KSEF_CORRECTION_TYPES).map(([value, label]) => (
                                    <option key={value} value={value}>
                                        {label}
                                    </option>
                                ))}
                            </Form.Select>
                        </Form.Group>

                        <p>
                            Korekta jest gotowa. Możesz przejść do jej szczegółów i stamtąd wykonać dalsze akcje, w tym wysyłkę do KSeF.
                        </p>
                    </>
                )}
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={handleClose} disabled={loading}>
                    Anuluj
                </Button>

                {step === "create" && (
                    <Button variant="primary" onClick={handleCreateCorrection} disabled={loading}>
                        {loading ? (
                            <>
                                <Spinner animation="border" size="sm" className="me-2" />
                                Tworzenie...
                            </>
                        ) : (
                            "Utwórz korektę"
                        )}
                    </Button>
                )}

                {step === "created" && (
                    <Button variant="primary" onClick={handleGoToDetails}>
                        Przejdź do szczegółów korekty
                    </Button>
                )}
            </Modal.Footer>
        </Modal>
    );
}
