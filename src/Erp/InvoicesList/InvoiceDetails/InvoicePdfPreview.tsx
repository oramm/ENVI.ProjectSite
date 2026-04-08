import React, { useEffect, useMemo, useState } from "react";
import { Alert, Button, Card, Col, Container, Row, Spinner, Table } from "react-bootstrap";
import { Link, useNavigate, useParams } from "react-router-dom";
import MainSetup from "../../../React/MainSetupReact";
import { QRCodeSVG } from "qrcode.react";

type PreviewParty = {
    name: string;
    nip: string;
    line1: string;
    line2: string;
    jst: string;
    gv: string;
};

type PreviewThirdParty = {
    name: string;
    nip: string;
    internalId: string;
    line1: string;
    line2: string;
    role: string;
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
    correctionType: string;
    paymentDeadline: string;
    bankAccount: string;
    bankName: string;
    seller: PreviewParty;
    buyer: PreviewParty;
    thirdParties: PreviewThirdParty[];
    items: PreviewItem[];
};

type KsefPreviewStatus = {
    qrVerificationUrl?: string;
    qrLabel?: string | null;
    ksefNumber?: string | null;
};

function getCorrectionTypeLabel(correctionType: string): string {
    if (correctionType === "1") {
        return "Korekta skutkująca w dacie ujęcia faktury pierwotnej";
    }
    if (correctionType === "2") {
        return "Korekta skutkująca w dacie wystawienia faktury korygującej";
    }
    if (correctionType === "3") {
        return "Korekta skutkująca w dacie innej, w tym gdy dla różnych pozycji faktury korygującej daty te są różne";
    }

    return "(nie ustawiono)";
}

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

function findAllByLocalName(root: Element | Document, localName: string): Element[] {
    const result: Element[] = [];
    const all = root.getElementsByTagName("*");
    for (let i = 0; i < all.length; i++) {
        if (all[i].localName === localName) {
            result.push(all[i]);
        }
    }
    return result;
}

function mapKsefFlagToTakNie(value: string): string {
    if (value === "1") return "TAK";
    if (value === "2") return "NIE";
    return "-";
}

const THIRD_PARTY_ROLE_LABELS: Record<string, string> = {
    "1": "Faktor - w przypadku gdy na fakturze występują dane faktora",
    "2": "Odbiorca - w przypadku gdy na fakturze występują dane jednostek wewnętrznych, oddziałów, wyodrębnionych w ramach nabywcy, które same nie stanowią nabywcy w rozumieniu ustawy",
    "3": "Podmiot pierwotny - w przypadku gdy na fakturze występują dane podmiotu będącego w stosunku do podatnika podmiotem przejętym lub przekształconym, który dokonywał dostawy lub świadczył usługę",
    "4": "Dodatkowy nabywca - w przypadku gdy na fakturze występują dane kolejnych (innych niż wymieniony w części Podmiot2) nabywców",
    "5": "Wystawca faktury - w przypadku gdy na fakturze występują dane podmiotu wystawiającego fakturę w imieniu podatnika",
    "6": "Dokonujący płatności - w przypadku gdy na fakturze występują dane podmiotu regulującego zobowiązanie w miejsce nabywcy",
    "7": "Jednostka samorządu terytorialnego - wystawca",
    "8": "Jednostka samorządu terytorialnego - odbiorca",
    "9": "Członek grupy VAT - wystawca",
    "10": "Członek grupy VAT - odbiorca",
    "11": "Pracownik",
};

