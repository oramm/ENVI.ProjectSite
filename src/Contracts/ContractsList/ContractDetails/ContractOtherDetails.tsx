import React, { createContext, useContext, useEffect, useState } from 'react';
import { Container, Card, Col, Row, Button, Alert } from 'react-bootstrap';
import { ContractsSettlementData, Entity, Invoice } from '../../../../Typings/bussinesTypes';
import ToolsDate from '../../../React/ToolsDate';
import { contractsSettlementRepository, invoicesRepository } from '../ContractsController';
import { useContractDetails } from './ContractDetailsContext';

export default function ContractOtherDetails() {
    const { contract, setContract, contractsRepository } = useContractDetails();
    const [settlemenData, setSettlemenData] = useState(undefined as ContractsSettlementData | undefined);
    const [invoices, setInvoices] = useState(undefined as Invoice[] | undefined);
    if (!contract) return <Alert variant='danger'>Nie wybrano umowy</Alert>;


    //fetch data
    useEffect(() => {
        async function fetchData() {
            if (!contract?.id) throw new Error('Nie kontraktu');
            const params = { id: contract.id.toString() }
            const fetchSettlementData = (await contractsSettlementRepository.loadItemsFromServer(params))[0];
            const fetchInvoicesData = (await invoicesRepository.loadItemsFromServer(params));
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


    return (
        <Card >
            <Card.Body >
                <Container>
                    <Row>
                        {contract._contractors &&
                            < Col sm={12} md={8}>
                                <div>Wykonawcy:</div>
                                <h5>{contract._contractors.map((contractor: Entity) => <span>{contractor.name}</span>)}
                                </h5>
                            </Col>
                        }
                    </Row>
                    <Row>
                        <Col >
                            {contract.description && <p>Opis: {contract.description}</p>}
                        </Col>
                    </Row>
                </Container >


                <p className='tekst-muted small'>
                    Aktualizacja: {ToolsDate.timestampToString(contract._lastUpdated)}
                </p>
            </Card.Body>
        </Card >
    );
}