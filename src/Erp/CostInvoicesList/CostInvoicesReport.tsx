import React, { useState, useEffect, useCallback } from "react";
import {
    Container,
    Card,
    Row,
    Col,
    Form,
    Button,
    Table,
    Alert,
    Spinner,
} from "react-bootstrap";
import { CostInvoiceMonthlyReport } from "../../../Typings/bussinesTypes";
import { fetchMonthlyReport, downloadMonthlyReport } from "./CostInvoicesController";
import { CategoryBadge, CostInvoiceStatusBadge } from "./CostInvoicesBadges";
import Tools from "../../React/Tools/Tools";
import { SpinnerBootstrap } from "../../View/Resultsets/CommonComponents";

const MONTHS = [
    "Styczeń",
    "Luty",
    "Marzec",
    "Kwiecień",
    "Maj",
    "Czerwiec",
    "Lipiec",
    "Sierpień",
    "Wrzesień",
    "Październik",
    "Listopad",
    "Grudzień",
];

export default function CostInvoicesReport() {
    const currentDate = new Date();
    const [year, setYear] = useState(currentDate.getFullYear());
    const [month, setMonth] = useState(currentDate.getMonth() + 1);
    const [report, setReport] = useState<CostInvoiceMonthlyReport | null>(null);
    const [loading, setLoading] = useState(false);
    const [exporting, setExporting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const toNumber = (value: unknown): number => {
        if (typeof value === "number") return value;
        if (typeof value === "string") {
            const parsed = Number(value.replace(",", "."));
            return Number.isNaN(parsed) ? 0 : parsed;
        }
        return 0;
    };

    const getInvoiceCategory = (
        invoice: CostInvoiceMonthlyReport["invoices"][number]
    ) => {
        const invoiceWithCategory = invoice as typeof invoice & {
            _category?: CostInvoiceMonthlyReport["invoices"][number]["category"];
        };
        return invoice.category || invoiceWithCategory._category || null;
    };

    useEffect(() => {
        document.title = "Raport miesięczny faktur kosztowych";
    }, []);

    const loadReport = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            const data = (await fetchMonthlyReport(year, month, "json")) as CostInvoiceMonthlyReport;
            setReport(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Błąd ładowania raportu");
        } finally {
            setLoading(false);
        }
    }, [year, month]);

    useEffect(() => {
        loadReport();
    }, [loadReport]);

    const handleExport = async (format: "csv" | "xml") => {
        setExporting(true);
        try {
            await downloadMonthlyReport(year, month, format);
        } catch (err) {
            setError(err instanceof Error ? err.message : `Błąd eksportu ${format.toUpperCase()}`);
        } finally {
            setExporting(false);
        }
    };

    // Generuj listę lat (od 2024 do bieżącego + 1)
    const years = [];
    for (let y = 2024; y <= currentDate.getFullYear() + 1; y++) {
        years.push(y);
    }

    return (
        <Container fluid className="py-3">
            <h3 className="mb-4">📊 Raport miesięczny faktur kosztowych</h3>

            {error && (
                <Alert variant="danger" onClose={() => setError(null)} dismissible>
                    {error}
                </Alert>
            )}

            {/* Wybór okresu */}
            <Card className="mb-4">
                <Card.Body>
                    <Row className="align-items-end">
                        <Col md={2}>
                            <Form.Group>
                                <Form.Label>Rok</Form.Label>
                                <Form.Select
                                    value={year}
                                    onChange={(e) => setYear(Number(e.target.value))}
                                >
                                    {years.map((y) => (
                                        <option key={y} value={y}>
                                            {y}
                                        </option>
                                    ))}
                                </Form.Select>
                            </Form.Group>
                        </Col>
                        <Col md={3}>
                            <Form.Group>
                                <Form.Label>Miesiąc</Form.Label>
                                <Form.Select
                                    value={month}
                                    onChange={(e) => setMonth(Number(e.target.value))}
                                >
                                    {MONTHS.map((name, idx) => (
                                        <option key={idx + 1} value={idx + 1}>
                                            {name}
                                        </option>
                                    ))}
                                </Form.Select>
                            </Form.Group>
                        </Col>
                        <Col md="auto">
                            <Button variant="primary" onClick={loadReport} disabled={loading}>
                                {loading ? (
                                    <>
                                        <Spinner animation="border" size="sm" className="me-1" />
                                        Ładowanie...
                                    </>
                                ) : (
                                    "Wygeneruj raport"
                                )}
                            </Button>
                        </Col>
                        <Col md="auto">
                            <Button
                                variant="outline-success"
                                onClick={() => handleExport("csv")}
                                disabled={exporting || !report}
                            >
                                ⬇ Eksport CSV
                            </Button>
                        </Col>
                        <Col md="auto">
                            <Button
                                variant="outline-info"
                                onClick={() => handleExport("xml")}
                                disabled={exporting || !report}
                            >
                                ⬇ Eksport XML
                            </Button>
                        </Col>
                    </Row>
                </Card.Body>
            </Card>

            {loading ? (
                <div className="text-center m-5">
                    <SpinnerBootstrap />
                    <div className="mt-3">Generowanie raportu...</div>
                </div>
            ) : report ? (
                <>
                    {/* Kafelki podsumowania */}
                    <Row className="mb-4">
                        <Col md={2}>
                            <Card className="text-center h-100">
                                <Card.Body>
                                    <div className="text-muted small">Liczba faktur</div>
                                    <h3 className="mb-0">{report.summary.totalInvoices}</h3>
                                </Card.Body>
                            </Card>
                        </Col>
                        <Col md={2}>
                            <Card className="text-center h-100 border-primary">
                                <Card.Body>
                                    <div className="text-muted small">Suma netto</div>
                                    <h4 className="mb-0 text-primary">
                                        {Tools.formatNumber(toNumber(report.summary.totalNet))} zł
                                    </h4>
                                </Card.Body>
                            </Card>
                        </Col>
                        <Col md={2}>
                            <Card className="text-center h-100">
                                <Card.Body>
                                    <div className="text-muted small">Suma VAT</div>
                                    <h4 className="mb-0">{Tools.formatNumber(toNumber(report.summary.totalVat))} zł</h4>
                                </Card.Body>
                            </Card>
                        </Col>
                        <Col md={2}>
                            <Card className="text-center h-100">
                                <Card.Body>
                                    <div className="text-muted small">Suma brutto</div>
                                    <h4 className="mb-0">
                                        {Tools.formatNumber(toNumber(report.summary.totalGross))} zł
                                    </h4>
                                </Card.Body>
                            </Card>
                        </Col>
                        <Col md={2}>
                            <Card className="text-center h-100 border-success">
                                <Card.Body>
                                    <div className="text-muted small">Do zaksięgowania</div>
                                    <h4 className="mb-0 text-success">
                                        {Tools.formatNumber(toNumber(report.summary.bookableNet))} zł
                                    </h4>
                                </Card.Body>
                            </Card>
                        </Col>
                        <Col md={2}>
                            <Card className="text-center h-100 border-info">
                                <Card.Body>
                                    <div className="text-muted small">VAT do odliczenia</div>
                                    <h4 className="mb-0 text-info">
                                        {Tools.formatNumber(toNumber(report.summary.deductibleVat))} zł
                                    </h4>
                                </Card.Body>
                            </Card>
                        </Col>
                    </Row>

                    {/* Podział wg kategorii */}
                    <Row className="mb-4">
                        <Col md={6}>
                            <Card className="h-100">
                                <Card.Header>
                                    <h6 className="mb-0">Podział wg kategorii</h6>
                                </Card.Header>
                                <Card.Body className="p-0">
                                    <Table striped hover size="sm" className="mb-0">
                                        <thead>
                                            <tr>
                                                <th>Kategoria</th>
                                                <th className="text-center">Liczba</th>
                                                <th className="text-end">Netto</th>
                                                <th className="text-end">VAT</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {Object.entries(report.summary.byCategory || {}).map(
                                                ([categoryName, data]) => (
                                                    <tr key={categoryName}>
                                                        <td>{categoryName}</td>
                                                        <td className="text-center">{data.count}</td>
                                                        <td className="text-end">
                                                            {Tools.formatNumber(toNumber(data.net))} zł
                                                        </td>
                                                        <td className="text-end">
                                                            {Tools.formatNumber(toNumber(data.vat))} zł
                                                        </td>
                                                    </tr>
                                                )
                                            )}
                                        </tbody>
                                    </Table>
                                </Card.Body>
                            </Card>
                        </Col>
                        <Col md={6}>
                            <Card className="h-100">
                                <Card.Header>
                                    <h6 className="mb-0">Podział wg statusu</h6>
                                </Card.Header>
                                <Card.Body>
                                    <Row>
                                        {Object.entries(report.summary.byStatus || {}).map(
                                            ([status, count]) => (
                                                <Col key={status} className="text-center">
                                                    <CostInvoiceStatusBadge status={status} />
                                                    <h4 className="mt-2 mb-0">{count}</h4>
                                                </Col>
                                            )
                                        )}
                                    </Row>
                                </Card.Body>
                            </Card>
                        </Col>
                    </Row>

                    {/* Lista faktur */}
                    <Card>
                        <Card.Header>
                            <h6 className="mb-0">
                                Faktury ({report.summary.totalInvoices})
                            </h6>
                        </Card.Header>
                        <Card.Body className="p-0">
                            <Table striped hover responsive className="mb-0">
                                <thead>
                                    <tr>
                                        <th>Nr faktury</th>
                                        <th>Dostawca</th>
                                        <th>Data</th>
                                        <th className="text-end">Netto</th>
                                        <th className="text-end">VAT</th>
                                        <th className="text-end">Brutto</th>
                                        <th>Kategoria</th>
                                        <th>Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {report.invoices.map((invoice) => (
                                        <tr key={invoice.id}>
                                            <td>
                                                <a href={`#/cost-invoice/${invoice.id}`}>
                                                    {invoice.invoiceNumber}
                                                </a>
                                            </td>
                                            <td>
                                                <div>{invoice.supplierName}</div>
                                                <div className="text-muted small">
                                                    NIP: {invoice.supplierNip}
                                                </div>
                                            </td>
                                            <td>{invoice.issueDate}</td>
                                            <td className="text-end">
                                                {Tools.formatNumber(toNumber(invoice.netAmount))}
                                            </td>
                                            <td className="text-end">
                                                {Tools.formatNumber(toNumber(invoice.vatAmount))}
                                            </td>
                                            <td className="text-end">
                                                {Tools.formatNumber(toNumber(invoice.grossAmount))}
                                            </td>
                                            <td>
                                                <CategoryBadge category={getInvoiceCategory(invoice)} />
                                            </td>
                                            <td>
                                                <CostInvoiceStatusBadge status={invoice.status} />
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </Table>
                        </Card.Body>
                    </Card>
                </>
            ) : (
                <Alert variant="info">
                    Wybierz okres i kliknij "Wygeneruj raport" aby zobaczyć dane.
                </Alert>
            )}
        </Container>
    );
}
