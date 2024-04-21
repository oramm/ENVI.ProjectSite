import React, { useEffect } from "react";
import FilterableTable from "../../../View/Resultsets/FilterableTable/FilterableTable";
import { ApplicationCallData } from "../../../../Typings/bussinesTypes";
import { applicationCallsRepository } from "./ApplicationCallsController";
import { ApplicationCallsFilterBody } from "./ApplicationCallFilterBody";
import { ApplicationCallAddNewModalButton, ApplicationCallEditModalButton } from "./Modals/ApplicationCallModalButtons";
import { ApplicationCallStatusBadge } from "../../../View/Resultsets/CommonComponents";
import { renderFinancialAidProgramme } from "../../Programmes/FinancialAidProgrammesSearch";
import { renderFocusArea } from "../FocusAreasSearch";

export default function ApplicationCallsSearch({ title }: { title: string }) {
    useEffect(() => {
        document.title = title;
    }, [title]);

    return (
        <FilterableTable<ApplicationCallData>
            id="application-calls"
            title={title}
            FilterBodyComponent={ApplicationCallsFilterBody}
            tableStructure={[
                {
                    header: "Program",
                    renderTdBody: (applicationCall) =>
                        renderFinancialAidProgramme(applicationCall._focusArea._financialAidProgramme),
                },
                { header: "Działanie", renderTdBody: (applicationCall) => renderFocusArea(applicationCall._focusArea) },
                { header: "Nabór", renderTdBody: renderApplicationCall },
            ]}
            AddNewButtonComponents={[ApplicationCallAddNewModalButton]}
            EditButtonComponent={ApplicationCallEditModalButton}
            isDeletable={true}
            repository={applicationCallsRepository}
            selectedObjectRoute={"/applicationCall/"}
        />
    );
}
export function renderApplicationCall(applicationCall: ApplicationCallData) {
    if (!applicationCall) return <></>;
    return (
        <>
            <div>
                {renderApplicationCallLink(applicationCall) || applicationCall.description}{" "}
                {ApplicationCallStatusBadge({ status: applicationCall.status })}
            </div>
            <div className="text-muted">
                Od: {applicationCall.startDate} do: {applicationCall.endDate}
            </div>
        </>
    );
}

export function renderApplicationCallLink(applicationCall: ApplicationCallData) {
    if (!applicationCall.url) return null;
    return (
        <a href={applicationCall.url} target="_blank" rel="noreferrer" className="text-primary text-decoration-none">
            {applicationCall.description}
        </a>
    );
}
