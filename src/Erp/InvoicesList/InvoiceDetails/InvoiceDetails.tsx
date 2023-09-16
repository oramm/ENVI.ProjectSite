import React, { createContext, useContext, useEffect, useState } from 'react';
import { Container, Card, Col, Row, Button } from 'react-bootstrap';
import { useParams } from 'react-router-dom';
import { Invoice, InvoiceItem } from '../../../../Typings/bussinesTypes';
import ToolsDate from '../../../React/ToolsDate';
import { GDDocFileIconLink, InvoiceStatusBadge, SpinnerBootstrap } from '../../../View/Resultsets/CommonComponents';
import FilterableTable from '../../../View/Resultsets/FilterableTable/FilterableTable';
import { invoiceItemsRepository, invoicesRepository } from '../InvoicesController';
import { InvoiceItemAddNewModalButton, InvoiceItemEditModalButton } from '../Modals/InvoiceItemModalButtons';
import { ActionButton, CopyButton, InvoiceEditModalButton } from '../Modals/InvoiceModalButtons';
import { makeInvoiceValidationSchema } from '../Modals/InvoiceValidationSchema';

export default function InvoiceDetails() {
    const [invoice, setInvoice] = useState(invoicesRepository.currentItems[0]);
    const [invoiceItems, setInvoiceItems] = useState(undefined as InvoiceItem[] | undefined);
    const { id } = useParams();

    useEffect(() => {
        if (!id) throw new Error('Nie znaleziono id w adresie url');
        const idNumber = Number(id);

        const fetchData = async () => {
            const fetchInvoice = invoicesRepository.loadItemFromRouter(idNumber);
            const fetchItems = invoiceItemsRepository.loadItemsFromServer({ invoiceId: id });
            try {
                const [invoiceData, itemsData] = await Promise.all([fetchInvoice, fetchItems]);
                if (invoiceData) setInvoice(invoiceData);
                setInvoiceItems(itemsData);
            } catch (error) {
                console.error("Error fetching data", error);
                // Handle error as you see fit
            }
        };

        fetchData();
    }, []);
    if (!invoice) {
        return <div>Ładuję dane... <SpinnerBootstrap /> </div>;
    }
    return (
        <InvoiceProvider invoice={invoice} setInvoice={setInvoice} >
            <Card >
                <Card.Body >
                    <Container>
                        <Row>
                            <Col sm={1} lg='auto'>
                                {invoice._documentOpenUrl && (
                                    <GDDocFileIconLink folderUrl={invoice._documentOpenUrl} />
                                )}
                            </Col>
                            <Col sm={4} md={2}>
                                <div>Nr faktury:</div>
                                <h5>{invoice.number}</h5>
                            </Col>
                            <Col sm={4} md={3} lg='3'>
                                <div>do Umowy:</div>
                                <h5>{invoice._contract.ourId}</h5>
                            </Col>
                            <Col sm={2}>
                                <InvoiceStatusBadge status={invoice.status} />
                            </Col>
                            <Col md="auto">
                                <ActionButton /> {' '} <CopyButton />{' '}
                                <InvoiceEditModalButton
                                    modalProps={{
                                        onEdit: setInvoice,
                                        initialData: invoice,
                                        makeValidationSchema: makeInvoiceValidationSchema
                                    }
                                    }
                                    buttonProps={{ buttonCaption: 'Edytuj Fakturę' }}
                                />
                            </Col>

                        </Row>
                        <Row>
                            <Col sm={4} md={2}>
                                <div>Data sprzedaży:</div>
                                {invoice.issueDate
                                    ? <h5>{ToolsDate.dateYMDtoDMY(invoice.issueDate)} </h5>
                                    : 'Jeszcze nie wystawiono'}
                            </Col>
                            <Col sm={4} md={2}>
                                <div>Data wysłania:</div>
                                {invoice.sentDate
                                    ? <h5>{ToolsDate.dateYMDtoDMY(invoice.sentDate)}</h5>
                                    : 'Jeszcze nie wysłano'}
                            </Col>
                            <Col sm={4} md={2}>
                                <div>Termin płatności:</div>
                                {invoice.paymentDeadline
                                    ? <h5>{ToolsDate.dateYMDtoDMY(invoice.paymentDeadline)}</h5>
                                    : 'Jeszcze nie okreśony'}
                            </Col>
                        </Row>
                        <Row>
                            <Col sm={4} md={2}>
                                <div>Wartość Brutto:</div>
                                <h5>{invoice._grossValue}</h5>
                            </Col>

                            <Col sm={4} md={2}>
                                <div>Wartość Netto:</div>
                                <h5>{invoice._netValue}</h5>
                            </Col>
                            <Col sm={12} md={8}>
                                <div>Odbiorca</div>
                                <h5>{invoice._entity.name}</h5>
                            </Col>

                        </Row>
                        <Row>
                            <Col >
                                {invoice.description && <p>Opis: {invoice.description}</p>}
                            </Col>
                        </Row>
                    </Container >


                    {invoiceItems ?
                        <FilterableTable<InvoiceItem>
                            id='invoiceItems'
                            title=''
                            initialObjects={invoiceItems}
                            repository={invoiceItemsRepository}
                            AddNewButtonComponents={[InvoiceItemAddNewModalButton]}
                            EditButtonComponent={InvoiceItemEditModalButton}
                            tableStructure={[
                                { header: 'Opis', objectAttributeToShow: 'description' },
                                { header: 'Netto', objectAttributeToShow: '_netValue' },
                                { header: 'Brutto', objectAttributeToShow: '_grossValue' },
                            ]}
                        />
                        : <>"Ładowanie pozycji faktury..." <SpinnerBootstrap /></>
                    }

                    <p className='tekst-muted small'>
                        Przygotował(a): {`${invoice._owner.name} ${invoice._owner.surname}`}<br />
                        Aktualizacja: {ToolsDate.timestampToString(invoice._lastUpdated)}
                    </p>
                </Card.Body>
            </Card >
        </InvoiceProvider>
    );
}

// Utwórz kontekst
const InvoiceContext = createContext<{
    invoice: Invoice,
    setInvoice: React.Dispatch<React.SetStateAction<Invoice>>
}>({
    invoice: {} as Invoice,
    setInvoice: () => { }
});

type InvoiceProviderProps = {
    invoice: Invoice,
    setInvoice: React.Dispatch<React.SetStateAction<Invoice>>
}

// Twórz dostawcę kontekstu, który przechowuje stan faktury
export function InvoiceProvider({
    invoice,
    setInvoice,
    children
}: React.PropsWithChildren<InvoiceProviderProps>) {
    if (!invoice) throw new Error("Invoice not found");

    return (
        <InvoiceContext.Provider value={{ invoice, setInvoice }}>
            {children}
        </InvoiceContext.Provider>
    );
}

// Tworzy własny hook, który będzie używany przez komponenty podrzędne do uzyskania dostępu do faktury
export function useInvoice() {
    return useContext(InvoiceContext);
}