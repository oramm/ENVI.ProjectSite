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
        return <>{focusArea._programme.name}</>;
    }

    return (
        <FilterableTable<FocusAreaData>
            id="focus-areas"
            title={title}
            FilterBodyComponent={FocusAreasFilterBody}
            tableStructure={[
                { header: "Nazwa", objectAttributeToShow: "name" },
                { header: "Opis", objectAttributeToShow: "description" },
                { header: "Program", renderTdBody: renderProgramme },
            ]}
            AddNewButtonComponents={[FocusAreaAddNewModalButton]}
            EditButtonComponent={FocusAreaEditModalButton}
            isDeletable={true}
            repository={focusAreasRepository}
            selectedObjectRoute={"/focusArea/"}
        />
    );
}
