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
            tableStructure={[{ header: "Program", renderTdBody: renderFinancialAidProgramme }]}
            AddNewButtonComponents={[FinancialAidProgrammeAddNewModalButton]}
            EditButtonComponent={FinancialAidProgrammeEditModalButton}
            isDeletable={true}
            repository={financialAidProgrammesRepository}
            selectedObjectRoute={"/FinancialAidProgramme/"}
        />
    );
}

export function renderFinancialAidProgramme(financialAidProgramme: FinancialAidProgrammeData) {
    if (!financialAidProgramme) return <></>;
    return (
        <>
            <div>{renderfinancialAidProgrammeLink(financialAidProgramme)}</div>
            <div>{financialAidProgramme.name}</div>
            <div className="text-muted">{financialAidProgramme.description}</div>
        </>
    );
}

export function renderfinancialAidProgrammeLink(financialAidProgramme: FinancialAidProgrammeData) {
    if (!financialAidProgramme.url) return <>{financialAidProgramme.alias}</>;
    return (
        <a
            href={financialAidProgramme.url}
            target="_blank"
            rel="noreferrer"
            className="text-primary text-decoration-none"
        >
            {financialAidProgramme.alias}
        </a>
    );
}
