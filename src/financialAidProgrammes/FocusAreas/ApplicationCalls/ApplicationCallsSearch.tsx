import React, { useEffect } from "react";
import FilterableTable from "../../../View/Resultsets/FilterableTable/FilterableTable";
import { ApplicationCallData } from "../../../../Typings/bussinesTypes";
import { applicationCallsRepository } from "./ApplicationCallsController";
import { ApplicationCallsFilterBody } from "./ApplicationCallFilterBody";
import { ApplicationCallAddNewModalButton, ApplicationCallEditModalButton } from "./Modals/ApplicationCallModalButtons";

export default function ApplicationCallsSearch({ title }: { title: string }) {
    useEffect(() => {
        document.title = title;
    }, [title]);

    function renderFocusArea(applicationCall: ApplicationCallData) {
        return <>{applicationCall._focusArea.name}</>;
    }

    return (
        <FilterableTable<ApplicationCallData>
            id="application-calls"
            title={title}
            FilterBodyComponent={ApplicationCallsFilterBody}
            tableStructure={[
                { header: "Opis", objectAttributeToShow: "description" },
                { header: "URL", objectAttributeToShow: "url" },
                { header: "Data rozpoczęcia", objectAttributeToShow: "startDate" },
                { header: "Data zakończenia", objectAttributeToShow: "endDate" },
                { header: "Status", objectAttributeToShow: "status" },
                { header: "Obszar interwencji", renderTdBody: renderFocusArea },
            ]}
            AddNewButtonComponents={[ApplicationCallAddNewModalButton]}
            EditButtonComponent={ApplicationCallEditModalButton}
            isDeletable={true}
            repository={applicationCallsRepository}
            selectedObjectRoute={"/applicationCall/"}
        />
    );
}
