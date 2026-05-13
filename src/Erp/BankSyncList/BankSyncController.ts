import { BankTransfer, DuplicateGroup, PaymentAllocation, WadiumMatchResult } from '../../../Typings/bussinesTypes';
import MainSetup from '../../React/MainSetupReact';
import RepositoryReact from '../../React/RepositoryReact';

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
    const res = await fetch(`${MainSetup.serverUrl}${path}`, {
        credentials: 'include',
        ...init,
    });
    if (!res.ok) {
        const body = await res.json().catch(() => ({})) as { error?: string; errorMessage?: string };
        throw new Error(body.error ?? body.errorMessage ?? `HTTP ${res.status}`);
    }
    return res.json();
}

export interface UploadPreview {
    statementId: number;
    total: number;
    autoMatched: number;
    proposed: number;
    unmatched: number;
    fees: number;
    foreignCurrency: number;
}

export const bankTransfersRepository = new RepositoryReact<BankTransfer>({
    actionRoutes: {
        getRoute: 'bank-transfers',
        addNewRoute: 'bank-transfers',
        editRoute: 'bank-transfers',
        deleteRoute: 'bank-transfers',
    },
    name: 'bankTransfers',
});

export async function fetchPendingTransfers(): Promise<BankTransfer[]> {
    return apiFetch<BankTransfer[]>('bank-transfers/pending');
}

export async function fetchDuplicates(): Promise<DuplicateGroup[]> {
    return apiFetch<DuplicateGroup[]>('bank-transfers/duplicates');
}

export async function fetchWadiumMatches(): Promise<WadiumMatchResult[]> {
    return apiFetch<WadiumMatchResult[]>('bank-transfers/wadium-matches');
}

export async function uploadBankStatement(file: File): Promise<UploadPreview> {
    const form = new FormData();
    form.append('file', file);
    return apiFetch<UploadPreview>('bank-statements', {
        method: 'POST',
        body: form,
    });
}

export async function commitStatement(statementId: number): Promise<{ committed: number }> {
    return apiFetch<{ committed: number }>(`bank-statements/${statementId}/commit`, { method: 'POST' });
}

export async function fetchAllocations(transferId: number): Promise<PaymentAllocation[]> {
    return apiFetch<PaymentAllocation[]>(`bank-transfers/${transferId}/allocations`);
}

export async function createAllocation(
    transferId: number,
    data: { invoiceId?: number; costInvoiceId?: number; amount: number }
): Promise<PaymentAllocation> {
    return apiFetch<PaymentAllocation>(`bank-transfers/${transferId}/allocations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });
}

export async function deleteAllocation(transferId: number, allocId: number): Promise<void> {
    await apiFetch<unknown>(`bank-transfers/${transferId}/allocations/${allocId}`, { method: 'DELETE' });
}
