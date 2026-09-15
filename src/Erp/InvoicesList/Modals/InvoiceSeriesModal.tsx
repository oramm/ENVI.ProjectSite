import React, { useEffect, useRef, useState } from "react";
import { Alert, Button, Form, Modal, Spinner, Table } from "react-bootstrap";
import { Invoice } from "../../../../Typings/bussinesTypes";
import { InvoiceSeriesInput, InvoiceSeriesPreview, invoiceSeriesRequest } from "../invoiceSeriesApi";

function newInvoicesLabel(count: number): string {
    if (count === 1) return "1 nową fakturę";
    const few = count % 10 >= 2 && count % 10 <= 4 && !(count % 100 >= 12 && count % 100 <= 14);
    return count + (few ? " nowe faktury" : " nowych faktur");
}
const formatDate = (date: string) => date.split("-").reverse().join(".");
const formatAmount = (amount: number) => amount.toLocaleString("pl-PL", { style: "currency", currency: "PLN" });

export function InvoiceSeriesButton({ invoice }: { invoice: Invoice }) {
    const [show, setShow] = useState(false);
    return <>
        <Button variant="outline-secondary" size="sm" onClick={() => setShow(true)}>Utwórz serię</Button>
        <InvoiceSeriesModal invoice={invoice} show={show} onHide={() => setShow(false)} />
    </>;
}

