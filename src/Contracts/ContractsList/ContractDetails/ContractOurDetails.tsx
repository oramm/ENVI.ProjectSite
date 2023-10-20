import React, { createContext, useContext, useEffect, useState } from 'react';
import { Container, Card, Col, Row, Button, Alert, Placeholder } from 'react-bootstrap';
import { ContractsSettlementData, Invoice } from '../../../../Typings/bussinesTypes';
import Tools from '../../../React/Tools';
import ToolsDate from '../../../React/ToolsDate';
import { InvoiceStatusBadge, MyTooltip } from '../../../View/Resultsets/CommonComponents';
import FilterableTable from '../../../View/Resultsets/FilterableTable/FilterableTable';
import { contractsSettlementRepository, invoicesRepository } from '../ContractsController';
import { useContractDetails } from './ContractDetailsContext';

export default function ContractOurDetails() {
    const { contract, setContract, contractsRepository } = useContractDetails();
    const [settlemenData, setSettlemenData] = useState(undefined as ContractsSettlementData | undefined);
    const [invoices, setInvoices] = useState([] as Invoice[]);
    if (!contract) return <Alert variant='danger'>Nie wybrano umowy</Alert>;


    //fetch data
    useEffect(() => {
        async function fetchData() {
            console.log(`ContracOurDetails: fetchData():: contract.id: ${contract?.id}`);
            if (!contract?.id) throw new Error('Nie wybrano kontraktu');
            const contractIdString = contract.id.toString();
            const fetchSettlementData = (await contractsSettlementRepository.loadItemsFromServer({ id: contractIdString }))[0];
            const fetchInvoicesData = (await invoicesRepository.loadItemsFromServer({ contractId: contractIdString }));
            try {
                const [
                    settlementData,
                ] = await Promise.all([
                    fetchSettlementData,
                    fetchInvoicesData
                ]);
                setSettlemenData(settlementData);
                setInvoices(fetchInvoicesData);

            } catch (error) {
                console.error("Error fetching data", error);
                // Handle error as you see fit
            }
        };

        fetchData();
    }, []);

    function renderInvoiceTotaValue(invoice: Invoice) {
        return <>{invoice._totalNetValue && <div className="text-end">{Tools.formatNumber(invoice._totalNetValue)}</div>}</>
    }

    return (
        <Card >
            <Card.Body >
                <Container>
                    <Row className='mt-3'>
                        <Col >
                            {contract.description && <p>Opis: {contract.description}</p>}
                        </Col>
                    </Row>
                    <Row className='mt-3 text-end'>
                        <Col sm={4} md={2}>
                            <div>Wartość netto, zł:</div>
                            {settlemenData?.value
                                ? <h5 >{Tools.formatNumber(settlemenData.value)}</h5>
                                : 'Jeszcze nie określono'
                            }
                        </Col>
                        <MyTooltip content='Na podstawie faktur wysłanych' placement='top'>
                            <Col sm={4} md={2}>
                                <div>Rozliczono, zł:</div>
                                {settlemenData?.totalIssuedValue
                                    ? <h5>{Tools.formatNumber(settlemenData.totalIssuedValue)}</h5>
                                    : 'Jeszcze nie wysłano faktur'
                                }

                            </Col>
                        </MyTooltip>
                        <MyTooltip content='Na podstawie faktur wysłanych' placement='top'>
                            <Col sm={4} md={2}>
                                <div>Do rozliczenia, zł:</div>
                                {settlemenData?.remainingValue
                                    ? <h5>{Tools.formatNumber(settlemenData.remainingValue)}</h5>
                                    : 'Jeszcze nie określono'
                                }
                            </Col>
                        </MyTooltip>
                    </Row>

                    <Row className='mt-3'>
                        <Col sm={12}><div>Faktury</div></Col>
                        <Col sm={12}>
                            <FilterableTable<Invoice>
                                id='invoices'
                                title=''
                                tableStructure={[
                                    { header: 'Numer', objectAttributeToShow: 'number' },
                                    { header: 'Sprzedaż', objectAttributeToShow: 'issueDate' },
                                    { header: 'status', renderTdBody: (invoice: Invoice) => <InvoiceStatusBadge status={invoice.status} /> },
                                    { header: 'Wysłano', objectAttributeToShow: 'sentDate' },
                                    { header: 'Netto, zł', renderTdBody: renderInvoiceTotaValue },
                                    { header: 'Termin płatności', objectAttributeToShow: 'paymentDeadline' },
                                ]}
                                initialObjects={invoices}
                                repository={invoicesRepository}
                                selectedObjectRoute={'/invoice/'}
                                isDeletable={false}
                                externalUpdate={invoices.length}
                            />
                        </Col>
                    </Row>
                </Container >


                <p className='tekst-muted small'>
                    Koordynator(ka): {`${contract._manager.name} ${contract._manager.surname}`}<br />
                    Aktualizacja: {ToolsDate.timestampToString(contract._lastUpdated)}
                </p>
            </Card.Body >
        </Card >
    );
}