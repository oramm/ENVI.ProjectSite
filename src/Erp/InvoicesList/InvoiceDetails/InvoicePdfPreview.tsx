import React, { useEffect, useMemo, useState } from "react";
import { Alert, Button, Card, Col, Container, Row, Spinner, Table } from "react-bootstrap";
import { Link, useNavigate, useParams } from "react-router-dom";
import MainSetup from "../../../React/MainSetupReact";

type PreviewParty = {
    name: string;
    nip: string;
    line1: string;
    line2: string;
};

type PreviewItem = {
    lineNo: string;
    name: string;
    quantity: string;
    unit: string;
    unitPrice: string;
    netValue: string;
    vatRate: string;
};

type PreviewDocument = {
    invoiceNumber: string;
    issueDate: string;
    saleDate: string;
    totalGross: string;
    invoiceType: string;
    paymentDeadline: string;
    bankAccount: string;
    bankName: string;
    seller: PreviewParty;
    buyer: PreviewParty;
    items: PreviewItem[];
};

function findFirstByLocalName(root: Element | Document, localName: string): Element | null {
    const all = root.getElementsByTagName("*");
    for (let i = 0; i < all.length; i++) {
        if (all[i].localName === localName) {
            return all[i];
        }
    }
    return null;
}

function findChildrenByLocalName(parent: Element, localName: string): Element[] {
    const result: Element[] = [];
    for (let i = 0; i < parent.children.length; i++) {
        const child = parent.children[i];
        if (child.localName === localName) {
            result.push(child);
        }
    }
    return result;
}

function getChildText(parent: Element | null, localName: string): string {
    if (!parent) return "";
    const child = findChildrenByLocalName(parent, localName)[0];
    return (child?.textContent || "").trim();
}

function parsePreviewXml(xml: string): PreviewDocument {
    const parser = new DOMParser();
    const doc = parser.parseFromString(xml, "application/xml");

    const parserError = doc.getElementsByTagName("parsererror")[0];
    if (parserError) {
        throw new Error("Nie udało się sparsować XML podglądu faktury");
    }

    const podmiot1 = findFirstByLocalName(doc, "Podmiot1");
    const podmiot2 = findFirstByLocalName(doc, "Podmiot2");
    const fa = findFirstByLocalName(doc, "Fa");
    const platnosc = findFirstByLocalName(doc, "Platnosc");

    const podmiot1Id = podmiot1 ? findFirstByLocalName(podmiot1, "DaneIdentyfikacyjne") : null;
    const podmiot1Adr = podmiot1 ? findFirstByLocalName(podmiot1, "Adres") : null;

    const podmiot2Id = podmiot2 ? findFirstByLocalName(podmiot2, "DaneIdentyfikacyjne") : null;
    const podmiot2Adr = podmiot2 ? findFirstByLocalName(podmiot2, "Adres") : null;
    const rachunekBankowy = platnosc ? findFirstByLocalName(platnosc, "RachunekBankowy") : null;
    const terminPlatnosci = platnosc ? findFirstByLocalName(platnosc, "TerminPlatnosci") : null;

    const items: PreviewItem[] = [];
    if (fa) {
        const faLines = fa.getElementsByTagName("*");
        for (let i = 0; i < faLines.length; i++) {
            if (faLines[i].localName !== "FaWiersz") continue;
            const row = faLines[i];
            items.push({
                lineNo: getChildText(row, "NrWierszaFa"),
                name: getChildText(row, "P_7"),
                unit: getChildText(row, "P_8A"),
                quantity: getChildText(row, "P_8B"),
                unitPrice: getChildText(row, "P_9A"),
                netValue: getChildText(row, "P_11"),
                vatRate: getChildText(row, "P_12"),
            });
        }
    }

    return {
        invoiceNumber: getChildText(fa, "P_2"),
        issueDate: getChildText(fa, "P_1"),
        saleDate: getChildText(fa, "P_6"),
        totalGross: getChildText(fa, "P_15"),
        invoiceType: getChildText(fa, "RodzajFaktury"),
        paymentDeadline: getChildText(terminPlatnosci, "Termin"),
        bankAccount: getChildText(rachunekBankowy, "NrRB"),
        bankName: getChildText(rachunekBankowy, "NazwaBanku"),
        seller: {
            name: getChildText(podmiot1Id, "Nazwa"),
            nip: getChildText(podmiot1Id, "NIP"),
            line1: getChildText(podmiot1Adr, "AdresL1"),
            line2: getChildText(podmiot1Adr, "AdresL2"),
        },
        buyer: {
            name: getChildText(podmiot2Id, "Nazwa"),
            nip: getChildText(podmiot2Id, "NIP"),
            line1: getChildText(podmiot2Adr, "AdresL1"),
            line2: getChildText(podmiot2Adr, "AdresL2"),
        },
        items,
    };
}

