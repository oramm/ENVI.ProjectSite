import React, { useEffect } from "react";
import FilterableTable from "../../View/Resultsets/FilterableTable/FilterableTable";
import { FocusAreaData } from "../../../Typings/bussinesTypes";
import { focusAreasRepository } from "./FocusAreasController";
import { FocusAreasFilterBody } from "./FocusAreasFilterBody";
import { FocusAreaAddNewModalButton, FocusAreaEditModalButton } from "./Modals/FocusAreaModalButtons";

export default function FocusAreasSearch({ title }: { title: string }) {
    useEffect(() => {
        document.title = title;
    }, [title]);

    function renderProgramme(focusArea: FocusAreaData) {
        return <>{renderProgrammeLink(focusArea) || focusArea._financialAidProgramme.alias}</>;
    }

    function renderProgrammeLink(focusArea: FocusAreaData) {
        const { _financialAidProgramme } = focusArea;
        if (!_financialAidProgramme.url) return null;
        return (
            <a
                href={_financialAidProgramme.url}
                target="_blank"
                rel="noreferrer"
                className="text-primary text-decoration-none"
            >
                {_financialAidProgramme.alias}
            </a>
        );
    }

    return (
        <FilterableTable<FocusAreaData>
            id="focus-areas"
            title={title}
            FilterBodyComponent={FocusAreasFilterBody}
            tableStructure={[
                { header: "Program", renderTdBody: renderProgramme },
                { header: "Nazwa", objectAttributeToShow: "name" },
                { header: "Opis", objectAttributeToShow: "description" },
            ]}
            AddNewButtonComponents={[FocusAreaAddNewModalButton]}
            EditButtonComponent={FocusAreaEditModalButton}
            isDeletable={true}
            repository={focusAreasRepository}
            selectedObjectRoute={"/focusArea/"}
        />
    );
}
