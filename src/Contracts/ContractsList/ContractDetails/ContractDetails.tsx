import React, { createContext, useContext, useEffect, useState } from 'react';
import { Container, Card, Col, Row, Button, Alert } from 'react-bootstrap';
import { Contract, Entity } from '../../../../Typings/bussinesTypes';
import ToolsDate from '../../../React/ToolsDate';
import { useContract } from '../ContractContext';

export default function ContractDetails() {
    const { contract, setContract } = useContract();
    if (!contract) return <Alert variant='danger'>Nie wybrano umowy</Alert>;

    return (
        <Card >
            <Card.Body >
                <Container>
                    <Row>
                        <Col sm={4} md={2}>
                            <div>Wartość netto, zł:</div>
                            {contract.value
                                ? <h5>{contract.value}</h5>
                                : 'Jeszcze nie okreśono'}
                        </Col>
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
                    Koordynator(ka): {`${contract._manager.name} ${contract._manager.surname}`}<br />
                    Aktualizacja: {ToolsDate.timestampToString(contract._lastUpdated)}
                </p>
            </Card.Body>
        </Card >
    );
}