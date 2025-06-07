import React, { useEffect } from "react";
import FilterableTable from "../../View/Resultsets/FilterableTable/FilterableTable";
import { ContractRangeData } from "../../../Typings/bussinesTypes";
import { ContractRangeAddNewModalButton, ContractRangeEditModalButton } from "./Modals/ContractRangeModalButtons";
import { contractRangesRepository } from "./ContractRangesController";
import { ContractRangeFilterBody } from "./ContractRangeFilterBody";

export default function ContractRangesSearch({ title }: { title: string }) {
    useEffect(() => {
        document.title = title;
    }, [title]);

    function buildLabelFromContractRanges(contractRanges: ContractRangeData[]): string {
        if (!contractRanges || contractRanges.length === 0) return "";

        let label = "";
        for (let i = 0; i < contractRanges.length - 1; i++) {
            label += contractRanges[i].name + "\n ";
        }
        label += contractRanges[contractRanges.length - 1].name;

        return label;
    }

    return (
        <FilterableTable<ContractRangeData>
            id="contractRanges"
            title={title}
            FilterBodyComponent={ContractRangeFilterBody}
            tableStructure={[
                { header: "Nazwa", objectAttributeToShow: "name" },
                { header: "Opis", objectAttributeToShow: "description" },
            ]}
            AddNewButtonComponents={[ContractRangeAddNewModalButton]}
            EditButtonComponent={ContractRangeEditModalButton}
            isDeletable={true}
            repository={contractRangesRepository}
            selectedObjectRoute={"/contractRange/"}
        />
    );
}
