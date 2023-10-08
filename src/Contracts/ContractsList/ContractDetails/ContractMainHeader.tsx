import React, { useEffect, useState } from "react";
import { Alert, Col, Container, Row } from "react-bootstrap";
import ToolsDate from "../../../React/ToolsDate";
import { ContractStatusBadge, GDFolderIconLink } from "../../../View/Resultsets/CommonComponents";
import { useContract } from "../ContractContext";
import { contractsRepository } from "../ContractsController";
import { ContractModalBodyDates, ContractModalBodyName, ContractModalBodyStatus } from "../Modals/ContractModalBodiesPartial";
import { ContractPartialEditTrigger } from "../Modals/ContractModalButtons";
import { contractDatesValidationSchema, contractNameValidationSchema, contractStatusValidationSchema } from "../Modals/ContractValidationSchema";

export function MainContractDetailsHeader() {
    const { contract, setContract } = useContract();
    if (!contract || !setContract) return <Alert variant='danger'>Nie wybrano umowy</Alert>;
    return (
        <Container>
            <Row className='mt-3'>
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
                    <ContractPartialEditTrigger
                        modalProps={{
                            initialData: contract,
                            modalTitle: 'Edycja nazwy',
                            repository: contractsRepository,
                            ModalBodyComponent: ContractModalBodyName,
                            onEdit: (contract) => { setContract(contract) },
                            fieldsToUpdate: ['name'],
                            makeValidationSchema: contractNameValidationSchema,
                        }} >
                        <>{contract?.name}</>
                    </ContractPartialEditTrigger >
                </Col>
                <Col sm={4} md={2}>
                    <div>Data podpisania:</div>
                    <DateEditTrigger date={contract.startDate} />
                </Col>
                <Col sm={4} md={2}>
                    <div>Termin zakończenia:</div>
                    {contract.endDate
                        ? <h5>{ToolsDate.dateYMDtoDMY(contract.endDate)}</h5>
                        : 'Jeszcze nie ustalono'}
                </Col>
                <Col sm={1}>
                    <ContractPartialEditTrigger
                        modalProps={{
                            initialData: contract,
                            modalTitle: 'Edycja statusu',
                            repository: contractsRepository,
                            ModalBodyComponent: ContractModalBodyStatus,
                            onEdit: (contract) => { setContract(contract) },
                            fieldsToUpdate: ['status'],
                            makeValidationSchema: contractStatusValidationSchema,
                        }} >
                        <ContractStatusBadge status={contract?.status} />
                    </ContractPartialEditTrigger >
                </Col>
            </Row >
        </Container >
    )
}

type DateEditTriggerProps = {
    date: string;
};


function DateEditTrigger({ date }: DateEditTriggerProps) {
    const { contract, setContract } = useContract();
    if (!contract || !setContract) return <Alert variant='danger'>Nie wybrano umowy</Alert>;

    return (
        <ContractPartialEditTrigger
            modalProps={{
                initialData: contract,
                modalTitle: 'Edycja dat',
                repository: contractsRepository,
                ModalBodyComponent: ContractModalBodyDates,
                onEdit: (contract) => { setContract(contract) },
                fieldsToUpdate: ['startDate', 'endDate', 'guaranteeEndDate'],
                makeValidationSchema: contractDatesValidationSchema,
            }}
        >
            {date
                ? <h5>{ToolsDate.dateYMDtoDMY(date)}</h5>
                : <>{'Jeszcze nie ustalono'}</>
            }
        </ContractPartialEditTrigger>
    );
}
