import React from 'react';
import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { expect, it, vi } from 'vitest';
import { BankTransfer, PendingBankTransfer } from '../../../Typings/bussinesTypes';
import BankSyncSearch from './BankSyncSearch';
import {
    bankTransfersRepository, dismissTransfer, fetchBankStatementImport, fetchPendingTransfers,
    fetchStatements, restoreTransfer, uploadBankStatement,
} from './BankSyncController';

vi.mock('./BankSyncController', async importOriginal => ({
    ...await importOriginal<typeof import('./BankSyncController')>(),
    dismissTransfer: vi.fn(),
    fetchBankStatementImport: vi.fn(),
    fetchPendingTransfers: vi.fn(),
    fetchStatements: vi.fn(),
    restoreTransfer: vi.fn(),
    uploadBankStatement: vi.fn(),
}));

async function openUpload() {
    vi.mocked(fetchPendingTransfers).mockClear().mockResolvedValue([]);
    vi.mocked(fetchStatements).mockResolvedValue([]);
    vi.mocked(uploadBankStatement).mockClear().mockResolvedValue({ jobId: 'job-1' });
    render(<MemoryRouter><BankSyncSearch title="Wyciągi bankowe" /></MemoryRouter>);
    await screen.findByRole('tab', { name: 'Do decyzji (0)' });
    fireEvent.click(screen.getByRole('button', { name: 'Wgraj wyciąg (plik z PKO BP)' }));
    return within(await screen.findByRole('dialog'));
}

function submitUpload(dialog: ReturnType<typeof within>) {
    const file = new File(['<account-history/>'], 'wyciag.xml', { type: 'text/xml' });
    fireEvent.change(dialog.getByLabelText('Plik XML z PKO BP'), { target: { files: [file] } });
    fireEvent.click(dialog.getByRole('button', { name: 'Wgraj wyciąg' }));
    expect(uploadBankStatement).toHaveBeenCalledExactlyOnceWith(file);
}

it('shows progress while polling, then displays the B5 result and refreshes the list', async () => {
    vi.mocked(fetchBankStatementImport).mockReset()
        .mockResolvedValueOnce({ status: 'running' })
        .mockResolvedValueOnce({ status: 'done', result: {
            statementId: 1, periodFrom: '2026-06-01', periodTo: '2026-06-30', total: 8, alreadyKnown: 2,
            needsReview: 1,
            reviewOperations: [{ fileOperationNumber: 7, execDate: '2026-06-29', amount: 15, currency: 'PLN', direction: 'OUT' }],
            fees: 1, incomeMatched: 3, incomePending: 4, ownTransfers: 0, expenses: 0, otherIncoming: 0,
            gaps: [{ periodFrom: '2026-05-01', periodTo: '2026-05-31' }],
        } });

    const dialog = await openUpload();
    submitUpload(dialog);
    expect(dialog.getByRole('status')).toHaveTextContent('Wgrywam wyciąg...');
    expect(dialog.getByRole('button', { name: 'Wgraj wyciąg' })).toBeDisabled();
    expect(fetchPendingTransfers).toHaveBeenCalledTimes(1);
    await dialog.findByText('Wyciąg wgrany', undefined, { timeout: 3000 });
    expect(fetchBankStatementImport).toHaveBeenCalledTimes(2);
    expect(fetchBankStatementImport).toHaveBeenLastCalledWith('job-1', expect.any(AbortSignal));
    expect(dialog.getByRole('row', { name: 'Nowe operacje 8' })).toBeInTheDocument();
    expect(dialog.getByRole('row', { name: 'Już znane z wcześniejszych wyciągów 2' })).toBeInTheDocument();
    fireEvent.click(dialog.getByText('Nowe operacje do sprawdzenia: 1'));
    expect(dialog.getByText('Poz. 7 w pliku, 29.06.2026, -15,00 zł')).toBeVisible();
    expect(dialog.getByText(/System nie przypina ich do faktur automatycznie/)).toBeVisible();
    expect(dialog.getByText(/01\.05\.2026.*31\.05\.2026/)).toBeInTheDocument();
    expect(fetchPendingTransfers).toHaveBeenCalledTimes(2);
    expect(dialog.queryByRole('status')).not.toBeInTheDocument();
});

