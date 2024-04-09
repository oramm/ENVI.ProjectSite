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

export default function ContractsSearch({ title }: { title: string }) {
    useEffect(() => {
        document.title = title;
    }, [title]);

    function renderName(contract: OurContract | OtherContract) {
        return (
            <>
                {contract.name} <ContractStatusBadge status={contract.status} />
            </>
        );
    }

    function renderOurId(contract: OurContract | OtherContract) {
        const ourId = "ourId" in contract ? (contract as OurContract).ourId : "";
        return <>{ourId}</>;
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
                { header: "Numer", objectAttributeToShow: "number" },
                { header: "Nazwa", renderTdBody: (contract: OurContract | OtherContract) => renderName(contract) },
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
