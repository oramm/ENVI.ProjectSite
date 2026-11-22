import React, { useEffect, useRef, useState } from 'react';
import { Alert, Button, Form, ListGroup, Modal, Spinner } from 'react-bootstrap';
import { BankTransfer, CostInvoice, Invoice, PaymentAllocation } from '../../../Typings/bussinesTypes';
import RepositoryReact from '../../React/RepositoryReact';
import { createAllocation, deleteAllocation, fetchAllocations, fetchInvoicePayments } from './BankSyncController';
import { BankTransferDescription, fmt } from './BankSyncViews';

interface InvoiceOption {
    id: number;
    number: string;
    name: string;
    remaining?: number;
}

function searchInvoices(searchText: string, incoming: boolean): Promise<InvoiceOption[]> {
    const conditions = { orConditions: [{ searchText }] };
    if (incoming) return RepositoryReact.request<Invoice[]>('invoices', 'POST', conditions)
        .then(items => items.filter(invoice => !invoice.correctedInvoiceId && invoice.number).map(invoice => ({
            id: invoice.id, number: invoice.number!, name: invoice._entity?.name ?? '',
        })));
    return RepositoryReact.request<CostInvoice[]>('cost-invoices', 'POST', conditions)
        .then(items => items.filter(invoice => invoice.invoiceNumber).map(invoice => ({
            id: invoice.id, number: invoice.invoiceNumber!, name: invoice.supplierName ?? '',
            remaining: moneyDifference(invoice.grossAmount, invoice.paidAmount ?? 0),
        })));
}

function moneyDifference(a: number, b: number) {
    return Math.max(0, (Math.round(a * 100) - Math.round(b * 100)) / 100);
}

