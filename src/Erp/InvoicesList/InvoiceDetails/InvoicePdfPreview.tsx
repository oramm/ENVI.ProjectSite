import React, { useEffect, useMemo, useState } from "react";
import { Alert, Button, Container, Spinner } from "react-bootstrap";
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

type VatSummaryRow = {
    rateLabel: string;
    net: number;
    vat: number;
    gross: number;
};

type PreviewDocument = {
    invoiceNumber: string;
    issueDate: string;
    saleDate: string;
    totalGross: string;
    invoiceType: string;
    correctionType: string;
    correctionReason: string;
    correctedIssueDate: string;
    correctedNumber: string;
    correctedKsefNumber: string;
    paymentDeadline: string;
    bankAccount: string;
    bankName: string;
    seller: PreviewParty;
    buyer: PreviewParty;
    thirdParties: PreviewThirdParty[];
    items: PreviewItem[];
    vatSummary: VatSummaryRow[];
    vatSummaryTotals: { net: number; vat: number; gross: number };
};

// Mapowanie pól podsumowania VAT ze schematu FA(3): pole netto (P_13_x),
// odpowiadające mu pole VAT (P_14_x, jeśli istnieje) oraz etykieta stawki/typu.
const VAT_SUMMARY_FIELDS: { netField: string; vatField?: string; label: string }[] = [
    { netField: "P_13_1", vatField: "P_14_1", label: "23% lub 22%" },
    { netField: "P_13_2", vatField: "P_14_2", label: "8% lub 7%" },
    { netField: "P_13_3", vatField: "P_14_3", label: "5%" },
    { netField: "P_13_4", vatField: "P_14_4", label: "4% (taxi)" },
    { netField: "P_13_5", vatField: "P_14_5", label: "Procedura szczególna" },
    { netField: "P_13_6_1", label: "0% (kraj)" },
    { netField: "P_13_6_2", label: "0% (WDT)" },
    { netField: "P_13_6_3", label: "0% (eksport)" },
    { netField: "P_13_7", label: "zw." },
    { netField: "P_13_8", label: "np. (poza terytorium kraju)" },
    { netField: "P_13_9", label: "np. (art. 100 ust. 1 pkt 4)" },
    { netField: "P_13_10", label: "odwrotne obciążenie" },
    { netField: "P_13_11", label: "marża" },
];

function parseAmount(value: string): number {
    if (!value) return 0;
    const parsed = Number(value.replace(/\s/g, "").replace(",", "."));
    return Number.isFinite(parsed) ? parsed : 0;
}

function formatAmount(value: number): string {
    return value.toLocaleString("pl-PL", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });
}

