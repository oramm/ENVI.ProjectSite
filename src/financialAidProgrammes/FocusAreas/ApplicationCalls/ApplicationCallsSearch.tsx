import React, { useEffect } from "react";
import FilterableTable from "../../../View/Resultsets/FilterableTable/FilterableTable";
import { ApplicationCallData } from "../../../../Typings/bussinesTypes";
import { applicationCallsRepository } from "./ApplicationCallsController";
import { ApplicationCallsFilterBody } from "./ApplicationCallFilterBody";
import { ApplicationCallAddNewModalButton, ApplicationCallEditModalButton } from "./Modals/ApplicationCallModalButtons";
import { ApplicationCallStatusBadge } from "../../../View/Resultsets/CommonComponents";

export default function ApplicationCallsSearch({ title }: { title: string }) {
    useEffect(() => {
        document.title = title;
    }, [title]);

    function renderFocusArea(applicationCall: ApplicationCallData) {
        return <>{applicationCall._focusArea.name}</>;
    }

    function renderApplicationCallLink(applicationCall: ApplicationCallData) {
        if (!applicationCall.url) return null;
        return (
            <a
                href={applicationCall.url}
                target="_blank"
                rel="noreferrer"
                className="text-primary text-decoration-none"
            >
                {applicationCall.description}
            </a>
        );
    }

    function renderApplicationCallDescritpion(applicationCall: ApplicationCallData) {
        return (
            <>
                {renderApplicationCallLink(applicationCall) || applicationCall.description}{" "}
                {ApplicationCallStatusBadge({ status: applicationCall.status })}
            </>
        );
    }

    return (
        <FilterableTable<ApplicationCallData>
            id="application-calls"
            title={title}
            FilterBodyComponent={ApplicationCallsFilterBody}
            tableStructure={[
                { header: "Obszar interwencji", renderTdBody: renderFocusArea },
                { header: "Opis", renderTdBody: renderApplicationCallDescritpion },
                { header: "Data rozpoczęcia", objectAttributeToShow: "startDate" },
                { header: "Data zakończenia", objectAttributeToShow: "endDate" },
            ]}
            AddNewButtonComponents={[ApplicationCallAddNewModalButton]}
            EditButtonComponent={ApplicationCallEditModalButton}
            isDeletable={true}
            repository={applicationCallsRepository}
            selectedObjectRoute={"/applicationCall/"}
        />
    );
}