export default function AllocationModal({ transfer, onHide, onChanged, onAssigned }: {
    transfer: BankTransfer;
    onHide: () => void;
    onChanged: () => void;
    onAssigned: (amount: number, requested: number, remaining?: number) => void;
}) {
    const incoming = transfer.direction === 'IN';
    const [search, setSearch] = useState('');
    const [options, setOptions] = useState<InvoiceOption[]>([]);
    const [selected, setSelected] = useState<InvoiceOption>();
    const [amount, setAmount] = useState('');
    const [allocations, setAllocations] = useState<PaymentAllocation[]>();
    const [revision, setRevision] = useState(0);
    const [searching, setSearching] = useState(false);
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState('');
    const pending = useRef(false);

    useEffect(() => {
        let active = true;
        setAllocations(undefined);
        fetchAllocations(transfer.id).then(items => { if (active) setAllocations(items); }).catch((err: Error) => {
            if (active) setError(err.message);
        });
        return () => { active = false; };
    }, [transfer.id, revision]);

    useEffect(() => {
        const query = search.trim();
        setOptions([]);
        setSearching(false);
        if (!query || selected) return;
        let active = true;
        const timer = setTimeout(() => {
            setSearching(true);
            searchInvoices(query, incoming).then(items => { if (active) setOptions(items); })
                .catch((err: Error) => { if (active) setError(err.message); })
                .finally(() => { if (active) setSearching(false); });
        }, 300);
        return () => { active = false; clearTimeout(timer); };
    }, [search, incoming, selected]);

    useEffect(() => {
        if (!incoming || !selected || selected.remaining !== undefined) return;
        let active = true;
        fetchInvoicePayments(selected.id).then(({ dueAmount, payments }) => {
            if (active) setSelected({
                ...selected, remaining: moneyDifference(dueAmount, payments.reduce((total, payment) => total + payment.amount, 0)),
            });
        }).catch((err: Error) => { if (active) setError(err.message); });
        return () => { active = false; };
    }, [incoming, selected]);

    const available = allocations
        ? moneyDifference(transfer.amount, allocations.reduce((total, allocation) => total + allocation.allocatedAmount, 0))
        : 0;
    const inputAmount = amount === '' ? available : Number(amount.replace(',', '.'));
    const requested = Math.min(available, inputAmount);
    const assigned = selected?.remaining === undefined ? 0 : Math.min(requested, selected.remaining);
    const left = moneyDifference(available, assigned);
    const willClamp = incoming && assigned > 0 && assigned < requested;
    const canAssign = !!allocations && available > 0 && transfer.matchingStatus !== 'MANUAL' && transfer.currency === 'PLN';

    async function save() {
        if (!selected || !canAssign || !Number.isFinite(assigned) || assigned <= 0 || inputAmount > available || pending.current) return;
        pending.current = true;
        setBusy(true);
        setError('');
        try {
            const result = await createAllocation(transfer.id, incoming
                ? { invoiceId: selected.id, amount: requested, expectedRemaining: available }
                : { costInvoiceId: selected.id, amount: requested });
            onAssigned(result.allocatedAmount, requested, result.transferRemaining);
            onChanged();
            onHide();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Nie udało się przypisać przelewu');
        } finally {
            pending.current = false;
            setBusy(false);
        }
    }

    async function remove(allocationId: number) {
        if (pending.current) return;
        pending.current = true;
        setBusy(true);
        setError('');
        try {
            await deleteAllocation(transfer.id, allocationId);
            setSelected(undefined);
            setSearch('');
            setAmount('');
            setRevision(value => value + 1);
            onChanged();
            if (transfer.matchingStatus === 'MANUAL' && allocations?.length === 1) onHide();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Nie udało się odpiąć wpłaty');
        } finally {
            pending.current = false;
            setBusy(false);
        }
    }

    return <Modal show onHide={busy ? undefined : onHide} size="lg">
        <Modal.Header closeButton={!busy}>
            <Modal.Title>{canAssign ? 'Przypisz przelew' : 'Przypisania przelewu'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
            <div className="mb-3"><BankTransferDescription transfer={transfer} /></div>
            {error && <Alert variant="danger">{error}</Alert>}
            {!allocations && !error && <Spinner size="sm" animation="border" />}
            {allocations && transfer.matchingStatus === 'MANUAL' && <Alert variant="info">
                {transfer.canRestoreToQueue
                    ? <>Aby przypisać ten wpływ do faktury, wybierz <strong>Przywróć do kolejki</strong> na zakładce „Wszystkie przelewy”.</>
                    : incoming && allocations.length > 0 && transfer.currency === 'PLN'
                        ? <>Najpierw odepnij przypisane wpłaty. Następnie wybierz <strong>Przywróć do kolejki</strong> na zakładce „Wszystkie przelewy”.</>
                        : 'Tego przelewu nie można przypisać do faktury.'}
            </Alert>}
            {!!allocations?.length && <>
                <h6>Przypisane wpłaty</h6>
                <ListGroup className="mb-3">
                    {allocations.map(allocation => <ListGroup.Item key={allocation.id} className="d-flex align-items-center justify-content-between">
                        <div>
                            {allocation.invoiceId ? 'Faktura sprzedaży' : 'Faktura kosztowa'}
                            {allocation.invoiceNumber && ` ${allocation.invoiceNumber}`} · {fmt(allocation.allocatedAmount)}
                        </div>
                        <Button size="sm" variant="outline-danger" disabled={busy}
                            onClick={() => void remove(allocation.id)}>Odepnij</Button>
                    </ListGroup.Item>)}
                </ListGroup>
            </>}
            {canAssign && <>
                <Form.Group controlId="bank-assignment-invoice" className="mb-2">
                    <Form.Label>{incoming ? 'Faktura sprzedaży' : 'Faktura kosztowa'}</Form.Label>
                    <Form.Control type="search" placeholder="Numer faktury lub nazwa kontrahenta"
                        disabled={busy} value={search} onChange={event => {
                            setSelected(undefined);
                            setSearch(event.target.value);
                            setError('');
                        }} />
                </Form.Group>
                {searching && <Spinner size="sm" animation="border" />}
                {!selected && !!options.length && <ListGroup className="mb-3">
                    {options.slice(0, 10).map(option => <ListGroup.Item key={option.id} action
                        onClick={() => {
                            setSelected(option);
                            setSearch(option.number);
                        }}>{option.number} · {option.name}</ListGroup.Item>)}
                </ListGroup>}
                {selected?.remaining !== undefined && <p className="small">
                    {selected.number} · {selected.name} · do zapłaty <strong>{fmt(selected.remaining)}</strong>
                </p>}
                <Form.Group controlId="bank-assignment-amount" className="mb-3">
                    <Form.Label>Kwota do przypisania (zł)</Form.Label>
                    <Form.Control type="number" step="0.01" min="0.01" max={available} disabled={busy}
                        value={amount === '' ? available : amount} onChange={event => setAmount(event.target.value)} />
                    <Form.Text>Z przelewu dostępne {fmt(available)}.</Form.Text>
                </Form.Group>
                {willClamp && <Alert variant="warning">
                    <strong>Przelew jest większy niż zostało do zapłaty.</strong> Na fakturę {selected?.number} trafi {fmt(assigned)}.
                    Pozostałe {fmt(left)} wróci do kolejki „Do decyzji”.
                </Alert>}
                {!incoming && selected?.remaining !== undefined && requested > selected.remaining &&
                    <Alert variant="warning">Zmniejsz kwotę do pozostałej należności faktury kosztowej.</Alert>}
            </>}
        </Modal.Body>
        <Modal.Footer>
            <Button variant="secondary" disabled={busy} onClick={onHide}>{canAssign ? 'Anuluj' : 'Zamknij'}</Button>
            {canAssign && <Button onClick={() => void save()} disabled={busy || !Number.isFinite(assigned) || assigned <= 0 ||
                inputAmount > available || (!incoming && assigned < requested)}>
                {assigned > 0 ? `Przypisz ${fmt(assigned)}` : 'Przypisz'}
            </Button>}
        </Modal.Footer>
    </Modal>;
}
