import React from 'react';
import { render, screen, within } from '@testing-library/react';
import { expect, it, vi } from 'vitest';
import { Invoice } from '../../../../Typings/bussinesTypes';
import { fetchInvoicePayments } from '../../BankSyncList/BankSyncController';
import InvoicePaymentsSection from './InvoicePaymentsSection';

vi.mock('../../BankSyncList/BankSyncController', () => ({ fetchInvoicePayments: vi.fn() }));
vi.mock('../InvoicesController', () => ({ invoicesRepository: {} }));

it('leaves space after the amounts in both payment rows and the header', async () => {
    vi.mocked(fetchInvoicePayments).mockResolvedValue({
        dueAmount: 150,
        paidManually: 2,
        payments: [{ id: 1, bankTransferId: 2, amount: 100, date: '2026-07-20', currency: 'PLN', sender: 'Nadawca', title: null }],
    });
    render(<InvoicePaymentsSection invoice={{ id: 3 } as Invoice} onInvoiceChange={vi.fn()} />);

    expect(await screen.findByRole('columnheader', { name: 'Kwota' })).toHaveClass('pe-3');
    const [, bankPayment, manualPayment] = screen.getAllByRole('row');
    expect(within(bankPayment).getAllByRole('cell')[1]).toHaveClass('pe-3');
    expect(within(manualPayment).getAllByRole('cell')[1]).toHaveClass('pe-3');
});
