import React, { useEffect } from "react";
import FilterableTable from "../../View/Resultsets/FilterableTable/FilterableTable";
import { ApplicationCallData, NeedData } from "../../../Typings/bussinesTypes";
import { NeedsFilterBody } from "./NeedsFilterBody";
import { NeedAddNewModalButton, NeedEditModalButton } from "./Modals/NeedModalButtons";
import { needsRepository } from "../FinancialAidProgrammesController";
import { ClientNeedStatusBadge } from "../../View/Resultsets/CommonComponents";

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

    function renderApplicationCall(need: NeedData) {
        if (!need._applicationCall) return <></>;
        return (
            <>
                <div>{renderApplicationCallLink(need._applicationCall) || need._applicationCall.description}</div>
                <div className="text-muted">{need._applicationCall?.endDate}</div>
            </>
        );
    }

    function renderClient(need: NeedData) {
        return <>{need._client.name}</>;
    }

    return (
        <FilterableTable<NeedData>
            id="needs"
            title={title}
            FilterBodyComponent={NeedsFilterBody}
            tableStructure={[
                { header: "Potrzeba", renderTdBody: renderNeedData },
                { header: "Klient", renderTdBody: renderClient },
                { header: "Przypisany nabór", renderTdBody: renderApplicationCall },
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
