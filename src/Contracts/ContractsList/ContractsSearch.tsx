import React, { useEffect } from "react";
import { OtherContract, OurContract, Task } from "../../../Typings/bussinesTypes";
import { ContractStatusBadge } from "../../View/Resultsets/CommonComponents";
import FilterableTable from "../../View/Resultsets/FilterableTable/FilterableTable";
import { contractsRepository } from "./ContractsController";
import { ContractsFilterBody } from "./ContractsFilterBody";
import {
    ContractEditModalButton,
    OtherContractAddNewModalButton,
    OurContractAddNewModalButton,
} from "./Modals/ContractModalButtons";
import { Badge } from "react-bootstrap";

export default function ContractsSearch({ title }: { title: string }) {
    useEffect(() => {
        document.title = title;
    }, [title]);

    function renderName(contract: OurContract | OtherContract) {
        return (
            <>
                <strong>{ourIdLabel(contract)}</strong> {numberLabel(contract)} {contract.name}{" "}
                <ContractStatusBadge status={contract.status} />
                <div>{renderRangeNames(contract)}</div>
            </>
        );
    }

    function renderRangeNames(contract: OurContract | OtherContract) {
        if (!contract._contractRangesNames) return null;
        return (
            <div>
                {contract._contractRangesNames.map((name, index) => (
                    <Badge key={index} pill bg="light" className="mr-1 mt-2 mb-3 text-dark">
                        {name}
                    </Badge>
                ))}
            </div>
        );
    }

    function numberLabel(contract: OurContract | OtherContract) {
        if ("ourId" in contract && contract.number === contract.ourId) return null;
        return `[${contract.number}]` || null;
    }

    function ourIdLabel(contract: OurContract | OtherContract) {
        if (!("ourId" in contract)) return null;
        return (contract as OurContract).ourId;
    }

    return (
        <FilterableTable<OurContract | OtherContract>
            id="contracts"
            title={title}
            FilterBodyComponent={ContractsFilterBody}
            tableStructure={[
                {
                    header: "Projekt",
                    renderTdBody: (contract: OurContract | OtherContract) => <>{contract._project.ourId}</>,
                },
                { header: "Oznaczenie", renderTdBody: (contract: OurContract | OtherContract) => renderName(contract) },
                { header: "Rozpoczęcie", objectAttributeToShow: "startDate" },
                { header: "Zakończenie", objectAttributeToShow: "endDate" },
                { header: "Gwarancja do", objectAttributeToShow: "guaranteeEndDate" },
            ]}
            AddNewButtonComponents={[OurContractAddNewModalButton, OtherContractAddNewModalButton]}
            EditButtonComponent={ContractEditModalButton}
            isDeletable={true}
            repository={contractsRepository}
            selectedObjectRoute={"/contract/"}
            shouldRetrieveDataBeforeEdit={true}
        />
    );
}
