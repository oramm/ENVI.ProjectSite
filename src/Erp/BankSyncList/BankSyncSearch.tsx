import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
    Alert,
    Badge,
    Button,
    Container,
    Form,
    Modal,
    Spinner,
    Tab,
    Table,
    Tabs,
} from 'react-bootstrap';
import { BankTransfer, DuplicateGroup, WadiumMatchResult } from '../../../Typings/bussinesTypes';
import ToolsDate from '../../React/Tools/ToolsDate';
import Tools from '../../React/Tools/Tools';
import {
    bankTransfersRepository,
    commitStatement,
    fetchDuplicates,
    fetchPendingTransfers,
    fetchWadiumMatches,
    UploadPreview,
    uploadBankStatement,
} from './BankSyncController';
import AllocationModal from './AllocationModal';
import FilterableTable from '../../View/Resultsets/FilterableTable/FilterableTable';
import { BankTransferFilterBody } from './BankTransferFilterBody';
import './BankSyncSearch.css';

/* ------------------------------------------------------------------ */
/* Shared helpers                                                       */
/* ------------------------------------------------------------------ */

function DirectionBadge({ direction }: { direction: string }) {
    return direction === 'IN'
        ? <Badge bg="success">↓ IN</Badge>
        : <Badge bg="danger">↑ OUT</Badge>;
}

function StatusBadge({ status }: { status: string }) {
    const map: Record<string, [string, string]> = {
        UNMATCHED: ['secondary', 'Nierozliczone'],
        PROPOSED:  ['warning',   'Proponowane'],
        CONFIRMED: ['success',   'Potwierdzone'],
        MANUAL:    ['info',      'Ręczne'],
    };
    const [bg, label] = map[status] ?? ['light', status];
    return <Badge bg={bg}>{label}</Badge>;
}

function fmt(n: number, currency = 'PLN') {
    return `${Tools.formatNumber(n)} ${currency}`;
}

function fmtDate(d: string | null) {
    return d ? ToolsDate.dateYMDtoDMY(d) : '-';
}

/* ------------------------------------------------------------------ */
/* TransferRow — reusable row with optional "Alokacje" button          */
/* ------------------------------------------------------------------ */

interface TransferRowProps {
    transfer: BankTransfer;
    onManage?: (t: BankTransfer) => void;
    showActions?: boolean;
}

function TransferRow({ transfer, onManage, showActions = false }: TransferRowProps) {
    return (
        <tr>
            <td className="text-nowrap">{fmtDate(transfer.execDate)}</td>
            <td><DirectionBadge direction={transfer.direction} /></td>
            <td className="text-end text-nowrap fw-semibold">
                {fmt(transfer.amount, transfer.currency)}
            </td>
            <td style={{ minWidth: 120, maxWidth: 200 }}>
                {transfer.counterpartyName ?? '-'}
            </td>
            <td style={{ minWidth: 160 }}>
                <small>{transfer.description ?? '-'}</small>
            </td>
            <td><StatusBadge status={transfer.matchingStatus} /></td>
            {showActions && (
                <td>
                    <Button
                        size="sm"
                        variant="outline-secondary"
                        onClick={() => onManage?.(transfer)}
                    >
                        Alokacje
                    </Button>
                </td>
            )}
        </tr>
    );
}

function transferTableHeader(showActions: boolean) {
    return (
        <thead>
            <tr>
                <th>Data</th>
                <th>Kier.</th>
                <th className="text-end">Kwota</th>
                <th>Kontrahent</th>
                <th>Opis</th>
                <th>Status</th>
                {showActions && <th></th>}
            </tr>
        </thead>
    );
}

/* ------------------------------------------------------------------ */
/* Transfers tab — standard FilterableTable pattern                    */
/* ------------------------------------------------------------------ */

function TransfersTab({ onRefresh }: { onRefresh?: () => void }) {
    const [managed, setManaged] = useState<BankTransfer | null>(null);
    const [externalUpdate, setExternalUpdate] = useState(0);

    function handleAllocChanged() {
        setManaged(null);
        setExternalUpdate(k => k + 1);
        onRefresh?.();
    }

    return (
        <>
            <FilterableTable<BankTransfer>
                id="bankTransfers"
                title=""
                repository={bankTransfersRepository}
                FilterBodyComponent={BankTransferFilterBody}
                isDeletable={false}
                isCopyable={false}
                externalUpdate={externalUpdate}
                tableStructure={[
                    { header: 'Data', renderTdBody: (t) => <>{fmtDate(t.execDate)}</>, colMd: 1 },
                    { header: 'Kier.', renderTdBody: (t) => <DirectionBadge direction={t.direction} />, colMd: 1 },
                    { header: 'Kwota', renderTdBody: (t) => <span className="fw-semibold text-nowrap">{fmt(t.amount, t.currency)}</span>, colMd: 2 },
                    { header: 'Kontrahent', renderTdBody: (t) => <>{t.counterpartyName ?? '-'}</>, colMd: 2 },
                    { header: 'Opis', renderTdBody: (t) => <small className="text-muted">{t.description ?? '-'}</small>, colMd: 4 },
                    { header: 'Status', renderTdBody: (t) => <StatusBadge status={t.matchingStatus} />, colMd: 1 },
                    {
                        header: '',
                        renderTdBody: (t) => (
                            <Button size="sm" variant="outline-secondary" onClick={() => setManaged(t)}>
                                Alokacje
                            </Button>
                        ),
                        colMd: 1,
                    },
                ]}
            />

            {managed && (
                <AllocationModal
                    transfer={managed}
                    onHide={() => setManaged(null)}
                    onChanged={handleAllocChanged}
                />
            )}
        </>
    );
}

