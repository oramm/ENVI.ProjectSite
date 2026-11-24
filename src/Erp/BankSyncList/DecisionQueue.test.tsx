import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { expect, it, vi } from 'vitest';
import { PendingBankTransfer } from '../../../Typings/bussinesTypes';
import DecisionQueue from './DecisionQueue';

it('requires a choice between equal proposals and submits only the selected invoice', () => {
    const candidates = [
        { invoiceId: 201, invoiceNumber: '1/2026', remainingAmount: 50 },
        { invoiceId: 202, invoiceNumber: '2/2026', remainingAmount: 50 },
    ];
    const transfer: PendingBankTransfer = {
        id: 1, bankStatementId: 1, execDate: '2026-07-20', amount: 150, remainingAmount: 50, currency: 'PLN',
        direction: 'IN', counterpartyName: 'Nadawca', counterpartyAccount: null, description: null, title: 'Usługi',
        matchingStatus: 'PROPOSED', matchingCandidates: candidates, operationHash: 'fixture',
    };
    const onApprove = vi.fn();

    render(<DecisionQueue transfers={[transfer]} statements={[]} statementId="" onStatementChange={vi.fn()}
        onManage={vi.fn()} onDismiss={vi.fn()} onApprove={onApprove} busy={null} />);

    const approve = screen.getByRole('button', { name: 'Zatwierdź' });
    expect(approve).toBeDisabled();
    expect(screen.queryByRole('button', { name: 'To nie zapłata faktury' })).not.toBeInTheDocument();
    for (const option of screen.getAllByRole('radio')) expect(option).not.toBeChecked();
    fireEvent.click(screen.getByRole('radio', { name: /2\/2026/ }));
    fireEvent.click(approve);
    expect(onApprove).toHaveBeenCalledExactlyOnceWith(transfer, candidates[1]);
});
