import React from 'react';
import FilterableTable from '../../View/Resultsets/FilterableTable/FilterableTable';
import { InvoicesFilterBody } from './InvoiceFilterBody';
import { InvoiceEditModalButton, InvoiceAddNewModalButton } from './Modals/InvoiceModalButtons';
import { Invoice } from '../../../Typings/bussinesTypes';
import { InvoiceStatusBadge } from '../../View/Resultsets/CommonComponents';
import { invoicesRepository } from './InvoicesController';

export default function InvoicesSearch({ title }: { title: string }) {
    function makeEntityLabel(invoice: Invoice) {
        return (
            <>
                {invoice._entity.name} {' '} <InvoiceStatusBadge status={invoice.status} />
            </>
        );
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
                { header: 'Netto, zł', objectAttributeToShow: '_totalNetValue' },
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