export function InvoiceSeriesModal({ invoice, show, onHide }: { invoice: Invoice; show: boolean; onHide: () => void }) {
    const [totalCount, setTotalCount] = useState("2");
    const [intervalMonths, setIntervalMonths] = useState("1");
    const [firstSaleDate, setFirstSaleDate] = useState<string | null>(null);
    const [preview, setPreview] = useState<InvoiceSeriesPreview | null>(null);
    const [previewKey, setPreviewKey] = useState("");
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [created, setCreated] = useState<number | null>(null);
    const inFlight = useRef(false);
    const attempt = useRef<{ key: string; requestId: string } | null>(null);
    const [uncertain, setUncertain] = useState(false);
    const input: InvoiceSeriesInput = {
        sourceInvoiceId: invoice.id!,
        totalCount: Number(totalCount),
        intervalMonths: Number(intervalMonths),
        firstSaleDate,
    };
    const key = JSON.stringify(input);
    const valid = Number.isSafeInteger(input.totalCount) && input.totalCount >= 2 && input.totalCount <= 100
        && Number.isSafeInteger(input.intervalMonths) && input.intervalMonths >= 1 && input.intervalMonths <= 12 && firstSaleDate !== "";

    useEffect(() => {
        if (!show || !valid || created !== null) return;
        const controller = new AbortController();
        setLoading(true);
        setError("");
        invoiceSeriesRequest<InvoiceSeriesPreview>("invoiceSeries/preview", JSON.parse(key), controller.signal)
            .then(result => {
                if (!controller.signal.aborted) { setPreview(result); setPreviewKey(key); }
            })
            .catch(err => {
                if (!controller.signal.aborted) { setError(err.message); setPreviewKey(""); }
            })
            .finally(() => { if (!controller.signal.aborted) setLoading(false); });
        return () => controller.abort();
    }, [show, key, valid, created]);

    async function submit(event: React.FormEvent) {
        event.preventDefault();
        if (inFlight.current || created !== null || !valid || loading || previewKey !== key) return;
        inFlight.current = true;
        setSaving(true);
        setError("");
        try {
            if (!attempt.current || attempt.current.key !== key) attempt.current = { key, requestId: crypto.randomUUID() };
            const result = await invoiceSeriesRequest<{ invoiceIds: number[] }>("invoiceSeries", {
                ...input, requestId: attempt.current.requestId,
            });
            setCreated(result.invoiceIds.length);
            setUncertain(false);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Nie udało się potwierdzić zapisu.");
            setUncertain(!(err instanceof Error && "status" in err && Number(err.status) < 500));
        } finally {
            inFlight.current = false;
            setSaving(false);
        }
    }

    function close() {
        if (inFlight.current) return;
        onHide();
        if (created !== null) {
            setCreated(null);
            attempt.current = null;
            setPreviewKey("");
        }
    }

    return <Modal show={show} onHide={close} size="lg" backdrop={saving ? "static" : true} keyboard={!saving}>
        <Form onSubmit={submit}>
            <Modal.Header closeButton={!saving}><Modal.Title>Utwórz serię</Modal.Title></Modal.Header>
            <Modal.Body>
                <Alert variant="info">
                    Nowe faktury zostaną zapisane od razu jako „Na później”, bez numerów.
                    Każdą fakturę należy później wystawić osobno. Opisy i kwoty pozostaną bez zmian.
                </Alert>
                {created !== null ? <Alert variant="success" role="status">
                    Utworzono {newInvoicesLabel(created)}. Faktura źródłowa pozostała bez zmian.
                </Alert> : <>
                    <fieldset disabled={saving || uncertain}>
                        <div className="row g-3 mb-3">
                            <Form.Group className="col-sm-6" controlId="series-count">
                                <Form.Label>Łączna liczba faktur</Form.Label>
                                <Form.Control type="number" min={2} max={100} step={1} required value={totalCount} onChange={e => setTotalCount(e.target.value)} />
                            </Form.Group>
                            <Form.Group className="col-sm-6" controlId="series-interval">
                                <Form.Label>Powtarzaj co … miesięcy</Form.Label>
                                <Form.Control type="number" min={1} max={12} step={1} required value={intervalMonths} onChange={e => setIntervalMonths(e.target.value)} />
                            </Form.Group>
                            <Form.Group className="col-sm-6" controlId="series-first-date">
                                <Form.Label>Data pierwszej nowej faktury</Form.Label>
                                <Form.Control type="date" min="1000-01-01" max="9999-12-31" required
                                    value={firstSaleDate ?? preview?.saleDates[1] ?? ""}
                                    onChange={e => setFirstSaleDate(e.target.value)} />
                            </Form.Group>
                            <div className="col-sm-6 d-flex align-items-end">
                                <Button variant="link" onClick={() => setFirstSaleDate(null)} disabled={firstSaleDate === null}>Przywróć datę domyślną</Button>
                            </div>
                        </div>
                    </fieldset>
                    <p className="small text-muted">
                        Domyślnie zachowujemy dzień sprzedaży faktury źródłowej. Po ręcznej zmianie daty zachowujemy wybrany dzień.
                        W krótszym miesiącu używamy ostatniego dnia, a potem wracamy do dnia bazowego.
                    </p>
                    {error && <Alert variant="danger" role="alert">{error}</Alert>}
                    {uncertain && <Alert variant="warning">
                        Zapis nie został potwierdzony. Ponów tę samą operację przyciskiem poniżej. Nie utworzy ona duplikatów.
                        Parametry zachowano również po zamknięciu tego okna.
                    </Alert>}
                    {!valid && <Alert variant="warning">Podaj liczbę faktur od 2 do 100, całkowity odstęp od 1 do 12 miesięcy i poprawną datę.</Alert>}
                    {loading && <div role="status"><Spinner size="sm" /> Aktualizowanie podglądu…</div>}
                    {valid && !loading && previewKey === key && preview && <div style={{ maxHeight: "40vh", overflowY: "auto" }}>
                        <Table striped bordered size="sm" responsive>
                            <thead><tr><th scope="col">Lp.</th><th scope="col">Dokument</th><th scope="col">Planowana data sprzedaży</th><th scope="col">Kwota netto</th><th scope="col">Kwota brutto</th></tr></thead>
                            <tbody>{preview.saleDates.map((date, index) => <tr key={index}>
                                <td>{index + 1}</td><td>{index === 0 ? "Istniejąca (źródłowa)" : "Nowa (Na później)"}</td>
                                <td>{formatDate(date)}</td><td className="text-nowrap">{formatAmount(preview.netAmount)}</td><td className="text-nowrap">{formatAmount(preview.grossAmount)}</td>
                            </tr>)}</tbody>
                        </Table>
                    </div>}
                </>}
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={close} disabled={saving}>Zamknij</Button>
                {created === null && <Button type="submit" variant="primary" disabled={saving || loading || !valid || previewKey !== key}>
                    {saving ? <><Spinner size="sm" /> Tworzenie…</> : "Utwórz " + newInvoicesLabel(valid ? input.totalCount - 1 : 0)}
                </Button>}
            </Modal.Footer>
        </Form>
    </Modal>;
}
