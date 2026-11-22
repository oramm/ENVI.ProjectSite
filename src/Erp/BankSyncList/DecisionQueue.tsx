import React, { useState } from 'react';
import { Badge, Button, Form, Table } from 'react-bootstrap';
import { BankMatchingCandidate, BankStatement, PendingBankTransfer } from '../../../Typings/bussinesTypes';
import { BankTransferDescription, fmt, fmtDate, fmtPeriod } from './BankSyncViews';

function category(transfer: PendingBankTransfer) {
    if (transfer.matchingStatus !== 'PROPOSED') return 'none';
    return transfer.matchingCandidates.length > 1 ? 'choice' : 'proposal';
}

const labels = { proposal: 'Propozycja', choice: 'Do wyboru', none: 'Bez propozycji' };

function CandidateDescription({ candidate }: { candidate: BankMatchingCandidate }) {
    const numberMatch = candidate.flags?.includes('INVOICE_NUMBER');
    const amountMatch = candidate.flags?.includes('EQUAL_AMOUNT');
    const paid = candidate.grossAmount !== undefined && candidate.remainingAmount !== undefined
        ? candidate.grossAmount - candidate.remainingAmount : 0;
    const correction = candidate.grossAmount === undefined || candidate.originalAmount === undefined
        ? 0 : Math.round((candidate.grossAmount - candidate.originalAmount) * 100) / 100;
    return <>
        <strong>Faktura {candidate.invoiceNumber}</strong>
        {candidate.entityName && ` · ${candidate.entityName}`}
        {candidate.contractNumber && ` · umowa ${candidate.contractNumber}`}
        {candidate.originalAmount !== undefined && candidate.grossAmount !== undefined && correction !== 0 && <div>
            Należność z korektami {fmt(candidate.originalAmount)} {correction < 0 ? '−' : '+'}{' '}
            {fmt(Math.abs(correction))} = <strong>{fmt(candidate.grossAmount)}</strong>
        </div>}
        <div>
            {candidate.remainingAmount !== undefined && <>Do zapłaty <strong>{fmt(candidate.remainingAmount)}</strong></>}
            {candidate.paymentDeadline && ` · termin ${fmtDate(candidate.paymentDeadline)}`}
            {paid > 0 && ` · wpłacono już ${fmt(paid)}`}
        </div>
        {(numberMatch || amountMatch) && <div className="text-muted small">
            {[numberMatch && 'Numer faktury zgadza się z danymi przelewu', amountMatch && 'Kwota odpowiada pozostałej należności']
                .filter(Boolean).join('. ')}.
        </div>}
    </>;
}

interface QueueProps {
    transfers: PendingBankTransfer[];
    statements: BankStatement[];
    statementId: string;
    onStatementChange: (value: string) => void;
    onManage: (transfer: PendingBankTransfer) => void;
    onApprove: (transfer: PendingBankTransfer, candidate: BankMatchingCandidate) => void;
    onDismiss: (transfer: PendingBankTransfer) => void;
    busy: number | null;
}