it('opens the decision queue for an ambiguous bank fee and lets the user finish its review', async () => {
    const transfer: PendingBankTransfer = {
        id: 7, bankStatementId: 1, execDate: '2026-06-29', amount: 15, remainingAmount: 15, currency: 'PLN',
        direction: 'OUT', counterpartyName: null, counterpartyAccount: null, description: 'Opłata', title: 'Opłata testowa',
        matchingStatus: 'MANUAL', matchingCandidates: [], operationHash: 'fixture', importNeedsReview: true,
    };
    vi.mocked(fetchBankStatementImport).mockReset().mockResolvedValue({ status: 'done', result: {
        statementId: 1, periodFrom: '2026-06-01', periodTo: '2026-06-30', total: 1, alreadyKnown: 0,
        needsReview: 1, reviewOperations: [{ fileOperationNumber: 7, execDate: transfer.execDate, amount: 15, currency: 'PLN', direction: 'OUT' }],
        fees: 1, incomeMatched: 0, incomePending: 0, ownTransfers: 0, expenses: 0, otherIncoming: 0, gaps: [],
    } });
    vi.mocked(dismissTransfer).mockReset().mockResolvedValue(undefined);
    const upload = await openUpload();
    vi.mocked(fetchPendingTransfers).mockResolvedValueOnce([transfer]);
    submitUpload(upload);
    fireEvent.click(await upload.findByRole('button', { name: 'Przejdź do decyzji' }));

    fireEvent.change(screen.getByRole('searchbox'), { target: { value: '-15,00 zł' } });
    const row = within(await screen.findByRole('row', { name: /Do sprawdzenia.*Opłata testowa/ }));
    expect(row.queryByRole('button', { name: 'Zatwierdź' })).not.toBeInTheDocument();
    expect(row.queryByRole('button', { name: 'Przypisz ręcznie…' })).not.toBeInTheDocument();
    fireEvent.click(row.getByRole('button', { name: 'Zakończ sprawdzanie' }));
    const confirm = within(await screen.findByRole('dialog'));
    fireEvent.click(confirm.getByRole('button', { name: 'Zakończ sprawdzanie' }));
    await waitFor(() => expect(dismissTransfer).toHaveBeenCalledExactlyOnceWith(7, 15, transfer.operationHash));
    expect(await screen.findByText('Sprawdzanie operacji zakończone.')).toBeVisible();
});

it('shows the import error and enables the file to be submitted again', async () => {
    const error = 'Nie udało się wgrać wyciągu. Spróbuj ponownie.';
    vi.mocked(fetchBankStatementImport).mockReset().mockResolvedValue({ status: 'failed', error });
    const dialog = await openUpload();
    submitUpload(dialog);
    expect(await dialog.findByRole('alert')).toHaveTextContent(error);
    expect(dialog.getByRole('button', { name: 'Wgraj wyciąg' })).toBeEnabled();
    expect(fetchPendingTransfers).toHaveBeenCalledTimes(1);
});

it('stops checking after five minutes even if a request hangs and lets the user close the window', async () => {
    vi.mocked(fetchBankStatementImport).mockReset().mockImplementation((_id, signal) =>
        new Promise((_, reject) => signal.addEventListener('abort', () => reject(new Error('Przerwano')), { once: true })),
    );
    const dialog = await openUpload();
    vi.useFakeTimers();
    try {
        submitUpload(dialog);
        await act(() => vi.advanceTimersByTimeAsync(5 * 60 * 1000 - 1));
        expect(dialog.getByRole('status')).toHaveTextContent('Wgrywam wyciąg...');
        expect(dialog.getByRole('button', { name: 'Anuluj' })).toBeDisabled();
        const signal = vi.mocked(fetchBankStatementImport).mock.calls[0][1];
        expect(signal.aborted).toBe(false);

        await act(() => vi.advanceTimersByTimeAsync(1));
        expect(signal.aborted).toBe(true);
        expect(dialog.getByRole('alert')).toHaveTextContent('Wgrywanie trwa dłużej niż zwykle. Sprawdź za chwilę zakładkę Wyciągi.');
        expect(dialog.queryByRole('status')).not.toBeInTheDocument();
        expect(dialog.queryByRole('button', { name: 'Wgraj wyciąg' })).not.toBeInTheDocument();
        const close = dialog.getByRole('button', { name: 'Zamknij' });
        expect(close).toBeEnabled();
        fireEvent.click(close);
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

        vi.mocked(fetchStatements).mockClear();
        fireEvent.click(screen.getByRole('tab', { name: 'Wyciągi' }));
        await act(() => vi.advanceTimersByTimeAsync(2000));
        expect(fetchStatements).toHaveBeenCalledTimes(1);
        expect(fetchBankStatementImport).toHaveBeenCalledTimes(1);
    } finally {
        vi.useRealTimers();
    }
});

