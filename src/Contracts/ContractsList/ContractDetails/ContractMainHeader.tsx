import React, { useEffect, useState } from "react";
import { Alert, Col, Container, Row } from "react-bootstrap";
import { Entity, OtherContract, OurContract } from "../../../../Typings/bussinesTypes";
import ToolsDate from "../../../React/ToolsDate";
import { ContractStatusBadge, GDFolderIconLink } from "../../../View/Resultsets/CommonComponents";
import { ContractModalBodyDates, ContractModalBodyName, ContractModalBodyStatus } from "../Modals/ContractModalBodiesPartial";
import { ContractPartialEditTrigger } from "../Modals/ContractModalButtons";
import { contractDatesValidationSchema, contractNameValidationSchema, contractStatusValidationSchema } from "../Modals/ContractValidationSchema";
import { useContractDetails } from "./ContractDetailsContext";

export function ContractMainHeader() {
    const { contract, setContract, contractsRepository } = useContractDetails();
    if (!contract || !setContract) return <Alert variant='danger'>Nie wybrano umowy</Alert>;
    if (!contractsRepository) return <Alert variant='danger'>Nie znaleziono repozytorium</Alert>;

    function renderEntityDetails() {
        if (!contract) return <></>;
        if (contract.ourId) {
            return (<>
                <div>Zamawiający</div>
                <h5>{renderEntityData(contract._employers || [])}</h5>
            </>)
        }
        else
            return (<>
                <div>Wykonawca</div>
                <h5>{renderEntityData(contract._contractors || [])}</h5>
            </>)
    };

    function renderEntityData(entities: Entity[]) {
        return entities.map(entity => {
            return (
                <div key={entity.id}>
                    <div>{entity.name}</div>
                    <div>{entity.address}</div>
                    <div>{entity.nip}</div>
                </div>
            )
        });
    }

    function handleEditObject(contract: OurContract | OtherContract) {
        if (setContract)
            setContract(contract);
        const newItems = contractsRepository?.items.map((o) => (o.id === contract.id ? contract : o)) || [];
        if (contractsRepository)
            contractsRepository.items = newItems;
    }

    return (
        <Container>
            <Row className='mt-3'>
                <Col sm={11} md={6} >
                    {renderEntityDetails()}
                </Col>
                {contract.ourId &&
                    <Col sm={4} md={2}>
                        <div>Oznaczenie:</div>
                        <h5>{contract.ourId}</h5>
                    </Col>
                }
                <Col sm={4} md={2}>
                    <div>Nr umowy:</div>
                    <h5>{contract.number}</h5>
                </Col>
                <Col sm={1}>
                    <ContractPartialEditTrigger
                        modalProps={{
                            initialData: contract,
                            modalTitle: 'Edycja statusu',
                            repository: contractsRepository,
                            ModalBodyComponent: ContractModalBodyStatus,
                            onEdit: handleEditObject,
                            fieldsToUpdate: ['status'],
                            makeValidationSchema: contractStatusValidationSchema,
                        }} >
                        <ContractStatusBadge status={contract?.status} />
                    </ContractPartialEditTrigger >
                </Col>
                <Col sm={1}>
                    {contract._gdFolderUrl && (
                        <GDFolderIconLink folderUrl={contract._gdFolderUrl} />
                    )}
                </Col>
                <Col sm={12} md={6}>
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
                        <>
                            <div>Nazwa:</div>
                            <h5>{contract?.name}</h5>
                        </>
                    </ContractPartialEditTrigger >
                </Col>
                <Col sm={4} md={2}>
                    <div>Data podpisania:</div>
                    <DateEditTrigger date={contract.startDate} />
                </Col>
                <Col sm={4} md={2}>
                    <div>Termin zakończenia:</div>
                    <DateEditTrigger date={contract.endDate} />
                </Col>
                <Col sm={4} md={2}>
                    <div>Gwarancja:</div>
                    <DateEditTrigger date={contract.guaranteeEndDate} />
                </Col>
            </Row >
        </Container >
    )
}

type DateEditTriggerProps = {
    date: string;
};


function DateEditTrigger({ date }: DateEditTriggerProps) {
    const { contract, setContract, contractsRepository } = useContractDetails();
    if (!contract || !setContract) return <Alert variant='danger'>Nie wybrano umowy</Alert>;
    if (!contractsRepository) return <Alert variant='danger'>Nie znaleziono repozytorium</Alert>;

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