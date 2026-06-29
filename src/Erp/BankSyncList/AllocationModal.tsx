import React, { useEffect, useRef, useState } from 'react';
import { Alert, Badge, Button, Form, ListGroup, Modal, Spinner } from 'react-bootstrap';
import { BankTransfer, CostInvoice, Invoice, PaymentAllocation } from '../../../Typings/bussinesTypes';
import MainSetup from '../../React/MainSetupReact';
import Tools from '../../React/Tools/Tools';
import ToolsDate from '../../React/Tools/ToolsDate';
import { createAllocation, deleteAllocation, fetchAllocations } from './BankSyncController';

type InvoiceType = 'invoice' | 'costInvoice';

async function searchInvoices(query: string): Promise<Invoice[]> {
    const res = await fetch(`${MainSetup.serverUrl}invoices`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orConditions: [{ searchText: query }] }),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return Array.isArray(data) ? data : [];
}

async function searchCostInvoices(query: string): Promise<CostInvoice[]> {
    const res = await fetch(`${MainSetup.serverUrl}cost-invoices`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orConditions: [{ searchText: query }] }),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return Array.isArray(data) ? data : [];
}

interface AllocationModalProps {
    transfer: BankTransfer;
    onHide: () => void;
    onChanged: () => void;
}

export default function AllocationModal({ transfer, onHide, onChanged }: AllocationModalProps) {
    const [invoiceType, setInvoiceType] = useState<InvoiceType>('invoice');
    const [searchQuery, setSearchQuery] = useState('');
    const [searching, setSearching] = useState(false);
    const [invoiceResults, setInvoiceResults] = useState<Invoice[]>([]);
    const [costInvoiceResults, setCostInvoiceResults] = useState<CostInvoice[]>([]);
    const [selectedInvId, setSelectedInvId] = useState<number | null>(null);
    const [selectedCostInvId, setSelectedCostInvId] = useState<number | null>(null);
    const [amount, setAmount] = useState(String(transfer.amount));
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [allocations, setAllocations] = useState<PaymentAllocation[]>([]);
    const [loadingAllocs, setLoadingAllocs] = useState(true);
    const [deletingId, setDeletingId] = useState<number | null>(null);

    const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
        fetchAllocations(transfer.id)
            .then(setAllocations)
            .catch(() => {})
            .finally(() => setLoadingAllocs(false));
    }, [transfer.id]);

    useEffect(() => {
        if (selectedInvId || selectedCostInvId) return;
        if (searchTimer.current) clearTimeout(searchTimer.current);
        if (!searchQuery.trim()) {
            setInvoiceResults([]);
            setCostInvoiceResults([]);
            return;
        }
        let cancelled = false;
        searchTimer.current = setTimeout(async () => {
            setSearching(true);
            try {
                if (invoiceType === 'invoice') {
                    const res = await searchInvoices(searchQuery);
                    if (!cancelled) { setInvoiceResults(res); setCostInvoiceResults([]); }
                } else {
                    const res = await searchCostInvoices(searchQuery);
                    if (!cancelled) { setCostInvoiceResults(res); setInvoiceResults([]); }
                }
            } catch { /* search errors are non-critical */ }
            finally { if (!cancelled) setSearching(false); }
        }, 400);
        return () => { cancelled = true; if (searchTimer.current) clearTimeout(searchTimer.current); };
    }, [searchQuery, invoiceType, selectedInvId, selectedCostInvId]);

    function switchType(t: InvoiceType) {
        setInvoiceType(t);
        setSearchQuery('');
        setSelectedInvId(null);
        setSelectedCostInvId(null);
        setInvoiceResults([]);
        setCostInvoiceResults([]);
    }

    const selectedId = invoiceType === 'invoice' ? selectedInvId : selectedCostInvId;
    const results: (Invoice | CostInvoice)[] = invoiceType === 'invoice' ? invoiceResults : costInvoiceResults;

    function getLabel(r: Invoice | CostInvoice): string {
        return invoiceType === 'invoice'
            ? ((r as Invoice).number ?? `#${r.id}`)
            : ((r as CostInvoice).invoiceNumber ?? `#${r.id}`);
    }

    function getParty(r: Invoice | CostInvoice): string {
        return invoiceType === 'invoice'
            ? ((r as Invoice)._entity?.name ?? '')
            : ((r as CostInvoice).supplierName ?? '');
    }

    function getGross(r: Invoice | CostInvoice): number {
        return invoiceType === 'invoice'
            ? ((r as Invoice)._totalGrossValue ?? 0)
            : (r as CostInvoice).grossAmount;
    }

    function selectResult(r: Invoice | CostInvoice) {
        if (invoiceType === 'invoice') setSelectedInvId(r.id);
        else setSelectedCostInvId(r.id);
        setSearchQuery(getLabel(r));
    }

    const selectedResult = results.find(r => r.id === selectedId)
        ?? (invoiceType === 'invoice'
            ? invoiceResults.find(r => r.id === selectedId)
            : costInvoiceResults.find(r => r.id === selectedId));

    async function handleSave() {
        if (!selectedId) { setError('Wybierz fakturę z listy'); return; }
        const amountNum = parseFloat(amount.replace(',', '.'));
        if (isNaN(amountNum) || amountNum <= 0) { setError('Podaj prawidłową kwotę (> 0)'); return; }
        setSaving(true);
        setError(null);
        try {
            await createAllocation(transfer.id, {
                ...(invoiceType === 'invoice' ? { invoiceId: selectedId } : { costInvoiceId: selectedId }),
                amount: amountNum,
            });
            onChanged();
            const updated = await fetchAllocations(transfer.id);
            setAllocations(updated);
            setSearchQuery('');
            setSelectedInvId(null);
            setSelectedCostInvId(null);
            setInvoiceResults([]);
            setCostInvoiceResults([]);
        } catch (e) {
            setError(e instanceof Error ? e.message : 'Błąd zapisu');
        } finally {
            setSaving(false);
        }
    }

    async function handleDelete(allocId: number) {
        setDeletingId(allocId);
        setError(null);
        try {
            await deleteAllocation(transfer.id, allocId);
            setAllocations(prev => prev.filter(a => a.id !== allocId));
            onChanged();
        } catch (e) {
            setError(e instanceof Error ? e.message : 'Błąd usuwania');
        } finally {
            setDeletingId(null);
        }
    }

    const canAllocate = transfer.matchingStatus !== 'MANUAL';
    const fmt = (n: number) => `${Tools.formatNumber(n)} PLN`;
    const fmtDate = (d: string | null) => d ? ToolsDate.dateYMDtoDMY(d) : '-';

    return (
        <Modal show onHide={onHide} size="lg">
            <Modal.Header closeButton>
                <Modal.Title>
                    Alokacje — {transfer.direction === 'IN' ? '↓ IN' : '↑ OUT'} {fmt(transfer.amount)} &nbsp;
                    <small className="text-muted fw-normal fs-6">{fmtDate(transfer.execDate)}</small>
                </Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <p className="text-muted small mb-3">
                    <strong>{transfer.counterpartyName ?? '-'}</strong>
                    {transfer.counterpartyAccount && <><br /><span className="font-monospace">{transfer.counterpartyAccount}</span></>}
                    {transfer.description && <><br />{transfer.description}</>}
                </p>

                {error && <Alert variant="danger" dismissible onClose={() => setError(null)}>{error}</Alert>}

                {/* --- Existing allocations --- */}
                <h6>Istniejące alokacje</h6>
                {loadingAllocs
                    ? <Spinner size="sm" animation="border" />
                    : allocations.length === 0
                        ? <p className="text-muted small">Brak alokacji dla tego przelewu</p>
                        : <ListGroup className="mb-3">
                            {allocations.map(a => (
                                <ListGroup.Item key={a.id} className="d-flex justify-content-between align-items-center py-2 px-3">
                                    <div className="small">
                                        {a.invoiceId
                                            ? <><Badge bg="primary" className="me-1">Faktura</Badge> #{a.invoiceId}</>
                                            : <><Badge bg="secondary" className="me-1">Kosztowa</Badge> #{a.costInvoiceId}</>
                                        }
                                        <span className="ms-2 fw-semibold">{fmt(a.allocatedAmount)}</span>
                                        <Badge bg="light" text="dark" className="ms-2 border">{a.source}</Badge>
                                    </div>
                                    <Button
                                        size="sm"
                                        variant="outline-danger"
                                        disabled={deletingId === a.id}
                                        onClick={() => handleDelete(a.id)}
                                    >
                                        {deletingId === a.id ? <Spinner size="sm" animation="border" /> : 'Usuń'}
                                    </Button>
                                </ListGroup.Item>
                            ))}
                        </ListGroup>
                }

                {/* --- Add allocation --- */}
                {canAllocate && (
                    <>
                        <h6 className="mt-3">Dodaj alokację</h6>

                        <Form.Group className="mb-2">
                            <Form.Check
                                inline type="radio" label="Faktura sprzedaży"
                                name="invType" id="invType-inv"
                                checked={invoiceType === 'invoice'}
                                onChange={() => switchType('invoice')}
                            />
                            <Form.Check
                                inline type="radio" label="Faktura kosztowa"
                                name="invType" id="invType-cost"
                                checked={invoiceType === 'costInvoice'}
                                onChange={() => switchType('costInvoice')}
                            />
                        </Form.Group>

                        <Form.Group className="mb-1">
                            <Form.Label className="small mb-1">
                                Szukaj faktury {searching && <Spinner size="sm" animation="border" className="ms-1" />}
                            </Form.Label>
                            <Form.Control
                                type="text"
                                size="sm"
                                placeholder="Numer faktury lub nazwa kontrahenta…"
                                value={searchQuery}
                                onChange={e => {
                                    setSearchQuery(e.target.value);
                                    setSelectedInvId(null);
                                    setSelectedCostInvId(null);
                                }}
                            />
                        </Form.Group>

                        {results.length > 0 && !selectedId && (
                            <ListGroup className="mb-2" style={{ maxHeight: 200, overflowY: 'auto' }}>
                                {results.slice(0, 10).map(r => (
                                    <ListGroup.Item key={r.id} action onClick={() => selectResult(r)} className="py-2">
                                        <div className="small fw-semibold">{getLabel(r)}</div>
                                        <div className="small text-muted">
                                            {getParty(r)} &mdash; {fmt(getGross(r))}
                                        </div>
                                    </ListGroup.Item>
                                ))}
                            </ListGroup>
                        )}

                        {selectedResult && (
                            <Alert variant="success" className="py-2 small mb-2 d-flex justify-content-between align-items-center">
                                <span>
                                    <strong>{getLabel(selectedResult)}</strong>
                                    {' — '}{getParty(selectedResult)}
                                    {' — brutto: '}{fmt(getGross(selectedResult))}
                                </span>
                                <Button variant="link" size="sm" className="p-0 ms-2 text-danger"
                                    onClick={() => { setSelectedInvId(null); setSelectedCostInvId(null); setSearchQuery(''); }}>
                                    zmień
                                </Button>
                            </Alert>
                        )}

                        <Form.Group className="mb-3">
                            <Form.Label className="small mb-1">Kwota alokacji (PLN)</Form.Label>
                            <Form.Control
                                type="number" size="sm" step="0.01" min="0.01"
                                value={amount}
                                onChange={e => setAmount(e.target.value)}
                            />
                        </Form.Group>
                    </>
                )}

                {!canAllocate && (
                    <Alert variant="info" className="small">
                        Przelew oznaczony jako <strong>MANUAL</strong> (opłata bankowa lub waluta obca) — alokacja ręczna niedostępna.
                    </Alert>
                )}
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={onHide}>Zamknij</Button>
                {canAllocate && (
                    <Button variant="primary" onClick={handleSave} disabled={saving || !selectedId}>
                        {saving
                            ? <><Spinner size="sm" animation="border" className="me-1" />Zapisuję…</>
                            : 'Zapisz alokację'}
                    </Button>
                )}
            </Modal.Footer>
        </Modal>
    );
}