/* ------------------------------------------------------------------ */
/* Pending tab — UNMATCHED + PROPOSED transfers needing attention      */
/* ------------------------------------------------------------------ */

function PendingTab({ onRefresh }: { onRefresh?: () => void }) {
    const [transfers, setTransfers] = useState<BankTransfer[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [managed, setManaged] = useState<BankTransfer | null>(null);

    const load = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            setTransfers(await fetchPendingTransfers());
        } catch (e) {
            setError(e instanceof Error ? e.message : 'Błąd ładowania');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { load(); }, [load]);

    function handleAllocChanged() {
        load();
        onRefresh?.();
    }

    const unmatched = transfers.filter(t => t.matchingStatus === 'UNMATCHED');
    const proposed  = transfers.filter(t => t.matchingStatus === 'PROPOSED');

    if (loading) return <div className="text-center py-4"><Spinner animation="border" /></div>;
    if (error) return <Alert variant="danger">{error}</Alert>;

    if (transfers.length === 0) {
        return <Alert variant="success">Brak przelewów oczekujących na obsługę.</Alert>;
    }

    return (
        <div>
            <Alert variant="warning" className="mb-3 d-flex gap-3">
                <span>Oczekuje na obsługę: <strong>{transfers.length}</strong></span>
                <span>Nierozliczone: <strong>{unmatched.length}</strong></span>
                <span>Proponowane: <strong>{proposed.length}</strong></span>
            </Alert>

            {proposed.length > 0 && (
                <>
                    <h6>Proponowane dopasowania — wymagają zatwierdzenia</h6>
                    <div className="table-responsive mb-4">
                        <Table striped hover size="sm" className="bank-sync-table">
                            {transferTableHeader(true)}
                            <tbody>
                                {proposed.map(t => (
                                    <TransferRow key={t.id} transfer={t} showActions onManage={setManaged} />
                                ))}
                            </tbody>
                        </Table>
                    </div>
                </>
            )}

            {unmatched.length > 0 && (
                <>
                    <h6>Nierozliczone — wymagają ręcznej alokacji</h6>
                    <div className="table-responsive">
                        <Table striped hover size="sm" className="bank-sync-table">
                            {transferTableHeader(true)}
                            <tbody>
                                {unmatched.map(t => (
                                    <TransferRow key={t.id} transfer={t} showActions onManage={setManaged} />
                                ))}
                            </tbody>
                        </Table>
                    </div>
                </>
            )}

            {managed && (
                <AllocationModal
                    transfer={managed}
                    onHide={() => setManaged(null)}
                    onChanged={handleAllocChanged}
                />
            )}
        </div>
    );
}

/* ------------------------------------------------------------------ */
/* Duplicates tab                                                       */
/* ------------------------------------------------------------------ */

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
                        {transferTableHeader(false)}
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
                                <strong>{bond.offerAlias ?? `Oferta #${bond.offerId}`}</strong>
                                <span className="ms-2 text-muted">Wadium #{bond.id}</span>
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
                                    <thead>
                                        <tr>
                                            <th>Data</th>
                                            <th className="text-end">Kwota</th>
                                            <th>Kontrahent</th>
                                            <th>Opis</th>
                                            <th>Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {m.matchingTransfers.map(t => (
                                            <tr key={t.id}>
                                                <td className="text-nowrap">{fmtDate(t.execDate)}</td>
                                                <td className="text-end text-nowrap">{fmt(t.amount, t.currency)}</td>
                                                <td className="text-truncate" style={{ maxWidth: 160 }}>{t.counterpartyName ?? '-'}</td>
                                                <td className="text-truncate" style={{ maxWidth: 280 }}>
                                                    <small>{t.description ?? '-'}</small>
                                                </td>
                                                <td><StatusBadge status={t.matchingStatus} /></td>
                                            </tr>
                                        ))}
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

/* ------------------------------------------------------------------ */
/* Upload modal                                                         */
/* ------------------------------------------------------------------ */

