import React, { useEffect } from "react";
import FilterableTable from "../../View/Resultsets/FilterableTable/FilterableTable";
import { FinancialAidProgrammeData } from "../../../Typings/bussinesTypes";
import { financialAidProgrammesRepository } from "../FinancialAidProgrammesController";
import { FinancialAidProgrammesFilterBody } from "./FinancialAidProgrammeFilterBody";
import {
    FinancialAidProgrammeAddNewModalButton,
    FinancialAidProgrammeEditModalButton,
} from "./Modals/FinancialAidProgrammeModalButtons";

export default function FinancialAidProgrammesSearch({ title }: { title: string }) {
    useEffect(() => {
        document.title = title;
    }, [title]);

    return (
        <FilterableTable<FinancialAidProgrammeData>
            id="financialAidProgrammes"
            title={title}
            FilterBodyComponent={FinancialAidProgrammesFilterBody}
            tableStructure={[
                { header: "Nazwa", objectAttributeToShow: "name" },
                { header: "Opis", objectAttributeToShow: "description" },
                { header: "URL", objectAttributeToShow: "url" },
            ]}
            AddNewButtonComponents={[FinancialAidProgrammeAddNewModalButton]}
            EditButtonComponent={FinancialAidProgrammeEditModalButton}
            isDeletable={true}
            repository={financialAidProgrammesRepository}
            selectedObjectRoute={"/FinancialAidProgramme/"}
        />
    );
}
