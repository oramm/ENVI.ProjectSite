import { BankStatement, BankTransfer, DuplicateGroup, PaymentAllocation, PendingBankTransfer, WadiumMatchResult } from '../../../Typings/bussinesTypes';
import RepositoryReact from '../../React/RepositoryReact';
import type { Invoice } from '../../../Typings/bussinesTypes';

export interface StatementPeriod {
    periodFrom: string;
    periodTo: string;
}

export interface StatementCoverage {
    accountNumber: string;
    statements: BankStatement[];
    gaps: StatementPeriod[];
    months: Array<{
        month: string;
        status: 'covered' | 'partial' | 'missing';
        coveredThrough: string | null;
    }>;
}

export interface UploadPreview extends StatementPeriod {
    statementId: number;
    total: number;
    alreadyKnown: number;
    fees: number;
    incomeMatched: number;
    incomePending: number;
    ownTransfers: number;
    expenses: number;
    otherIncoming: number;
    gaps: StatementPeriod[];
}

type ImportJob = { status: 'running' }
    | { status: 'done'; result: UploadPreview }
    | { status: 'failed'; error: string };

export interface InvoicePayments {
    dueAmount: number;
    paidManually: 0 | 1 | 2;
    payments: Array<{
        id: number;
        bankTransferId: number;
        amount: number;
        date: string;
        currency: string;
        sender: string | null;
        title: string | null;
    }>;
}

interface AllocationResult {
    allocatedAmount: number;
    transferRemaining?: number;
}

const request = RepositoryReact.request;

export const bankTransfersRepository = new RepositoryReact<BankTransfer>({
    actionRoutes: { getRoute: 'bank-transfers', addNewRoute: '', editRoute: '', deleteRoute: '' },
    name: 'bankTransfers',
});

export const fetchPendingTransfers = () => request<PendingBankTransfer[]>('bank-transfers/pending');
export const fetchDuplicates = () => request<DuplicateGroup[]>('bank-transfers/duplicates');
export const fetchWadiumMatches = () => request<WadiumMatchResult[]>('bank-transfers/wadium-matches');
export const fetchStatements = () => request<StatementCoverage[]>('bank-statements');
export const fetchInvoicePayments = (id: number) => request<InvoicePayments>(`bank-transfers/invoices/${id}/payments`);
export const undoManualPayment = (id: number) => request<Invoice>(`bank-transfers/invoices/${id}/payments/manual`, 'DELETE');
export const dismissTransfer = (id: number, expectedRemaining: number) =>
    request(`bank-transfers/${id}/dismiss`, 'PATCH', { expectedRemaining });
export const restoreTransfer = (id: number) => request(`bank-transfers/${id}/restore`, 'PATCH');

export function uploadBankStatement(file: File) {
    const form = new FormData();
    form.append('file', file);
    return request<{ jobId: string }>('bank-statements', 'POST', form);
}

export const fetchBankStatementImport = (jobId: string, signal: AbortSignal) =>
    request<ImportJob>(`bank-statements/imports/${jobId}`, 'GET', undefined, signal);

export const fetchAllocations = (transferId: number) =>
    request<PaymentAllocation[]>(`bank-transfers/${transferId}/allocations`);

export function createAllocation(
    transferId: number,
    data: { invoiceId?: number; costInvoiceId?: number; amount: number; expectedRemaining?: number },
) {
    return request<AllocationResult>(`bank-transfers/${transferId}/allocations`, 'POST', data);
}

export const deleteAllocation = (transferId: number, allocationId: number) =>
    request(`bank-transfers/${transferId}/allocations/${allocationId}`, 'DELETE');
