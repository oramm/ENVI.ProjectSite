import React from 'react';
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { expect, it, vi } from 'vitest';
import { BankTransfer, PendingBankTransfer } from '../../../Typings/bussinesTypes';
import BankSyncSearch from './BankSyncSearch';
import { bankTransfersRepository, dismissTransfer, fetchPendingTransfers, fetchStatements, restoreTransfer } from './BankSyncController';

vi.mock('./BankSyncController', async importOriginal => ({
    ...await importOriginal<typeof import('./BankSyncController')>(),
    dismissTransfer: vi.fn(),
    fetchPendingTransfers: vi.fn(),
    fetchStatements: vi.fn(),
    restoreTransfer: vi.fn(),
}));

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
    vi.mocked(dismissTransfer).mockImplementation(() => new Promise<void>(resolve => {
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
        expect(dismissTransfer).toHaveBeenCalledExactlyOnceWith(1, 150);

        fireEvent.click(screen.getByRole('tab', { name: 'Wszystkie przelewy' }));
        fireEvent.click(await screen.findByRole('button', { name: 'Przywróć do kolejki' }));
        await screen.findByRole('tab', { name: 'Do decyzji (1)' });
        expect(restoreTransfer).toHaveBeenCalledExactlyOnceWith(1);
    } finally {
        loadTransfers.mockRestore();
    }
});
