import React from 'react';
import FilterableTable from '../../View/Resultsets/FilterableTable/FilterableTable';
import { InvoicesFilterBody } from './InvoiceFilterBody';
import { InvoiceEditModalButton, InvoiceAddNewModalButton } from './Modals/InvoiceModalButtons';
import { Invoice } from '../../../Typings/bussinesTypes';
import { InvoiceStatusBadge } from '../../View/Resultsets/CommonComponents';
import { invoicesRepository } from './InvoicesController';
import Tools from '../../React/Tools';

export default function InvoicesSearch({ title }: { title: string }) {
    function makeEntityLabel(invoice: Invoice) {
        return (
            <>
                {invoice._entity.name} {' '} <InvoiceStatusBadge status={invoice.status} />
            </>
        );
    }

    function renderInvoiceTotaValue(invoice: Invoice) {
        return <>{invoice._totalNetValue && <div className="text-end">{Tools.formatNumber(invoice._totalNetValue)}</div>}</>
    }

    return (
        <FilterableTable<Invoice>
            id='invoices'
            title={title}
            FilterBodyComponent={InvoicesFilterBody}
            tableStructure={[
                { header: 'Umowa', renderTdBody: (invoice: Invoice) => <>{invoice._contract.ourId}</> },
                { header: 'Numer', objectAttributeToShow: 'number' },
                { header: 'Sprzedaż', objectAttributeToShow: 'issueDate' },
                { header: 'Wysłano', objectAttributeToShow: 'sentDate' },
                { header: 'Odbiorca', renderTdBody: makeEntityLabel },
                { header: 'Netto, zł', renderTdBody: renderInvoiceTotaValue },
                { header: 'Termin płatności', objectAttributeToShow: 'paymentDeadline' },
            ]}
            AddNewButtonComponents={[InvoiceAddNewModalButton]}
            EditButtonComponent={InvoiceEditModalButton}
            isDeletable={true}
            repository={invoicesRepository}
            selectedObjectRoute={'/invoice/'}
        />
    );
}