it('retries network failures and reports the third consecutive one', async () => {
    const networkError = new Error('Brak połączenia z serwerem');
    vi.mocked(fetchBankStatementImport).mockReset().mockRejectedValue(networkError)
        .mockRejectedValueOnce(networkError).mockRejectedValueOnce(networkError)
        .mockResolvedValueOnce({ status: 'running' });
    const dialog = await openUpload();
    vi.useFakeTimers();
    try {
        submitUpload(dialog);
        await act(() => vi.advanceTimersByTimeAsync(4000));
        expect(fetchBankStatementImport).toHaveBeenCalledTimes(5);
        expect(dialog.queryByRole('alert')).not.toBeInTheDocument();
        expect(dialog.getByRole('status')).toHaveTextContent('Wgrywam wyciąg...');

        await act(() => vi.advanceTimersByTimeAsync(1000));
        expect(fetchBankStatementImport).toHaveBeenCalledTimes(6);
        expect(dialog.getByRole('alert')).toHaveTextContent(networkError.message);
        expect(dialog.getByRole('button', { name: 'Anuluj' })).toBeEnabled();
    } finally {
        vi.useRealTimers();
    }
});

it('dismisses only after confirmation and restores the transfer from the full list', async () => {
    const transfer: PendingBankTransfer = {
        id: 1, bankStatementId: 1, execDate: '2026-07-20', amount: 150, remainingAmount: 150, currency: 'PLN',
        direction: 'IN', counterpartyName: 'Nadawca', counterpartyAccount: null, description: null, title: 'Przelew',
        matchingStatus: 'UNMATCHED', matchingCandidates: [], operationHash: 'fixture',
    };
    let dismissed = false;
    vi.mocked(fetchPendingTransfers).mockImplementation(async () => dismissed ? [] : [transfer]);
    vi.mocked(fetchStatements).mockResolvedValue([]);
    let finishDismiss: (() => void) | undefined;
    vi.mocked(dismissTransfer).mockClear().mockImplementation(() => new Promise<void>(resolve => {
        finishDismiss = () => {
            dismissed = true;
            resolve();
        };
    }));
    vi.mocked(restoreTransfer).mockImplementation(async () => { dismissed = false; });
    const loadTransfers = vi.spyOn(bankTransfersRepository, 'loadItemsFromServerPOST').mockImplementation(async () => {
        const items: BankTransfer[] = [dismissed ? { ...transfer, matchingStatus: 'MANUAL', canRestoreToQueue: true } : transfer];
        bankTransfersRepository.items = items;
        return items;
    });

    try {
        render(<MemoryRouter><BankSyncSearch title="Wyciągi bankowe" /></MemoryRouter>);
        fireEvent.click(await screen.findByRole('button', { name: 'To nie zapłata faktury' }));
        const dialog = await screen.findByRole('dialog');
        expect(dismissTransfer).not.toHaveBeenCalled();
        fireEvent.click(within(dialog).getByRole('button', { name: 'Anuluj' }));
        await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
        expect(dismissTransfer).not.toHaveBeenCalled();

        fireEvent.click(screen.getByRole('button', { name: 'To nie zapłata faktury' }));
        const confirmation = await screen.findByRole('dialog');
        fireEvent.click(within(confirmation).getByRole('button', { name: 'Usuń z kolejki' }));
        expect(within(confirmation).getByRole('button', { name: 'Anuluj' })).toBeDisabled();
        finishDismiss!();
        await screen.findByRole('tab', { name: 'Do decyzji (0)' });
        expect(dismissTransfer).toHaveBeenCalledExactlyOnceWith(1, 150, undefined);

        fireEvent.click(screen.getByRole('tab', { name: 'Wszystkie przelewy' }));
        fireEvent.click(await screen.findByRole('button', { name: 'Przywróć do kolejki' }));
        await screen.findByRole('tab', { name: 'Do decyzji (1)' });
        expect(restoreTransfer).toHaveBeenCalledExactlyOnceWith(1);
    } finally {
        loadTransfers.mockRestore();
    }
});
