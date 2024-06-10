import React, { useEffect, useState } from "react";
import { Alert, Col, Container, Row } from "react-bootstrap";
import { EntityData, OtherContract, OurContract } from "../../../../Typings/bussinesTypes";
import ToolsDate from "../../../React/ToolsDate";
import { PartialEditTrigger } from "../../../View/Modals/GeneralModalButtons";
import { ContractStatusBadge, GDFolderIconLink } from "../../../View/Resultsets/CommonComponents";
import {
    ContractModalBodyDates,
    ContractModalBodyName,
    ContractModalBodyStatus,
} from "../Modals/ContractModalBodiesPartial";
import {
    contractDatesValidationSchema,
    contractNameValidationSchema,
    contractStatusValidationSchema,
} from "../Modals/ContractValidationSchema";
import { useContractDetails } from "./ContractDetailsContext";

export function ContractMainHeader() {
    const { contract, setContract, contractsRepository } = useContractDetails();
    if (!contract || !setContract) return <Alert variant="danger">Nie wybrano umowy</Alert>;
    if (!contractsRepository) return <Alert variant="danger">Nie znaleziono repozytorium</Alert>;
    if (!contract.startDate) return <Alert variant="danger">Umowa nie ma daty rozpoczęcia</Alert>;
    if (!contract.endDate) return <Alert variant="danger">Umowa nie ma daty zakończenia</Alert>;
    if (!contract.guaranteeEndDate) return <Alert variant="danger">Umowa nie ma daty gwarancji</Alert>;

    function renderEntityDetails() {
        if (!contract) return <></>;
        if ("ourId" in contract) {
            return (
                <>
                    <div>Zamawiający</div>
                    <h5>{renderEntityData(contract._employers || [])}</h5>
                </>
            );
        } else
            return (
                <>
                    <div>Wykonawca</div>
                    <h5>{renderEntityData(contract._contractors || [])}</h5>
                </>
            );
    }

    function renderEntityData(entities: EntityData[]) {
        return entities.map((entity) => {
            return (
                <div key={entity.id}>
                    <div>{entity.name}</div>
                    <div>{entity.address}</div>
                    <div>{entity.taxNumber}</div>
                </div>
            );
        });
    }

    function handleEditObject(contract: OurContract | OtherContract) {
        if (setContract) setContract(contract);
        const newItems = contractsRepository?.items.map((o) => (o.id === contract.id ? contract : o)) || [];
        if (contractsRepository) contractsRepository.items = newItems;
    }

    return (
        <Container>
            <Row className="mt-3">
                <Col sm={11} md={6}>
                    {renderEntityDetails()}
                </Col>
                {"ourId" in contract && (
                    <Col sm={4} md={2}>
                        <div>Oznaczenie:</div>
                        <h5>{contract.ourId}</h5>
                    </Col>
                )}
                <Col sm={4} md={2}>
                    <div>Nr umowy:</div>
                    <h5>{contract.number}</h5>
                </Col>
                <Col sm={1}>
                    <PartialEditTrigger
                        modalProps={{
                            initialData: contract,
                            modalTitle: "Edycja statusu",
                            repository: contractsRepository,
                            ModalBodyComponent: ContractModalBodyStatus,
                            onEdit: handleEditObject,
                            fieldsToUpdate: ["status"],
                            makeValidationSchema: contractStatusValidationSchema,
                        }}
                    >
                        <ContractStatusBadge status={contract?.status} />
                    </PartialEditTrigger>
                </Col>
                <Col sm={1}>{contract._gdFolderUrl && <GDFolderIconLink folderUrl={contract._gdFolderUrl} />}</Col>
                <Col sm={12} md={6}>
                    <PartialEditTrigger
                        modalProps={{
                            initialData: contract,
                            modalTitle: "Edycja nazwy",
                            repository: contractsRepository,
                            ModalBodyComponent: ContractModalBodyName,
                            onEdit: (contract) => {
                                setContract(contract);
                            },
                            fieldsToUpdate: ["name"],
                            makeValidationSchema: contractNameValidationSchema,
                        }}
                    >
                        <>
                            <div>Nazwa:</div>
                            <h5>{contract?.name}</h5>
                        </>
                    </PartialEditTrigger>
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
            </Row>
        </Container>
    );
}

type DateEditTriggerProps = {
    date: string;
};

function DateEditTrigger({ date }: DateEditTriggerProps) {
    const { contract, setContract, contractsRepository } = useContractDetails();
    if (!contract || !setContract) return <Alert variant="danger">Nie wybrano umowy</Alert>;
    if (!contractsRepository) return <Alert variant="danger">Nie znaleziono repozytorium</Alert>;

    return (
        <PartialEditTrigger
            modalProps={{
                initialData: contract,
                modalTitle: "Edycja dat",
                repository: contractsRepository,
                ModalBodyComponent: ContractModalBodyDates,
                onEdit: (contract) => {
                    setContract(contract);
                },
                fieldsToUpdate: ["startDate", "endDate", "guaranteeEndDate"],
                makeValidationSchema: contractDatesValidationSchema,
            }}
        >
            {date ? <h5>{ToolsDate.dateYMDtoDMY(date)}</h5> : <>{"Jeszcze nie ustalono"}</>}
        </PartialEditTrigger>
    );
}