function UploadModal({ show, onHide, onCommitted }: { show: boolean; onHide: () => void; onCommitted: () => void }) {
    const [file, setFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);
    const [committing, setCommitting] = useState(false);
    const [preview, setPreview] = useState<UploadPreview | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    function reset() { setFile(null); setPreview(null); setError(null); setSuccess(null); }
    function handleClose() { reset(); onHide(); }

    async function handleUpload() {
        if (!file) return;
        setUploading(true);
        setError(null);
        try {
            setPreview(await uploadBankStatement(file));
        } catch (e) {
            setError(e instanceof Error ? e.message : 'Błąd importu');
        } finally {
            setUploading(false);
        }
    }

    async function handleCommit() {
        if (!preview) return;
        setCommitting(true);
        setError(null);
        try {
            const r = await commitStatement(preview.statementId);
            setSuccess(`Zatwierdzono ${r.committed} alokacji.`);
            onCommitted();
        } catch (e) {
            setError(e instanceof Error ? e.message : 'Błąd zatwierdzania');
        } finally {
            setCommitting(false);
        }
    }

    return (
        <Modal show={show} onHide={handleClose}>
            <Modal.Header closeButton>
                <Modal.Title>Import wyciągu bankowego (XML PKO BP)</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {error   && <Alert variant="danger">{error}</Alert>}
                {success && <Alert variant="success">{success}</Alert>}

                {!preview && !success && (
                    <Form.Group>
                        <Form.Label>Plik XML z PKO BP</Form.Label>
                        <Form.Control
                            type="file" accept=".xml"
                            onChange={e => setFile((e.target as HTMLInputElement).files?.[0] ?? null)}
                        />
                    </Form.Group>
                )}

                {preview && !success && (
                    <div className="bank-sync-preview">
                        <p className="mb-1"><strong>Podgląd importu:</strong></p>
                        <ul className="mb-0">
                            <li>Łącznie operacji: <strong>{preview.total}</strong></li>
                            <li>Automatycznie dopasowanych: <strong>{preview.autoMatched}</strong></li>
                            <li>Proponowanych dopasowań: <strong>{preview.proposed}</strong></li>
                            <li>Bez dopasowania: <strong>{preview.unmatched}</strong></li>
                            <li>Opłaty bankowe (pominięte): <strong>{preview.fees}</strong></li>
                            {preview.foreignCurrency > 0 && (
                                <li>Waluty obce (pominięte): <strong>{preview.foreignCurrency}</strong></li>
                            )}
                        </ul>
                        <Alert variant="info" className="mt-3 mb-0">
                            Kliknij "Zatwierdź" aby potwierdzić proponowane dopasowania i zaktualizować statusy faktur.
                        </Alert>
                    </div>
                )}
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={handleClose}>{success ? 'Zamknij' : 'Anuluj'}</Button>
                {!preview && !success && (
                    <Button variant="primary" onClick={handleUpload} disabled={!file || uploading}>
                        {uploading ? <><Spinner size="sm" animation="border" className="me-1" />Importuję…</> : 'Importuj'}
                    </Button>
                )}
                {preview && !success && (
                    <Button variant="success" onClick={handleCommit} disabled={committing}>
                        {committing ? <><Spinner size="sm" animation="border" className="me-1" />Zatwierdzam…</> : 'Zatwierdź'}
                    </Button>
                )}
            </Modal.Footer>
        </Modal>
    );
}

/* ------------------------------------------------------------------ */
/* Main component                                                       */
/* ------------------------------------------------------------------ */

export default function BankSyncSearch({ title }: { title: string }) {
    const [showUpload, setShowUpload] = useState(false);
    const [refreshKey, setRefreshKey] = useState(0);

    useEffect(() => { document.title = title; }, [title]);

    function handleCommitted() { setRefreshKey(k => k + 1); }
    function handleAllocChanged() { setRefreshKey(k => k + 1); }

    return (
        <Container className="mt-3">
            <div className="d-flex justify-content-between align-items-center mb-3">
                <h4 className="mb-0">{title}</h4>
                <Button variant="outline-primary" onClick={() => setShowUpload(true)}>
                    Importuj wyciąg XML
                </Button>
            </div>

            <UploadModal
                show={showUpload}
                onHide={() => setShowUpload(false)}
                onCommitted={handleCommitted}
            />

            <Tabs defaultActiveKey="pending" className="mb-3">
                <Tab eventKey="pending" title="Oczekujące">
                    <PendingTab key={refreshKey} onRefresh={handleAllocChanged} />
                </Tab>
                <Tab eventKey="transfers" title="Wszystkie przelewy">
                    <TransfersTab key={refreshKey} onRefresh={handleAllocChanged} />
                </Tab>
                <Tab eventKey="duplicates" title="Duplikaty">
                    <DuplicatesTab key={refreshKey} />
                </Tab>
                <Tab eventKey="wadium" title="Wadium">
                    <WadiumTab key={refreshKey} />
                </Tab>
            </Tabs>
        </Container>
    );
}
