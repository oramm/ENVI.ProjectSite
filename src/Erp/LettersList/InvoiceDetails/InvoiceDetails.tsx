import React, { FC, useEffect, useState } from 'react';
import { Card, Dropdown, DropdownButton } from 'react-bootstrap';
import { Invoice, InvoiceItem } from '../../../../Typings/bussinesTypes';
import ToolsDate from '../../../React/ToolsDate';
import { SpinnerBootstrap } from '../../../View/Resultsets/CommonComponents';
import FilterableTable from '../../../View/Resultsets/FilterableTable';
import { invoiceItemsRepository, invoicesRepository } from '../InvoicesSearch';


export default function InvoiceDetails() {
    const invoice: Invoice = invoicesRepository.currentItems[0];
    const [invoiceItems, setInvoiceItems] = useState(undefined as InvoiceItem[] | undefined);

    useEffect(() => {
        const fetchInvoiceItems = async () => {
            const formData = new FormData();
            formData.append('invoiceId', invoice.id.toString());
            const items = await invoiceItemsRepository.loadItemsfromServer(formData);
            setInvoiceItems(items);
        };

        fetchInvoiceItems();
    }, []);
    if (!invoice) {
        return <div>Ładuję dane... <SpinnerBootstrap /> </div>;
    }
    return (
        <Card>
            <Card.Header>
                <div className="d-flex justify-content-between">
                    <div>
                        Nr faktury: <h5>{invoice.number}</h5> do Umowy: <h5>{invoice._contract.ourId}</h5>
                        {invoice.description &&
                            <p>Opis: {invoice.description}</p>
                        }
                        <p>Data wystawienia: {invoice.issueDate ? ToolsDate.dateYMDtoDMY(invoice.issueDate) : 'Jeszcze nie wystawiono'}</p>
                        <p>Data wysłania: {invoice.sentDate ? ToolsDate.dateYMDtoDMY(invoice.sentDate) : 'Jeszcze nie wysłano'}</p>
                        <p>Termin płatności: {invoice.paymentDeadline ? ToolsDate.dateYMDtoDMY(invoice.paymentDeadline) : 'Jeszcze nie okreśony'}</p>
                    </div>

                </div>
            </Card.Header>
            <Card.Body>

                <h5>Pozycje faktury:</h5>
                {invoiceItems ?
                    <FilterableTable<InvoiceItem>
                        title=''
                        initialObjects={invoiceItems}
                        repository={invoiceItemsRepository}
                        AddNewButtonComponents={undefined}
                        //EditButtonComponents={}
                        tableStructure={[
                            { header: 'Opis', objectAttributeToShow: 'description' },
                            { header: 'Netto', objectAttributeToShow: '_netValue' },
                            { header: 'Brutto', objectAttributeToShow: '_grossValue' },
                        ]}
                    />
                    : <>"Ładowanie pozycji faktury..." <SpinnerBootstrap /></>
                }
            </Card.Body>
            <Card.Footer>
                <p>Prygotował(a): {`${invoice._owner.name} ${invoice._owner.surname}`}</p>
                <p>Aktualizacja: {ToolsDate.timestampToString(invoice._lastUpdated)}</p>
            </Card.Footer>
        </Card>
    );
}