export default function DecisionQueue({
    transfers, statements, statementId, onStatementChange, onManage, onApprove, onDismiss, busy,
}: QueueProps) {
    const [kind, setKind] = useState('all');
    const [dateFrom, setDateFrom] = useState('');
    const [dateTo, setDateTo] = useState('');
    const [search, setSearch] = useState('');
    const text = search.trim().toLocaleLowerCase('pl-PL');
    const rows = transfers.filter(transfer => {
        return (!statementId || transfer.bankStatementId === Number(statementId))
            && (kind === 'all' || category(transfer) === kind)
            && (!dateFrom || transfer.execDate >= dateFrom)
            && (!dateTo || transfer.execDate <= dateTo)
            && (!text || [transfer.counterpartyName, transfer.title, fmt(transfer.remainingAmount), String(transfer.remainingAmount)]
                .some(value => value?.toLocaleLowerCase('pl-PL').includes(text)));
    });
    const counts = { proposal: 0, choice: 0, none: 0 };
    for (const row of rows) counts[category(row)]++;

    return <>
        <div className="d-flex flex-wrap gap-3 mb-3">
            <Form.Group controlId="bank-queue-kind">
                <Form.Label>Pokaż</Form.Label>
                <Form.Select size="sm" value={kind} onChange={event => setKind(event.target.value)}>
                    <option value="all">Wszystkie do decyzji</option>
                    <option value="proposal">Z propozycją</option>
                    <option value="choice">Do wyboru z kilku faktur</option>
                    <option value="none">Bez propozycji</option>
                </Form.Select>
            </Form.Group>
            <Form.Group controlId="bank-queue-statement">
                <Form.Label>Z wyciągu</Form.Label>
                <Form.Select size="sm" value={statementId} onChange={event => onStatementChange(event.target.value)}>
                    <option value="">Wszystkie wyciągi</option>
                    {statements.map(statement => <option key={statement.id} value={statement.id}>{fmtPeriod(statement)}</option>)}
                </Form.Select>
            </Form.Group>
            <Form.Group controlId="bank-queue-date-from">
                <Form.Label>Data przelewu od</Form.Label>
                <Form.Control size="sm" type="date" value={dateFrom} onChange={event => setDateFrom(event.target.value)} />
            </Form.Group>
            <Form.Group controlId="bank-queue-date-to">
                <Form.Label>do</Form.Label>
                <Form.Control size="sm" type="date" value={dateTo} onChange={event => setDateTo(event.target.value)} />
            </Form.Group>
            <Form.Group controlId="bank-queue-search">
                <Form.Label>Szukaj nadawcy, tytułu lub kwoty</Form.Label>
                <Form.Control size="sm" type="search" value={search} onChange={event => setSearch(event.target.value)} />
            </Form.Group>
        </div>
        {rows.length === 0 ? <p className="text-muted">Brak wpływów do decyzji dla wybranych filtrów.</p> : <>
            <p className="small">
                Do decyzji <strong>{rows.length}</strong> · z propozycją {counts.proposal} · do wyboru {counts.choice} ·
                {' '}bez propozycji {counts.none}. Najstarszy wpływ z {fmtDate(rows[rows.length - 1].execDate)}.
            </p>
            <Table responsive hover>
                <thead><tr>
                    <th>Przelew</th><th>Faktura, którą proponuje system</th><th><span className="visually-hidden">Działania</span></th>
                </tr></thead>
                <tbody>{rows.map(transfer => <DecisionRow key={transfer.id} {...{
                    transfer, statement: statements.find(statement => statement.id === transfer.bankStatementId),
                    onManage, onApprove, onDismiss, disabled: busy !== null,
                }} />)}</tbody>
            </Table>
            <p className="text-muted small">Przelewy własne znajdziesz na zakładce „Wszystkie przelewy”.</p>
        </>}
    </>;
}

function DecisionRow({ transfer, statement, onManage, onApprove, onDismiss, disabled }: {
    transfer: PendingBankTransfer;
    statement?: BankStatement;
    onManage: QueueProps['onManage'];
    onApprove: QueueProps['onApprove'];
    onDismiss: QueueProps['onDismiss'];
    disabled: boolean;
}) {
    const [selected, setSelected] = useState<number>();
    const kind = category(transfer);
    const [first] = transfer.matchingCandidates;
    const candidate = kind === 'choice'
        ? transfer.matchingCandidates.find(item => item.invoiceId === selected)
        : kind === 'proposal' ? first : undefined;

    return <tr>
        <td className="w-25">
            <BankTransferDescription transfer={transfer} amount={transfer.remainingAmount}>
                <Badge bg={kind === 'none' ? 'secondary' : 'warning'} text={kind === 'none' ? undefined : 'dark'}>{labels[kind]}</Badge>
            </BankTransferDescription>
            {transfer.remainingAmount < transfer.amount && <div className="text-muted small">
                Pozostało z przelewu na {fmt(transfer.amount, transfer.currency)}
            </div>}
            {statement && <div className="text-muted small">Wyciąg {fmtPeriod(statement)}</div>}
        </td>
        <td>
            {kind === 'choice' ? <fieldset>
                <legend className="fs-6">Pasuje kilka faktur. Wybierz, którą zapłacono.</legend>
                {transfer.matchingCandidates.map(item => <Form.Check
                    key={item.invoiceId} type="radio" name={`bank-candidate-${transfer.id}`}
                    id={`bank-candidate-${transfer.id}-${item.invoiceId}`}
                    label={<CandidateDescription candidate={item} />}
                    checked={selected === item.invoiceId}
                    onChange={() => setSelected(item.invoiceId)}
                    disabled={disabled}
                />)}
            </fieldset> : kind === 'proposal' ? <CandidateDescription candidate={first} /> : <>
                <div className="text-muted">System nie znalazł wystarczająco pewnego dopasowania.</div>
                {first && <div className="mt-1">Najbliższe dopasowanie <CandidateDescription candidate={first} /></div>}
            </>}
        </td>
        <td className="text-end">
            {kind !== 'none' && <Button size="sm" variant="success" disabled={disabled || !candidate}
                onClick={() => candidate && onApprove(transfer, candidate)}>Zatwierdź</Button>}
            {kind === 'choice' && !candidate && <div className="text-muted small">Najpierw wybierz fakturę</div>}
            <div><Button size="sm" className="mt-1 text-nowrap" variant="outline-secondary" disabled={disabled}
                onClick={() => onManage(transfer)}>{kind === 'none' ? 'Przypisz ręcznie…' : 'Inna faktura…'}</Button></div>
            {kind === 'none' && <Button size="sm" variant="link" disabled={disabled}
                onClick={() => onDismiss(transfer)}>To nie zapłata faktury</Button>}
        </td>
    </tr>;
}