function getThirdPartyRoleLabel(role: string): string {
    if (!role) return "";
    return THIRD_PARTY_ROLE_LABELS[role] || `Rola ${role}`;
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
    const podmiot3List = findAllByLocalName(doc, "Podmiot3");
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

    const thirdParties: PreviewThirdParty[] = podmiot3List.map((podmiot3) => {
        const podmiot3Id = findFirstByLocalName(podmiot3, "DaneIdentyfikacyjne");
        const podmiot3Adr = findFirstByLocalName(podmiot3, "Adres");
        return {
            name: getChildText(podmiot3Id, "Nazwa"),
            nip: getChildText(podmiot3Id, "NIP"),
            internalId: getChildText(podmiot3Id, "IDWew"),
            line1: getChildText(podmiot3Adr, "AdresL1"),
            line2: getChildText(podmiot3Adr, "AdresL2"),
            role: getChildText(podmiot3, "Rola"),
        };
    });

    return {
        invoiceNumber: getChildText(fa, "P_2"),
        issueDate: getChildText(fa, "P_1"),
        saleDate: getChildText(fa, "P_6"),
        totalGross: getChildText(fa, "P_15"),
        invoiceType: getChildText(fa, "RodzajFaktury"),
        correctionType: getChildText(fa, "TypKorekty"),
        paymentDeadline: getChildText(terminPlatnosci, "Termin"),
        bankAccount: getChildText(rachunekBankowy, "NrRB"),
        bankName: getChildText(rachunekBankowy, "NazwaBanku"),
        seller: {
            name: getChildText(podmiot1Id, "Nazwa"),
            nip: getChildText(podmiot1Id, "NIP"),
            line1: getChildText(podmiot1Adr, "AdresL1"),
            line2: getChildText(podmiot1Adr, "AdresL2"),
            jst: "",
            gv: "",
        },
        buyer: {
            name: getChildText(podmiot2Id, "Nazwa"),
            nip: getChildText(podmiot2Id, "NIP"),
            line1: getChildText(podmiot2Adr, "AdresL1"),
            line2: getChildText(podmiot2Adr, "AdresL2"),
            jst: mapKsefFlagToTakNie(getChildText(podmiot2, "JST")),
            gv: mapKsefFlagToTakNie(getChildText(podmiot2, "GV")),
        },
        thirdParties,
        items,
    };
}