export default function InvoicePdfPreview() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [xml, setXml] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        let cancelled = false;

        async function loadPreview() {
            if (!id) {
                setError("Brak id faktury w adresie.");
                setLoading(false);
                return;
            }

            setLoading(true);
            setError("");
            try {
                const response = await fetch(`${MainSetup.serverUrl}invoice/${id}/ksef/xml-preview`, {
                    method: "GET",
                    credentials: "include",
                });

                if (!response.ok) {
                    const payload = await response.json().catch(() => ({}));
                    throw new Error(payload.error || payload.errorMessage || `Błąd serwera (${response.status})`);
                }

                const text = await response.text();
                if (!cancelled) {
                    setXml(text);
                }
            } catch (err) {
                if (!cancelled) {
                    setError(err instanceof Error ? err.message : "Nie udało się pobrać podglądu faktury");
                }
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        }

        loadPreview();
        return () => {
            cancelled = true;
        };
    }, [id]);

    const parsedResult = useMemo(() => {
        if (!xml) return { data: null as PreviewDocument | null, parseError: "" };
        try {
            return { data: parsePreviewXml(xml), parseError: "" };
        } catch (err) {
            return {
                data: null as PreviewDocument | null,
                parseError: err instanceof Error ? err.message : "Błąd parsowania XML",
            };
        }
    }, [xml]);

    const parsed = parsedResult.data;

    if (loading) {
        return (
            <Container className="py-4">
                <Spinner animation="border" size="sm" className="me-2" />
                Generowanie podglądu PDF...
            </Container>
        );
    }

    if (error || parsedResult.parseError) {
        return (
            <Container className="py-4">
                <Alert variant="danger">{error || parsedResult.parseError}</Alert>
                <Link to={`/invoice/${id}`}>Wróć do faktury</Link>
            </Container>
        );
    }

    if (!parsed) {
        return (
            <Container className="py-4">
                <Alert variant="warning">Brak danych podglądu.</Alert>
            </Container>
        );
    }

    return (
        <Container className="py-3 invoice-preview-page">
            <style>{`
                @media print {
                    @page {
                        size: A4;
                        margin: 10mm;
                    }
                    .no-print { display: none !important; }
                    body { background: #fff !important; }
                    .invoice-preview-page { padding: 0 !important; }
                    .invoice-sheet {
                        width: 190mm !important;
                        max-width: 190mm !important;
                        margin: 0 auto !important;
                        box-shadow: none !important;
                        border: 1px solid #666 !important;
                        break-inside: avoid;
                        page-break-inside: avoid;
                    }
                }
                .invoice-sheet {
                    max-width: 190mm;
                    margin: 0 auto;
                    border: 1px solid #d0d0d0;
                    box-shadow: 0 6px 18px rgba(0,0,0,0.08);
                }
                .invoice-ksef-title {
                    letter-spacing: 0.04em;
                    font-weight: 700;
                }
                .preview-badge {
                    display: inline-block;
                    padding: 0.2rem 0.5rem;
                    border: 1px solid #999;
                    border-radius: 999px;
                    font-size: 0.75rem;
                }
                .invoice-mono {
                    font-family: Consolas, "Courier New", monospace;
                }
            `}</style>

            <div className="d-flex justify-content-between align-items-center mb-3 no-print">
                <div>
                    <h5 className="mb-1">Podgląd faktury do PDF</h5>
                    <div className="text-muted small">Widok generowany z aktualnego XML KSeF</div>
                </div>
                <div className="d-flex gap-2">
                    <Button variant="outline-secondary" onClick={() => navigate(`/invoice/${id}`)}>
                        Wróć
                    </Button>
                    <Button variant="primary" onClick={() => window.print()}>
                        Drukuj / Zapisz PDF
                    </Button>
                </div>
            </div>

            <Card className="invoice-sheet">
                <Card.Body>
                    <Row className="mb-3">
                        <Col>
                            <div className="invoice-ksef-title">FAKTURA (podgląd KSeF)</div>
                            <div className="text-muted small">Układ zbliżony do oryginału KSeF</div>
                        </Col>
                        <Col className="text-end">
                            <div className="mb-2">
                                <span className="preview-badge">{parsed.invoiceType || "VAT"}</span>
                            </div>
                            <div><strong>Numer:</strong> <span className="invoice-mono">{parsed.invoiceNumber || "-"}</span></div>
                            <div><strong>Data wystawienia:</strong> {parsed.issueDate || "-"}</div>
                            <div><strong>Data sprzedaży:</strong> {parsed.saleDate || "-"}</div>
                        </Col>
                    </Row>

                    <Row className="mb-3">
                        <Col md={6}>
                            <Card>
                                <Card.Header className="py-2"><strong>Sprzedawca (Podmiot1)</strong></Card.Header>
                                <Card.Body className="py-2">
                                    <div><strong>{parsed.seller.name || "-"}</strong></div>
                                    <div>NIP: <span className="invoice-mono">{parsed.seller.nip || "-"}</span></div>
                                    <div>{parsed.seller.line1 || "-"}</div>
                                    <div>{parsed.seller.line2 || ""}</div>
                                </Card.Body>
                            </Card>
                        </Col>
                        <Col md={6}>
                            <Card>
                                <Card.Header className="py-2"><strong>Nabywca (Podmiot2)</strong></Card.Header>
                                <Card.Body className="py-2">
                                    <div><strong>{parsed.buyer.name || "-"}</strong></div>
                                    <div>NIP: <span className="invoice-mono">{parsed.buyer.nip || "-"}</span></div>
                                    <div>{parsed.buyer.line1 || "-"}</div>
                                    <div>{parsed.buyer.line2 || ""}</div>
                                </Card.Body>
                            </Card>
                        </Col>
                    </Row>

                    <div className="mb-2"><strong>Pozycje faktury</strong></div>
                    <Table bordered size="sm" responsive>
                        <thead>
                            <tr>
                                <th>Lp.</th>
                                <th>Nazwa</th>
                                <th>Il.</th>
                                <th>JM</th>
                                <th>Cena netto</th>
                                <th>Wartość netto</th>
                                <th>VAT</th>
                            </tr>
                        </thead>
                        <tbody>
                            {parsed.items.map((item, idx) => (
                                <tr key={`preview-item-${idx}`}>
                                    <td>{item.lineNo || idx + 1}</td>
                                    <td>{item.name}</td>
                                    <td className="text-end invoice-mono">{item.quantity}</td>
                                    <td>{item.unit}</td>
                                    <td className="text-end invoice-mono">{item.unitPrice}</td>
                                    <td className="text-end invoice-mono">{item.netValue}</td>
                                    <td className="text-end invoice-mono">{item.vatRate}</td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>

                    <Row>
                        <Col md={{ span: 4, offset: 8 }}>
                            <Card>
                                <Card.Body className="py-2">
                                    <div className="d-flex justify-content-between">
                                        <strong>Razem brutto</strong>
                                        <strong className="invoice-mono">{parsed.totalGross || "0.00"} PLN</strong>
                                    </div>
                                </Card.Body>
                            </Card>
                        </Col>
                    </Row>

                    <Row className="mt-3">
                        <Col md={12}>
                            <Card>
                                <Card.Header className="py-2"><strong>Płatność</strong></Card.Header>
                                <Card.Body className="py-2">
                                    <Row>
                                        <Col md={4}>
                                            <div><strong>Termin płatności:</strong></div>
                                            <div>{parsed.paymentDeadline || <span className="text-muted">(puste)</span>}</div>
                                        </Col>
                                        <Col md={4}>
                                            <div><strong>Numer konta:</strong></div>
                                            <div className="invoice-mono">{parsed.bankAccount || <span className="text-muted">(puste)</span>}</div>
                                        </Col>
                                        <Col md={4}>
                                            <div><strong>Bank:</strong></div>
                                            <div>{parsed.bankName || <span className="text-muted">(puste)</span>}</div>
                                        </Col>
                                    </Row>
                                </Card.Body>
                            </Card>
                        </Col>
                    </Row>
                </Card.Body>
            </Card>
        </Container>
    );
}
