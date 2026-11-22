import React, { useEffect, useRef, useState } from 'react';
import { Alert, Badge, Button, Container, Form, Modal, Spinner, Tab, Table, Tabs } from 'react-bootstrap';
import { BankMatchingCandidate, BankTransfer, DuplicateGroup, PendingBankTransfer, WadiumMatchResult } from '../../../Typings/bussinesTypes';
import FilterableTable from '../../View/Resultsets/FilterableTable/FilterableTable';
import ConfirmModal from '../../View/Modals/ConfirmModal';
import AllocationModal from './AllocationModal';
import BankStatementsTab from './BankStatementsTab';
import DecisionQueue from './DecisionQueue';
import { BankTransferFilterBody } from './BankTransferFilterBody';
import {
    bankTransfersRepository, createAllocation, dismissTransfer, fetchDuplicates, fetchPendingTransfers,
    fetchStatements, fetchWadiumMatches, restoreTransfer, StatementCoverage, UploadPreview, uploadBankStatement,
} from './BankSyncController';
import { BankTransferDescription, fmt, fmtDate, fmtPeriod, StatementGapAlert } from './BankSyncViews';
import './BankSyncSearch.css';

function DirectionBadge({ direction }: { direction: BankTransfer['direction'] }) {
    return direction === 'IN' ? <Badge bg="success">Wpływ</Badge> : <Badge bg="secondary">Wydatek</Badge>;
}

function StatusBadge({ status }: { status: BankTransfer['matchingStatus'] }) {
    const labels = {
        UNMATCHED: ['secondary', 'Bez przypisania'],
        PROPOSED: ['warning', 'Propozycja'],
        CONFIRMED: ['success', 'Przypisany'],
        MANUAL: ['light', 'Poza kolejką'],
    };
    const [bg, label] = labels[status];
    return <Badge bg={bg} text={bg === 'light' || bg === 'warning' ? 'dark' : undefined}>{label}</Badge>;
}

function TransferRow({ transfer }: { transfer: BankTransfer }) {
    return <tr>
        <td><BankTransferDescription transfer={transfer} /></td>
        <td><DirectionBadge direction={transfer.direction} /></td>
        <td><StatusBadge status={transfer.matchingStatus} /></td>
    </tr>;
}

function transferTableHeader() {
    return <thead><tr><th>Przelew</th><th>Kierunek</th><th>Status</th></tr></thead>;
}

function TransfersTab({ onManage, onRestore, refreshKey, busy }: {
    onManage: (transfer: BankTransfer) => void;
    onRestore: (transfer: BankTransfer) => void;
    refreshKey: number;
    busy: boolean;
}) {
    return <FilterableTable<BankTransfer>
        key={refreshKey}
        id="bankTransfers"
        title=""
        repository={bankTransfersRepository}
        FilterBodyComponent={BankTransferFilterBody}
        isDeletable={false}
        isCopyable={false}
        searchOnMount
        snapshotMode="criteria-only"
        tableStructure={[
            { header: 'Przelew', renderTdBody: transfer => <BankTransferDescription transfer={transfer} />, colMd: 6 },
            { header: 'Kierunek', renderTdBody: transfer => <DirectionBadge direction={transfer.direction} />, colMd: 2 },
            { header: 'Status', renderTdBody: transfer => <StatusBadge status={transfer.matchingStatus} />, colMd: 2 },
            { header: '', renderTdBody: transfer => <div className="d-flex flex-wrap gap-1">
                <Button size="sm" variant="outline-secondary" onClick={() => onManage(transfer)}>Przypisania</Button>
                {transfer.canRestoreToQueue && <Button size="sm" variant="outline-primary" disabled={busy}
                    onClick={() => onRestore(transfer)}>Przywróć do kolejki</Button>}
            </div>, colMd: 2 },
        ]}
    />;
}

