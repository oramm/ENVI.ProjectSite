import React from 'react';
import FilterableTable from '../../View/Resultsets/FilterableTable';
import InvoicesController from './InvoicesController';
import { InvoicesFilterBody } from './InvoiceFilterBody';
import { InvoiceEditModalButton, InvoiceAddNewModalButton } from './Modals/InvoiceModalButtons';
import { Invoice } from '../../../Typings/bussinesTypes';
import { InvoiceStatusBadge } from '../../View/Resultsets/CommonComponents';

export const invoicesRepository = InvoicesController.invoicesRepository;
export const invoiceItemsRepository = InvoicesController.invoiceItemsRepository;
export const entitiesRepository = InvoicesController.entitiesRepository;
export const projectsRepository = InvoicesController.projectsRepository;
export const contractsRepository = InvoicesController.contractsRepository;

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
            title={title}
            FilterBodyComponent={InvoicesFilterBody}
            tableStructure={[
                { header: 'Numer', objectAttributeToShow: 'number' },
                { header: 'Utworzono', objectAttributeToShow: 'issueDate' },
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