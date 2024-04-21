import React, { useEffect } from "react";
import FilterableTable from "../../View/Resultsets/FilterableTable/FilterableTable";
import { NeedData } from "../../../Typings/bussinesTypes";
import { NeedsFilterBody } from "./NeedsFilterBody";
import { NeedAddNewModalButton, NeedEditModalButton } from "./Modals/NeedModalButtons";
import { needsRepository } from "../FinancialAidProgrammesController";
import { ClientNeedStatusBadge } from "../../View/Resultsets/CommonComponents";
import { renderApplicationCall } from "../FocusAreas/ApplicationCalls/ApplicationCallsSearch";
import { renderFinancialAidProgramme } from "../Programmes/FinancialAidProgrammesSearch";
import { renderFocusArea } from "../FocusAreas/FocusAreasSearch";

export default function NeedsSearch({ title }: { title: string }) {
    useEffect(() => {
        document.title = title;
    }, [title]);

    function renderNeedData(need: NeedData) {
        return (
            <>
                <div>
                    {need.name} {ClientNeedStatusBadge({ status: need.status })}
                </div>
                <div className="text-muted">{need.description}</div>
            </>
        );
    }

    function renderClient(need: NeedData) {
        return <>{need._client.name}</>;
    }

    function renderApplicationCallWithContext(need: NeedData) {
        if (!need._applicationCall) return <></>;
        return (
            <>
                {renderFinancialAidProgramme(need._applicationCall._focusArea._financialAidProgramme)}
                {renderFocusArea(need._applicationCall._focusArea)}
                {renderApplicationCall(need._applicationCall)}
            </>
        );
    }

    return (
        <FilterableTable<NeedData>
            id="needs"
            title={title}
            FilterBodyComponent={NeedsFilterBody}
            tableStructure={[
                { header: "Potrzeba", renderTdBody: renderNeedData },
                { header: "Klient", renderTdBody: renderClient },
                {
                    header: "Przypisany nabór",
                    renderTdBody: renderApplicationCallWithContext,
                },
            ]}
            AddNewButtonComponents={[NeedAddNewModalButton]}
            EditButtonComponent={NeedEditModalButton}
            isDeletable={true}
            repository={needsRepository}
            selectedObjectRoute={"/need/"}
            shouldRetrieveDataBeforeEdit={true}
        />
    );
}