function DuplicatesTab() {
    const [groups, setGroups] = useState<DuplicateGroup[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const loaded = useRef(false);

    useEffect(() => {
        if (loaded.current) return;
        loaded.current = true;
        setLoading(true);
        fetchDuplicates()
            .then(setGroups)
            .catch(e => setError(e instanceof Error ? e.message : 'Błąd'))
            .finally(() => setLoading(false));
    }, []);

    if (loading) return <div className="text-center py-4"><Spinner animation="border" /></div>;
    if (error) return <Alert variant="danger">{error}</Alert>;
    if (groups.length === 0) return <Alert variant="success">Brak duplikatów przelewów.</Alert>;

    return (
        <div>
            <Alert variant="warning" className="mb-3">
                Znaleziono <strong>{groups.length}</strong> grup potencjalnych duplikatów.
            </Alert>
            {groups.map(group => (
                <div key={`${group.type}-${group.signal}`} className="mb-4 border rounded p-3">
                    <div className="mb-2">
                        <Badge bg={group.type === 'COUNTERPARTY' ? 'primary' : 'warning'} className="me-2">
                            {group.type === 'COUNTERPARTY' ? 'Kontrahent + kwota' : 'Nr faktury'}
                        </Badge>
                        <strong>{group.signal}</strong>
                        <span className="text-muted ms-2">({group.transfers.length} przelewy)</span>
                    </div>
                    <Table size="sm" className="mb-0">
                        {transferTableHeader()}
                        <tbody>
                            {group.transfers.map(t => <TransferRow key={t.id} transfer={t} />)}
                        </tbody>
                    </Table>
                </div>
            ))}
        </div>
    );
}

/* ------------------------------------------------------------------ */
/* Wadium tab                                                           */
/* ------------------------------------------------------------------ */

function WadiumTab() {
    const [matches, setMatches] = useState<WadiumMatchResult[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const loaded = useRef(false);

    useEffect(() => {
        if (loaded.current) return;
        loaded.current = true;
        setLoading(true);
        fetchWadiumMatches()
            .then(setMatches)
            .catch(e => setError(e instanceof Error ? e.message : 'Błąd'))
            .finally(() => setLoading(false));
    }, []);

    if (loading) return <div className="text-center py-4"><Spinner animation="border" /></div>;
    if (error) return <Alert variant="danger">{error}</Alert>;
    if (matches.length === 0) return <Alert variant="info">Brak wadiów gotówkowych do weryfikacji.</Alert>;

    const returned = matches.filter(m => m.isReturned);
    const pending  = matches.filter(m => !m.isReturned);

    return (
        <div>
            <p className="text-muted mb-3">
                Wadium gotówkowe: <strong>{matches.length}</strong>
                &nbsp;|&nbsp; Zwrócone: <strong>{returned.length}</strong>
                &nbsp;|&nbsp; Oczekują zwrotu: <strong>{pending.length}</strong>
            </p>

            {matches.map(m => {
                const bond = m.bond;
                return (
                    <div key={bond.id} className={`mb-4 border rounded p-3 ${m.isReturned ? 'border-success' : 'border-warning'}`}>
                        <div className="d-flex justify-content-between align-items-start mb-2">
                            <div>
                                <strong>{bond.offerAlias ?? 'Oferta'}</strong>
                                <span className="ms-2 text-muted">Wadium</span>
                            </div>
                            <div className="d-flex gap-2 align-items-center">
                                <span className="fw-semibold">{fmt(bond.value)}</span>
                                {m.isReturned
                                    ? <Badge bg="success">Zwrócone</Badge>
                                    : <Badge bg="warning" text="dark">Do zwrotu</Badge>
                                }
                                <Badge bg="secondary">{bond.status}</Badge>
                            </div>
                        </div>
                        {bond.expiryDate && (
                            <small className="text-muted d-block mb-2">Ważne do: {fmtDate(bond.expiryDate)}</small>
                        )}
                        {m.matchingTransfers.length === 0
                            ? <Alert variant="secondary" className="py-1 mb-0 small">
                                Brak pasujących przelewów przychodzących z "wadium" w opisie.
                              </Alert>
                            : <>
                                <small className="text-muted fw-semibold d-block mb-1">
                                    Pasujące przelewy ({m.matchingTransfers.length}):
                                </small>
                                <Table size="sm" className="mb-0">
                                    {transferTableHeader()}
                                    <tbody>
                                        {m.matchingTransfers.map(t => <TransferRow key={t.id} transfer={t} />)}
                                    </tbody>
                                </Table>
                              </>
                        }
                    </div>
                );
            })}
        </div>
    );
}


function UploadModal({ onHide, onUploaded, onShowPending }: {
    onHide: () => void;
    onUploaded: () => void;
    onShowPending: (statementId: number) => void;
}) {
    const [file, setFile] = useState<File>();
    const [uploading, setUploading] = useState(false);
    const [preview, setPreview] = useState<UploadPreview>();
    const [error, setError] = useState('');

    async function upload() {
        if (!file || uploading) return;
        setUploading(true);
        setError('');
        try {
            setPreview(await uploadBankStatement(file));
            onUploaded();
        } catch (e) {
            setError(e instanceof Error ? e.message : 'Nie udało się wgrać wyciągu');
        } finally {
            setUploading(false);
        }
    }

    const summary = preview ? [
        ['Operacje w pliku', preview.total + preview.alreadyKnown],
        ['Już znane z wcześniejszych wyciągów', preview.alreadyKnown],
        ['Nowe operacje', preview.total],
        ['Wpływy przypisane automatycznie', preview.incomeMatched],
        ['Wpływy czekające na decyzję', preview.incomePending],
        ['Przelewy własne', preview.ownTransfers],
        ['Wydatki', preview.expenses],
        ['Opłaty bankowe', preview.fees],
        ...(preview.otherIncoming ? [['Pozostałe wpływy poza kolejką', preview.otherIncoming]] : []),
    ] : [];

    return <Modal show onHide={uploading ? undefined : onHide}>
        <Modal.Header closeButton={!uploading}>
            <Modal.Title>{preview ? 'Wyciąg wgrany' : 'Wgraj wyciąg bankowy'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
            {error && <Alert variant="danger">{error}</Alert>}
            {preview ? <>
                <p className="text-muted small">{file?.name} · okres {fmtPeriod(preview)}</p>
                <Table size="sm">
                    <tbody>{summary.map(([label, value], index) => <tr key={label} className={index === 2 || index === 4 ? 'fw-bold' : ''}>
                        <th className={index === 2 || index === 4 ? 'ps-2' : 'fw-normal'} scope="row">{label}</th>
                        <td className="text-end">{value}</td>
                    </tr>)}</tbody>
                </Table>
                <StatementGapAlert gaps={preview.gaps} afterUpload />
            </> : <Form.Group controlId="bank-statement-file">
                <Form.Label>Plik XML z PKO BP</Form.Label>
                <Form.Control type="file" accept=".xml" disabled={uploading}
                    onChange={event => setFile((event.target as HTMLInputElement).files?.[0])} />
            </Form.Group>}
        </Modal.Body>
        <Modal.Footer>
            <Button variant="secondary" onClick={onHide} disabled={uploading}>{preview ? 'Zamknij' : 'Anuluj'}</Button>
            {!preview && <Button onClick={upload} disabled={!file || uploading}>{uploading ? 'Wgrywam…' : 'Wgraj wyciąg'}</Button>}
            {!!preview?.incomePending && <Button onClick={() => onShowPending(preview.statementId)}>
                Przejdź do decyzji ({preview.incomePending})
            </Button>}
        </Modal.Footer>
    </Modal>;
}

export default function BankSyncSearch({ title }: { title: string }) {
    const [showUpload, setShowUpload] = useState(false);
    const [refreshKey, setRefreshKey] = useState(0);
    const [queueKey, setQueueKey] = useState(0);
    const [activeTab, setActiveTab] = useState('pending');
    const [statementId, setStatementId] = useState('');
    const [coverage, setCoverage] = useState<StatementCoverage[]>();
    const [transfers, setTransfers] = useState<PendingBankTransfer[]>();
    const [coverageError, setCoverageError] = useState('');
    const [queueError, setQueueError] = useState('');
    const [managed, setManaged] = useState<BankTransfer>();
    const [dismissal, setDismissal] = useState<PendingBankTransfer>();
    const [busy, setBusy] = useState<number | null>(null);
    const [notice, setNotice] = useState<{ error?: boolean; text: string }>();
    const running = useRef(false);

    useEffect(() => { document.title = title; }, [title]);

    useEffect(() => {
        let active = true;
        setCoverageError('');
        setQueueError('');
        fetchPendingTransfers().then(items => { if (active) setTransfers(items); }).catch((error: Error) => {
            if (active) { setTransfers(undefined); setQueueError(error.message); }
        });
        fetchStatements().then(items => { if (active) setCoverage(items); }).catch((error: Error) => {
            if (active) { setCoverage(undefined); setCoverageError(error.message); }
        });
        return () => { active = false; };
    }, [refreshKey]);

    function refresh() {
        setRefreshKey(key => key + 1);
    }

    function showPending(id: number) {
        setShowUpload(false);
        setStatementId(String(id));
        setQueueKey(key => key + 1);
        setActiveTab('pending');
    }

    function reportAssignment(amount: number, requested: number, remaining?: number) {
        const parts = [`Przypisano ${fmt(amount)}.`];
        if (amount < requested) parts.push('Kwotę ograniczono do pozostałej należności faktury.');
        if (remaining) parts.push(`Pozostałe ${fmt(remaining)} czeka w kolejce „Do decyzji”.`);
        setNotice({ text: parts.join(' ') });
    }

    async function changeTransfer(id: number, action: () => Promise<void>) {
        if (running.current) return;
        running.current = true;
        setBusy(id);
        setNotice(undefined);
        try {
            await action();
        } finally {
            // The remounted list must not reuse an in-flight search from before the decision.
            await Promise.allSettled(bankTransfersRepository.pendingRequests.values());
            refresh();
            running.current = false;
            setBusy(null);
        }
    }

    function reportDecisionError(error: unknown) {
        setNotice({ error: true, text: error instanceof Error ? error.message : 'Nie udało się zapisać decyzji' });
    }

    function approve(transfer: PendingBankTransfer, candidate: BankMatchingCandidate) {
        void changeTransfer(transfer.id, async () => {
            const result = await createAllocation(transfer.id, {
                invoiceId: candidate.invoiceId, amount: transfer.remainingAmount, expectedRemaining: transfer.remainingAmount,
            });
            reportAssignment(result.allocatedAmount, transfer.remainingAmount, result.transferRemaining);
        }).catch(reportDecisionError);
    }

    function restore(transfer: BankTransfer) {
        void changeTransfer(transfer.id, async () => {
            await restoreTransfer(transfer.id);
            setNotice({ text: 'Wpływ wrócił do kolejki „Do decyzji”.' });
        }).catch(reportDecisionError);
    }

    return <Container className="mt-3">
        <div className="d-flex flex-wrap gap-2 justify-content-between align-items-center mb-3">
            <h4 className="mb-0">{title}</h4>
            <Button variant="outline-primary" onClick={() => setShowUpload(true)}>Wgraj wyciąg (plik z PKO BP)</Button>
        </div>
        {notice && <Alert variant={notice.error ? 'danger' : 'success'} dismissible onClose={() => setNotice(undefined)}>{notice.text}</Alert>}
        {showUpload && <UploadModal onHide={() => setShowUpload(false)} onUploaded={refresh} onShowPending={showPending} />}
        {managed && <AllocationModal transfer={managed} onHide={() => setManaged(undefined)}
            onChanged={refresh} onAssigned={reportAssignment} />}
        {dismissal && <ConfirmModal show lockWhileWaiting onClose={() => setDismissal(undefined)} title="Usuń wpływ z kolejki?"
            prompt={<>
                <BankTransferDescription transfer={dismissal} amount={dismissal.remainingAmount} />
                <p className="mt-3 mb-0">Wpływ można później przywrócić na zakładce „Wszystkie przelewy”.
                    Jeśli ma przypisane wpłaty, trzeba je najpierw odpiąć.</p>
            </>}
            confirmLabel="Usuń z kolejki" onConfirm={() => changeTransfer(dismissal.id, async () => {
                await dismissTransfer(dismissal.id, dismissal.remainingAmount);
                setNotice({ text: 'Wpływ został usunięty z kolejki decyzji.' });
            })} />}
        <Tabs activeKey={activeTab} onSelect={key => key && setActiveTab(key)} className="mb-3" mountOnEnter>
            <Tab eventKey="pending" title={transfers ? `Do decyzji (${transfers.length})` : 'Do decyzji'}>
                {queueError ? <Alert variant="danger">{queueError}</Alert> : !transfers ? <Spinner animation="border" /> :
                    <DecisionQueue key={queueKey} transfers={transfers} statements={coverage?.flatMap(account => account.statements) ?? []}
                        statementId={statementId} onStatementChange={setStatementId} onManage={setManaged}
                        onApprove={approve} onDismiss={setDismissal} busy={busy} />}
            </Tab>
            <Tab eventKey="transfers" title="Wszystkie przelewy">
                <TransfersTab onManage={setManaged} onRestore={restore} refreshKey={refreshKey} busy={busy !== null} />
            </Tab>
            <Tab eventKey="statements" title="Wyciągi">
                {coverageError ? <Alert variant="danger">{coverageError}</Alert> : !coverage ? <Spinner animation="border" /> :
                    !coverage.length ? <p className="text-muted">Brak wgranych wyciągów.</p> : coverage.map(account =>
                        <section key={account.accountNumber} className="mb-4">
                            {coverage.length > 1 && <h5>Rachunek …{account.accountNumber.slice(-8)}</h5>}
                            <BankStatementsTab coverage={account} onShowPending={showPending} />
                        </section>)}
            </Tab>
            <Tab eventKey="duplicates" title="Duplikaty"><DuplicatesTab key={refreshKey} /></Tab>
            <Tab eventKey="wadium" title="Wadium"><WadiumTab key={refreshKey} /></Tab>
        </Tabs>
    </Container>;
}
