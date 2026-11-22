import React from 'react';
import { Alert } from 'react-bootstrap';
import { BankTransfer } from '../../../Typings/bussinesTypes';
import ToolsDate from '../../React/Tools/ToolsDate';
import { StatementPeriod } from './BankSyncController';

const amounts = new Intl.NumberFormat('pl-PL', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
    ...{ useGrouping: 'always' } as unknown as Intl.NumberFormatOptions,
});

export function fmt(n: number, currency = 'PLN') {
    return `${amounts.format(n)} ${currency === 'PLN' ? 'zł' : currency}`;
}

export function fmtDate(date?: string | null) {
    return date ? ToolsDate.dateYMDtoDMY(date).replace(/-/g, '.') : '—';
}

export function fmtPeriod(period: StatementPeriod) {
    return `${fmtDate(period.periodFrom)} – ${fmtDate(period.periodTo)}`;
}

export function BankTransferDescription({ transfer, amount = transfer.amount, children }: {
    transfer: BankTransfer;
    amount?: number;
    children?: React.ReactNode;
}) {
    return <>
        <div className="d-flex flex-wrap align-items-baseline gap-2">
            <span>{fmtDate(transfer.execDate)}</span>
            <strong className="text-nowrap">{fmt(amount, transfer.currency)}</strong>
            {children}
        </div>
        <div>{transfer.counterpartyName || (transfer.direction === 'IN' ? 'Brak nazwy nadawcy' : 'Brak nazwy odbiorcy')}</div>
        <div className="text-muted small">{transfer.title ? `Tytuł — „${transfer.title}”` : 'Brak tytułu przelewu'}</div>
    </>;
}

export function StatementGapAlert({ gaps, afterUpload = false }: { gaps: StatementPeriod[]; afterUpload?: boolean }) {
    if (!gaps.length) return null;
    const [first] = gaps;
    return <Alert variant="warning">
        <strong>{afterUpload ? 'Nadal brakuje wyciągu za okres' : 'Brak wyciągu za okres'} {fmtPeriod(first)}.</strong>
        {gaps.length > 1 && <ul className="mb-1">
            {gaps.slice(1).map(gap => <li key={gap.periodFrom}>{fmtPeriod(gap)}</li>)}
        </ul>}
        {!afterUpload && <div>Faktury opłacone w tym okresie nie oznaczą się automatycznie. Wgraj wyciąg obejmujący brakujące dni.</div>}
    </Alert>;
}
