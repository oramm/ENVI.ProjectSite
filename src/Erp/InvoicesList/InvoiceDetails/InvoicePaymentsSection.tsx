import React, { useEffect, useRef, useState } from 'react';
import { Alert, Button, Spinner, Table } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { Invoice } from '../../../../Typings/bussinesTypes';
import {
    deleteAllocation, fetchInvoicePayments, InvoicePayments, undoManualPayment,
} from '../../BankSyncList/BankSyncController';
import { fmt, fmtDate } from '../../BankSyncList/BankSyncViews';
import { invoicesRepository } from '../InvoicesController';

const paymentStatusLabels = {
    UNPAID: 'Niezapłacona',
    PARTIALLY_PAID: 'Częściowo zapłacona',
    PAID: 'Zapłacona',
    NOT_APPLICABLE: 'Nie dotyczy',
};

export default function InvoicePaymentsSection({ invoice, onInvoiceChange }: {
    invoice: Invoice;
    onInvoiceChange: (invoice: Invoice) => void;
}) {
    const [details, setDetails] = useState<InvoicePayments>();
    const [error, setError] = useState('');
    const [busy, setBusy] = useState(false);
    const [revision, setRevision] = useState(0);
    const pending = useRef(false);
    const mounted = useRef(true);

    useEffect(() => {
        mounted.current = true;
        return () => { mounted.current = false; };
    }, []);

    useEffect(() => {
        if (invoice.correctedInvoiceId) return;
        let active = true;
        fetchInvoicePayments(invoice.id).then(data => { if (active) setDetails(data); })
            .catch((err: Error) => {
                if (active) { setDetails(undefined); setError(err.message); }
            });
        return () => { active = false; };
    }, [invoice.id, invoice.correctedInvoiceId, revision]);

    async function update(remove?: { bankTransferId: number; id: number }) {
        if (pending.current) return;
        pending.current = true;
        setBusy(true);
        setError('');
        try {
            if (remove) await deleteAllocation(remove.bankTransferId, remove.id);
            else await undoManualPayment(invoice.id);
            if (!mounted.current) return;
            setRevision(value => value + 1);
            const invoices: Invoice[] = await invoicesRepository.loadItemsFromServerPOST([{ id: invoice.id }]);
            const updated = invoices.find(item => item.id === invoice.id);
            if (mounted.current && updated) {
                invoicesRepository.addToCurrentItems(invoice.id);
                onInvoiceChange(updated);
            }
        } catch (err) {
            if (mounted.current) setError(err instanceof Error ? err.message : 'Nie udało się zmienić wpłat');
        } finally {
            pending.current = false;
            if (mounted.current) setBusy(false);
        }
    }

    const paid = details?.payments.reduce((sum, payment) => sum + payment.amount, 0) ?? 0;
    const remaining = invoice.paymentStatus === 'PAID' ? 0
        : Math.max(0, (Math.round((details?.dueAmount ?? 0) * 100) - Math.round(paid * 100)) / 100);
    const beforeSystem = details?.paidManually === 1;
    const byButton = details?.paidManually === 2;
    const gross = invoice._totalGrossValue;
    const correction = gross !== undefined && details ? Math.round((details.dueAmount - gross) * 100) / 100 : 0;

    return <section className="border-top mt-3 pt-3" aria-label="Wpłaty">
        <h5>Wpłaty</h5>
        {error && <Alert variant="danger">{error}</Alert>}
        {invoice.correctedInvoiceId ? <Link to={`/invoice/${invoice.correctedInvoiceId}`}>
            Zobacz wpłaty na fakturze oryginalnej
        </Link> : details ? <>
            {invoice.paymentStatus && <p className="mb-2">Stan zapłaty <strong>{paymentStatusLabels[invoice.paymentStatus]}</strong></p>}
            {beforeSystem && <Alert variant="secondary" className="py-2">
                Oznaczona jako zapłacona przed zapisywaniem wpłat z wyciągów. Tego oznaczenia nie można cofnąć.
            </Alert>}
            {(details.payments.length > 0 || byButton) ? <Table size="sm" responsive>
                <thead><tr><th>Data</th><th className="text-end pe-3">Kwota</th><th>Skąd</th>
                    <th><span className="visually-hidden">Działania</span></th></tr></thead>
                <tbody>
                    {details.payments.map(payment => <tr key={payment.id}>
                        <td className="text-nowrap">{fmtDate(payment.date)}</td>
                        <td className="text-end text-nowrap pe-3">{fmt(payment.amount, payment.currency)}</td>
                        <td>{payment.sender || 'Wyciąg bankowy'}{payment.title && <div className="text-muted small">{payment.title}</div>}</td>
                        <td className="text-end"><Button size="sm" disabled={busy} variant="outline-danger"
                            aria-label={`Odepnij wpłatę ${fmt(payment.amount, payment.currency)} z ${fmtDate(payment.date)}`}
                            onClick={() => void update(payment)}>Odepnij</Button></td>
                    </tr>)}
                    {byButton && <tr><td>—</td><td className="text-end pe-3">—</td><td colSpan={2}>Oznaczona jako zapłacona przyciskiem</td></tr>}
                </tbody>
            </Table> : <p className="text-muted small">Brak przypisanych przelewów.</p>}
            <div>Do zapłaty {gross !== undefined && !!correction && <>
                {fmt(gross)} {correction < 0 ? '−' : '+'} {fmt(Math.abs(correction))} (korekty) ={' '}
            </>}<strong>{fmt(details.dueAmount)}</strong></div>
            <div>{beforeSystem || byButton ? 'Wpłaty z wyciągów' : 'Razem wpłacono'}{' '}
                <strong>{(beforeSystem || byButton) && !paid ? 'nieznane' : fmt(paid)}</strong> · Zostało <strong>{fmt(remaining)}</strong>
            </div>
            {!beforeSystem && !byButton && invoice.paymentStatus === 'PAID' && invoice.paymentDate &&
                <p className="text-muted small">Zapłacona {fmtDate(invoice.paymentDate)}, w dniu ostatniej wpłaty.</p>}
            {byButton && <div className="d-flex flex-wrap align-items-center justify-content-between gap-2 mt-2">
                <span className="text-muted small">Pełna wpłata z wyciągu zastąpi oznaczenie przyciskiem.</span>
                <Button size="sm" disabled={busy} variant="outline-danger" onClick={() => void update()}>Cofnij oznaczenie</Button>
            </div>}
        </> : !error && <Spinner size="sm" animation="border" />}
    </section>;
}