// Stawka pozycji (P_12): wartość liczbowa z "%", tokeny zw/np/oo bez zmian.
function formatVatRate(rate: string): string {
    const trimmed = (rate || "").trim();
    if (!trimmed) return "";
    return /^-?\d+([.,]\d+)?$/.test(trimmed) ? `${trimmed}%` : trimmed;
}

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
    const daneFaKorygowanej = fa ? findFirstByLocalName(fa, "DaneFaKorygowanej") : null;

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

    const vatSummary: VatSummaryRow[] = [];
    const vatSummaryTotals = { net: 0, vat: 0, gross: 0 };
    if (fa) {
        for (const field of VAT_SUMMARY_FIELDS) {
            const netEl = findChildrenByLocalName(fa, field.netField)[0];
            const vatEl = field.vatField ? findChildrenByLocalName(fa, field.vatField)[0] : undefined;
            if (!netEl && !vatEl) continue;

            const net = parseAmount((netEl?.textContent || "").trim());
            const vat = parseAmount((vatEl?.textContent || "").trim());
            const gross = Math.round((net + vat) * 100) / 100;

            vatSummary.push({ rateLabel: field.label, net, vat, gross });
            vatSummaryTotals.net += net;
            vatSummaryTotals.vat += vat;
            vatSummaryTotals.gross += gross;
        }
        vatSummaryTotals.net = Math.round(vatSummaryTotals.net * 100) / 100;
        vatSummaryTotals.vat = Math.round(vatSummaryTotals.vat * 100) / 100;
        vatSummaryTotals.gross = Math.round(vatSummaryTotals.gross * 100) / 100;
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
        correctionReason: getChildText(fa, "PrzyczynaKorekty"),
        correctedIssueDate: getChildText(daneFaKorygowanej, "DataWystFaKorygowanej"),
        correctedNumber: getChildText(daneFaKorygowanej, "NrFaKorygowanej"),
        correctedKsefNumber: getChildText(daneFaKorygowanej, "NrKSeFFaKorygowanej"),
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
        vatSummary,
        vatSummaryTotals,
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
    const daysToPay =
        parsed?.issueDate && parsed?.paymentDeadline
            ? Math.round(
                  (new Date(parsed.paymentDeadline).getTime() - new Date(parsed.issueDate).getTime()) / 86400000,
              )
            : null;
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
                        border: none !important;
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
                    padding: 24px 28px;
                    background: #fff;
                    color: #212529;
                    border: 1px solid #e3e3e3;
                    box-shadow: 0 6px 18px rgba(0,0,0,0.08);
                }
                .invoice-ksef-title {
                    letter-spacing: 0.04em;
                    font-weight: 700;
                    font-size: 1.3rem;
                }
                .preview-badge {
                    display: inline-block;
                    padding: 0.2rem 0.6rem;
                    border: 1px solid #adb5bd;
                    border-radius: 999px;
                    font-size: 0.72rem;
                    letter-spacing: 0.03em;
                }
                .invoice-mono { font-family: Consolas, "Courier New", monospace; }
                .inv-head {
                    display: flex;
                    justify-content: flex-end;
                    align-items: flex-start;
                }
                .inv-meta { white-space: nowrap; }
                .inv-title { text-align: center; white-space: nowrap; margin-top: 6px; }
                .inv-ksef-sub { text-align: center; font-size: 0.7rem; color: #868e96; white-space: nowrap; margin-top: 2px; }
                .inv-correction { font-size: 0.55rem; }
                .inv-account { white-space: nowrap; }
                .inv-pay { display: flex; gap: 32px; flex-wrap: wrap; }
                .inv-pay > div { flex: 0 1 auto; min-width: 0; }
                .inv-section { margin-top: 22px; }
                .inv-label {
                    font-size: 0.7rem;
                    text-transform: uppercase;
                    letter-spacing: 0.06em;
                    color: #868e96;
                    font-weight: 600;
                    margin-bottom: 4px;
                }
                .inv-cols { display: flex; gap: 32px; }
                .inv-cols > div { flex: 1; min-width: 0; }
                .inv-table { width: 100%; border-collapse: collapse; font-size: 0.85rem; }
                .inv-table th, .inv-table td { padding: 6px 8px; }
                .inv-table thead th {
                    text-align: left;
                    font-size: 0.7rem;
                    text-transform: uppercase;
                    letter-spacing: 0.03em;
                    color: #868e96;
                    border-bottom: 1.5px solid #343a40;
                }
                .inv-table tbody td { border-bottom: 1px solid #edeef0; }
                .inv-table tfoot th { border-top: 1.5px solid #343a40; font-weight: 600; }
                .inv-num { text-align: right; white-space: nowrap; }
                .inv-total { text-align: right; }
                .inv-total .amt { font-size: 1.3rem; font-weight: 700; margin-left: 10px; }
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

            <div className="invoice-sheet">
                <div className="inv-head">
                    <div className="text-end inv-meta">
                        <div className="small"><strong>Data wystawienia:</strong> {parsed.issueDate || "-"}</div>
                        <div className="small"><strong>Data sprzedaży:</strong> {parsed.saleDate || "-"}</div>
                    </div>
                </div>

                <div className="invoice-ksef-title inv-title">
                    FAKTURA {isCorrectionInvoice ? "korygująca" : "VAT"}{" "}
                    {parsed.invoiceNumber || "-"}
                </div>
                {ksefInvoiceNumber && (
                    <div className="inv-ksef-sub">Nr KSeF: {ksefInvoiceNumber}</div>
                )}

                <div className="inv-section inv-cols">
                    <div>
                        <div className="inv-label">Sprzedawca</div>
                        <div><strong>{parsed.seller.name || "-"}</strong></div>
                        <div>NIP: <span className="invoice-mono">{parsed.seller.nip || "-"}</span></div>
                        <div>{parsed.seller.line1 || "-"}</div>
                        {parsed.seller.line2 && <div>{parsed.seller.line2}</div>}
                    </div>
                    <div>
                        <div className="inv-label">Nabywca</div>
                        <div><strong>{parsed.buyer.name || "-"}</strong></div>
                        <div>NIP: <span className="invoice-mono">{parsed.buyer.nip || "-"}</span></div>
                        <div>{parsed.buyer.line1 || "-"}</div>
                        {parsed.buyer.line2 && <div>{parsed.buyer.line2}</div>}
                        <div className="small text-muted mt-1">
                            <div>Jednostka podrzędna JST: {parsed.buyer.jst}</div>
                            <div>Członek grupy VAT: {parsed.buyer.gv}</div>
                        </div>
                    </div>
                </div>

                {isCorrectionInvoice && (
                    <div className="inv-section inv-cols inv-correction">
                        <div>
                            <div className="inv-label">Dane faktury korygowanej</div>
                            <div><strong>Przyczyna korekty dla faktur korygujących:</strong> {parsed.correctionReason || "-"}</div>
                            {parsed.correctionType && (
                                <div><strong>Typ skutku korekty:</strong> {getCorrectionTypeLabel(parsed.correctionType)}</div>
                            )}
                        </div>
                        <div>
                            <div className="inv-label">Dane identyfikacyjne faktury korygowanej</div>
                            <div><strong>Data wystawienia faktury, której dotyczy faktura korygująca:</strong> {parsed.correctedIssueDate || "-"}</div>
                            <div><strong>Numer faktury korygowanej:</strong> {parsed.correctedNumber || "-"}</div>
                            <div><strong>Numer KSeF faktury korygowanej:</strong> {parsed.correctedKsefNumber || "-"}</div>
                        </div>
                    </div>
                )}

                {parsed.thirdParties.length > 0 && (
                    <div className="inv-section">
                        <div className="inv-label">Podmioty trzecie</div>
                        {parsed.thirdParties.map((thirdParty, index) => (
                            <div key={`third-party-${index}`} className={index > 0 ? "mt-2" : ""}>
                                {thirdParty.role && (
                                    <div className="text-muted small">{getThirdPartyRoleLabel(thirdParty.role)}</div>
                                )}
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
                    </div>
                )}

                <div className="inv-section">
                    <div className="inv-label">Pozycje faktury</div>
                    <table className="inv-table">
                        <thead>
                            <tr>
                                <th>Lp.</th>
                                <th>Nazwa</th>
                                <th className="inv-num">Il.</th>
                                <th>JM</th>
                                <th className="inv-num">Cena netto</th>
                                <th className="inv-num">Wartość netto</th>
                                <th className="inv-num">VAT</th>
                            </tr>
                        </thead>
                        <tbody>
                            {parsed.items.map((item, idx) => (
                                <tr key={`preview-item-${idx}`}>
                                    <td>{item.lineNo || idx + 1}</td>
                                    <td>{item.name}</td>
                                    <td className="inv-num invoice-mono">{item.quantity}</td>
                                    <td>{item.unit}</td>
                                    <td className="inv-num invoice-mono">{item.unitPrice}</td>
                                    <td className="inv-num invoice-mono">{item.netValue}</td>
                                    <td className="inv-num invoice-mono">{formatVatRate(item.vatRate)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="inv-section inv-total">
                    Razem brutto<span className="amt invoice-mono">{parsed.totalGross || "0.00"} PLN</span>
                </div>

                {parsed.vatSummary.length > 0 && (
                    <div className="inv-section">
                        <div className="inv-label">Podsumowanie stawek podatku</div>
                        <table className="inv-table">
                            <thead>
                                <tr>
                                    <th>Stawka VAT</th>
                                    <th className="inv-num">Netto</th>
                                    <th className="inv-num">VAT</th>
                                    <th className="inv-num">Brutto</th>
                                </tr>
                            </thead>
                            <tbody>
                                {parsed.vatSummary.map((row, idx) => (
                                    <tr key={`vat-summary-${idx}`}>
                                        <td>{row.rateLabel}</td>
                                        <td className="inv-num invoice-mono">{formatAmount(row.net)}</td>
                                        <td className="inv-num invoice-mono">{formatAmount(row.vat)}</td>
                                        <td className="inv-num invoice-mono">{formatAmount(row.gross)}</td>
                                    </tr>
                                ))}
                            </tbody>
                            <tfoot>
                                <tr>
                                    <th className="inv-num">Razem</th>
                                    <th className="inv-num invoice-mono">{formatAmount(parsed.vatSummaryTotals.net)}</th>
                                    <th className="inv-num invoice-mono">{formatAmount(parsed.vatSummaryTotals.vat)}</th>
                                    <th className="inv-num invoice-mono">{formatAmount(parsed.vatSummaryTotals.gross)}</th>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                )}

                <div className="inv-section">
                    <div className="inv-label">Płatność</div>
                    <div className="inv-pay">
                        <div>
                            <div className="inv-label">Termin płatności</div>
                            <div>
                                {parsed.paymentDeadline || <span className="text-muted">(puste)</span>}
                                {daysToPay !== null && ` (${daysToPay} ${daysToPay === 1 ? "dzień" : "dni"})`}
                            </div>
                        </div>
                        <div>
                            <div className="inv-label">Numer konta</div>
                            <div className="invoice-mono inv-account">{parsed.bankAccount || <span className="text-muted">(puste)</span>}</div>
                        </div>
                        <div>
                            <div className="inv-label">Bank</div>
                            <div>{parsed.bankName || <span className="text-muted">(puste)</span>}</div>
                        </div>
                    </div>
                </div>

                {hasKsefQr && (
                    <div className="inv-section text-center invoice-qr-preview-section">
                        <div className="fw-bold mb-2">Sprawdź, czy Twoja faktura znajduje się w KSeF!</div>
                        <div className="d-inline-flex p-3 bg-white border rounded-3">
                            <QRCodeSVG value={ksefPreviewStatus?.qrVerificationUrl || ""} size={180} level="M" includeMargin />
                        </div>
                        {ksefInvoiceNumber && (
                            <div className="mt-2 small text-break">
                                <strong>Numer KSeF:</strong> {ksefInvoiceNumber}
                            </div>
                        )}
                        <div className="mt-3 invoice-qr-preview-actions">
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
                    </div>
                )}
            </div>

            {hasKsefQr && (
                <div className="invoice-qr-print-section d-none d-print-block mt-4 text-center">
                    <div className="fw-bold mb-2">Sprawdź, czy Twoja faktura znajduje się w KSeF!</div>
                    <div className="d-inline-flex p-3 bg-white border rounded-3">
                        <QRCodeSVG value={ksefPreviewStatus?.qrVerificationUrl || ""} size={180} level="M" includeMargin />
                    </div>
                    {ksefInvoiceNumber && (
                        <div className="mt-2 small text-break">
                            <strong>Numer KSeF:</strong> {ksefInvoiceNumber}
                        </div>
                    )}
                    <div className="mt-3 small text-break">
                        <strong>Link weryfikacyjny:</strong>{" "}
                        <span className="invoice-mono">{ksefPreviewStatus?.qrVerificationUrl}</span>
                    </div>
                </div>
            )}
        </Container>
    );
}
