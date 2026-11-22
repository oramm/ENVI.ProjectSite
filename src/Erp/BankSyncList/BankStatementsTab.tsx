import React from 'react';
import { Badge, Button, Table } from 'react-bootstrap';
import { StatementCoverage } from './BankSyncController';
import { fmtDate, fmtPeriod, StatementGapAlert } from './BankSyncViews';

const MONTHS = ['sty', 'lut', 'mar', 'kwi', 'maj', 'cze', 'lip', 'sie', 'wrz', 'paź', 'lis', 'gru'];

export default function BankStatementsTab({ coverage, onShowPending }: {
    coverage: StatementCoverage;
    onShowPending: (statementId: number) => void;
}) {
    const { statements, months, gaps } = coverage;
    if (!statements.length) return <p className="text-muted">Brak wgranych wyciągów.</p>;
    const byMonth = new Map(months.map(month => [month.month, month]));
    const years = [...new Set(months.map(month => month.month.slice(0, 4)))];
    const rows = [
        ...statements.map(statement => ({ period: statement, key: `statement-${statement.id}`, statement })),
        ...gaps.map(gap => ({ period: gap, key: `gap-${gap.periodFrom}`, statement: null })),
    ].sort((a, b) => b.period.periodTo.localeCompare(a.period.periodTo));

    return <>
        <StatementGapAlert gaps={gaps} />
        <div className="table-responsive mb-3" aria-label="Oś miesięcy">
            {years.map(year => <div key={year} className="mb-2">
                <h6>{year}</h6>
                <div className="bank-sync-months">
                    {MONTHS.map((label, index) => {
                        const month = byMonth.get(`${year}-${String(index + 1).padStart(2, '0')}`);
                        return <div key={label} className="text-center border rounded py-1 small">
                            {month?.status === 'missing' ? <Badge bg="warning" text="dark">{label} — brak</Badge>
                                : month?.status === 'partial' ? <Badge bg="warning" text="dark"
                                    title={`Niepełny miesiąc. Ostatni dzień ujęty w wyciągu: ${fmtDate(month.coveredThrough)}`}>
                                    {label} — część
                                </Badge>
                                : month?.status === 'covered' ? <Badge bg="primary">{label}<span className="visually-hidden"> — wgrano</span></Badge>
                                : <span className="text-muted">{label}</span>}
                        </div>;
                    })}
                </div>
            </div>)}
        </div>
        <Table responsive hover>
            <thead><tr><th>Okres</th><th>Plik</th><th>Wgrano</th><th className="text-end">Nowe operacje</th>
                <th className="text-end">Do decyzji</th></tr></thead>
            <tbody>{rows.map(({ key, period, statement }) => statement ? <tr key={key}>
                <td className="text-nowrap">{fmtPeriod(period)}</td>
                <td>{statement.fileName}</td>
                <td>{fmtDate(statement.importedAt)}{statement.importedByName && ` · ${statement.importedByName}`}</td>
                <td className="text-end">{statement.newOperations}</td>
                <td className="text-end">{statement.pendingTransfers ? <Button variant="link" size="sm" className="p-0"
                    aria-label={`Do decyzji z wyciągu ${fmtPeriod(period)}: ${statement.pendingTransfers}`}
                    onClick={() => onShowPending(statement.id)}>{statement.pendingTransfers}</Button> : 0}</td>
            </tr> : <tr key={key} className="table-warning">
                <td className="text-nowrap">{fmtPeriod(period)}</td><td colSpan={4}>Brak wyciągu</td>
            </tr>)}</tbody>
        </Table>
    </>;
}