export default function InvoicePdfPreview() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [xml, setXml] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [ksefPreviewStatus, setKsefPreviewStatus] = useState<KsefPreviewStatus | null>(null);

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
            setKsefPreviewStatus(null);
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

                if (!cancelled) {
                    try {
                        const statusResponse = await fetch(`${MainSetup.serverUrl}invoice/${id}/ksef/status`, {
                            method: "GET",
                            credentials: "include",
                        });

                        if (statusResponse.ok) {
                            const statusData = await statusResponse.json();
                            if (!cancelled && statusData?.qrVerificationUrl) {
                                setKsefPreviewStatus({
                                    qrVerificationUrl: statusData.qrVerificationUrl,
                                    qrLabel: statusData.qrLabel,
                                    ksefNumber: statusData.ksefNumber,
                                });
                            }
                        }
                    } catch {
                        // Preview PDF nadal działa bez QR, jeśli status KSeF chwilowo nie jest dostępny.
                    }
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
    const isCorrectionInvoice = parsed?.invoiceType?.startsWith("KOR") || false;
    const hasKsefQr = Boolean(ksefPreviewStatus?.qrVerificationUrl);
    const ksefInvoiceNumber = ksefPreviewStatus?.ksefNumber || ksefPreviewStatus?.qrLabel || "";

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
                        margin: 0 !important;
                    }
                    body > #root .navbar.sticky-top,
                    body > #root .navbar.mt-auto,
                    body > .good-tip-toast-wrapper,
                    body > .toast-container {
                        display: none !important;
                    }
                    .no-print { display: none !important; }
                    .invoice-preview-page > :not(.invoice-sheet):not(.invoice-qr-print-section) {
                        display: none !important;
                    }
                    body { background: #fff !important; margin: 0 !important; padding: 0 !important; }
                    .invoice-preview-page {
                        width: 100% !important;
                        max-width: none !important;
                        padding: 0 !important;
                        margin: 0 auto !important;
                        box-sizing: border-box !important;
                    }
                    .invoice-sheet {
                        width: 100% !important;
                        max-width: 190mm !important;
                        padding: 10mm !important;
                        margin: 0 auto !important;
                        box-sizing: border-box !important;
                        box-shadow: none !important;
                        border: 1px solid #666 !important;
                    }
                    .invoice-party-row > [class*="col-"] {
                        flex: 0 0 50% !important;
                        max-width: 50% !important;
                    }
                    .invoice-qr-print-section {
                        break-before: page;
                        page-break-before: always;
                        break-inside: avoid;
                        page-break-inside: avoid;
                    }
                    .invoice-qr-preview-section {
                        display: none !important;
                    }
                    .invoice-qr-preview-actions {
                        display: none !important;
                    }
                }
                .invoice-sheet {
                    width: 100%;
                    max-width: 190mm;
                    margin: 0 auto;
                    border: 1px solid #d0d0d0;
                    box-shadow: 0 6px 18px rgba(0,0,0,0.08);
                }
                .invoice-party-row > [class*="col-"] {
                    flex: 0 0 50%;
                    max-width: 50%;
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
                    <div className="text-muted small">Widok generowany z aktualnego XML</div>
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
                            <div className="invoice-ksef-title">FAKTURA (podgląd)</div>
                            <div className="text-muted small">To nie jest dokument, tylko podgląd danych wysyłanych do KSeF</div>
                        </Col>
                        <Col className="text-end">
                            <div className="mb-2">
                                <span className="preview-badge">{parsed.invoiceType || "VAT"}</span>
                            </div>
                            <div><strong>Numer:</strong> <span className="invoice-mono">{parsed.invoiceNumber || "-"}</span></div>
                            <div><strong>Data wystawienia:</strong> {parsed.issueDate || "-"}</div>
                            <div><strong>Data sprzedaży:</strong> {parsed.saleDate || "-"}</div>
                            {ksefInvoiceNumber && (
                                <div><strong>Numer KSeF:</strong> <span className="invoice-mono">{ksefInvoiceNumber}</span></div>
                            )}
                            {isCorrectionInvoice && parsed.correctionType && (
                                <div>
                                    <strong>Typ korekty:</strong> {getCorrectionTypeLabel(parsed.correctionType)}
                                </div>
                            )}
                        </Col>
                    </Row>

                    <Row className="mb-3 invoice-party-row">
                        <Col xs={6}>
                            <Card>
                                <Card.Header className="py-2"><strong>Sprzedawca</strong></Card.Header>
                                <Card.Body className="py-2">
                                    <div><strong>{parsed.seller.name || "-"}</strong></div>
                                    <div>NIP: <span className="invoice-mono">{parsed.seller.nip || "-"}</span></div>
                                    <div>{parsed.seller.line1 || "-"}</div>
                                    <div>{parsed.seller.line2 || ""}</div>
                                </Card.Body>
                            </Card>
                        </Col>
                        <Col xs={6}>
                            <Card>
                                <Card.Header className="py-2"><strong>Nabywca</strong></Card.Header>
                                <Card.Body className="py-2">
                                    <div><strong>{parsed.buyer.name || "-"}</strong></div>
                                    <div>NIP: <span className="invoice-mono">{parsed.buyer.nip || "-"}</span></div>
                                    <div>{parsed.buyer.line1 || "-"}</div>
                                    <div>{parsed.buyer.line2 || ""}</div>
                                    <div className="mt-2 small">
                                        <div>Faktura dotyczy jednostki podrzędnej JST: {parsed.buyer.jst}</div>
                                        <div>Faktura dotyczy członka grupy GV: {parsed.buyer.gv}</div>
                                    </div>
                                </Card.Body>
                            </Card>
                        </Col>
                    </Row>

                    {parsed.thirdParties.length > 0 && (
                        <Row className="mb-3">
                            <Col>
                                <Card>
                                    <Card.Header className="py-2"><strong>Podmioty trzecie</strong></Card.Header>
                                    <Card.Body className="py-2">
                                        {parsed.thirdParties.map((thirdParty, index) => (
                                            <div key={`third-party-${index}`} className={index > 0 ? "mt-3 pt-3 border-top" : ""}>
                                                <div><strong>Podmiot {index + 1}</strong>{thirdParty.role ? ` (Rola: ${getThirdPartyRoleLabel(thirdParty.role)})` : ""}</div>
                                                <div><strong>{thirdParty.name || "-"}</strong></div>
                                                <div>
                                                    {thirdParty.nip
                                                        ? <>NIP: <span className="invoice-mono">{thirdParty.nip}</span></>
                                                        : <>ID wew.: <span className="invoice-mono">{thirdParty.internalId || "-"}</span></>}
                                                </div>
                                                {thirdParty.line1 && <div>{thirdParty.line1}</div>}
                                                {thirdParty.line2 && <div>{thirdParty.line2}</div>}
                                            </div>
                                        ))}
                                    </Card.Body>
                                </Card>
                            </Col>
                        </Row>
                    )}

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

                    {hasKsefQr && (
                        <Row className="mt-4 justify-content-center">
                            <Col md={8} lg={6} className="text-center invoice-qr-preview-section">
                                <Card className="shadow-sm">
                                    <Card.Body className="text-center py-4">
                                        <div className="fw-bold mb-2">Sprawdź, czy Twoja faktura znajduje się w KSeF!</div>
                                        <div className="d-inline-flex p-3 bg-white border rounded-3">
                                            <QRCodeSVG
                                                value={ksefPreviewStatus?.qrVerificationUrl || ""}
                                                size={180}
                                                level="M"
                                                includeMargin
                                            />
                                        </div>
                                        {ksefInvoiceNumber && (
                                            <div className="mt-2 small text-break">
                                                <strong>Numer KSeF:</strong> <span className="invoice-mono">{ksefInvoiceNumber}</span>
                                            </div>
                                        )}
                                        <div className="mt-3 d-flex gap-2 justify-content-center flex-wrap invoice-qr-preview-actions">
                                            <Button
                                                as="a"
                                                href={ksefPreviewStatus?.qrVerificationUrl || ""}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                size="sm"
                                                variant="outline-primary"
                                            >
                                                Otwórz link
                                            </Button>
                                        </div>
                                        <div className="d-none d-print-block mt-3 small text-break">
                                            <strong>Link weryfikacyjny:</strong>{" "}
                                            <span className="invoice-mono">{ksefPreviewStatus?.qrVerificationUrl}</span>
                                        </div>
                                    </Card.Body>
                                </Card>
                            </Col>
                        </Row>
                    )}
                </Card.Body>
            </Card>

            {hasKsefQr && (
                <div className="invoice-qr-print-section d-none d-print-block mt-4">
                    <Card className="shadow-sm" style={{ maxWidth: 520, margin: '0 auto' }}>
                        <Card.Body className="text-center py-4">
                            <div className="fw-bold mb-2">Sprawdź, czy Twoja faktura znajduje się w KSeF!</div>
                            <div className="d-inline-flex p-3 bg-white border rounded-3">
                                <QRCodeSVG
                                    value={ksefPreviewStatus?.qrVerificationUrl || ""}
                                    size={180}
                                    level="M"
                                    includeMargin
                                />
                            </div>
                            {ksefInvoiceNumber && (
                                <div className="mt-2 small text-break">
                                    <strong>Numer KSeF:</strong> <span className="invoice-mono">{ksefInvoiceNumber}</span>
                                </div>
                            )}
                            <div className="mt-3 small text-break">
                                <strong>Link weryfikacyjny:</strong>{" "}
                                <span className="invoice-mono">{ksefPreviewStatus?.qrVerificationUrl}</span>
                            </div>
                        </Card.Body>
                    </Card>
                </div>
            )}
        </Container>
    );
}
