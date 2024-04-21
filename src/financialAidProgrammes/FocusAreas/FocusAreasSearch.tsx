import React, { useEffect } from "react";
import FilterableTable from "../../View/Resultsets/FilterableTable/FilterableTable";
import { FocusAreaData } from "../../../Typings/bussinesTypes";
import { focusAreasRepository } from "./FocusAreasController";
import { FocusAreasFilterBody } from "./FocusAreasFilterBody";
import { FocusAreaAddNewModalButton, FocusAreaEditModalButton } from "./Modals/FocusAreaModalButtons";
import { renderFinancialAidProgramme } from "../Programmes/FinancialAidProgrammesSearch";

export default function FocusAreasSearch({ title }: { title: string }) {
    useEffect(() => {
        document.title = title;
    }, [title]);

    return (
        <FilterableTable<FocusAreaData>
            id="focus-areas"
            title={title}
            FilterBodyComponent={FocusAreasFilterBody}
            tableStructure={[
                {
                    header: "Program",
                    renderTdBody: (focusArea) => renderFinancialAidProgramme(focusArea._financialAidProgramme),
                },
                { header: "Działanie", renderTdBody: renderFocusArea },
            ]}
            AddNewButtonComponents={[FocusAreaAddNewModalButton]}
            EditButtonComponent={FocusAreaEditModalButton}
            isDeletable={true}
            repository={focusAreasRepository}
            selectedObjectRoute={"/focusArea/"}
        />
    );
}

export function renderFocusArea(focusArea: FocusAreaData) {
    if (!focusArea) return <></>;
    return (
        <>
            <div>{focusArea.name}</div>
            <div className="text-muted">{focusArea.description}</div>
        </>
    );
}
