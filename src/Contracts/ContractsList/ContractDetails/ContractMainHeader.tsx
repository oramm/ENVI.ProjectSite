import React, { useEffect, useState } from "react";
import { Alert, Col, Container, Row } from "react-bootstrap";
import ToolsDate from "../../../React/ToolsDate";
import { ContractStatusBadge, GDFolderIconLink } from "../../../View/Resultsets/CommonComponents";
import { useContract } from "../ContractContext";

export function MainContractDetailsHeader() {
    const { contract } = useContract();
    if (!contract) return <Alert variant='danger'>Nie wybrano umowy</Alert>;
    return (
        <Container>
            <Row>
                <Col sm={1} lg='1'>
                    {contract._gdFolderUrl && (
                        <GDFolderIconLink folderUrl={contract._gdFolderUrl} />
                    )}
                </Col>
                <Col sm={4} md={2}>
                    <div>Nr umowy:</div>
                    <h5>{contract.number}</h5>
                </Col>
                <Col sm='auto'>
                    {contract.name}
                </Col>
                <Col sm={4} md={2}>
                    <div>Data podpisania:</div>
                    {contract.startDate
                        ? <h5>{ToolsDate.dateYMDtoDMY(contract.startDate)} </h5>
                        : 'Jeszcze nie podpisano'}
                </Col>
                <Col sm={4} md={2}>
                    <div>Termin zakończenia:</div>
                    {contract.endDate
                        ? <h5>{ToolsDate.dateYMDtoDMY(contract.endDate)}</h5>
                        : 'Jeszcze nie ustalono'}
                </Col>
                <Col sm={1}>
                    <ContractStatusBadge status={contract.status} />
                </Col>
            </Row >
        </Container >
    )
}