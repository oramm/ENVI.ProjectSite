import React, { useEffect } from "react";
import FilterableTable from "../../View/Resultsets/FilterableTable/FilterableTable";
import { MilestoneDateData } from "../../../Typings/bussinesTypes";
import ToolsDate from "../../React/ToolsDate";
import { milestoneDatesRepository } from "./MilestoneDatesController";
import { MilestoneDateEditModalButton } from "./Modals/MilestoneDateButtons";
import { MilestoneDatesFilterBody } from "./MilestoneDatesFilterBody";
import { isOurContract } from "../../../Typings/typeGuards";
import { ContractStatusBadge, MilestoneStatusBadge } from "../../View/Resultsets/CommonComponents";

export default function MilestoneDatesSearch({ title }: { title: string }) {
    useEffect(() => {
        document.title = title;
    }, [title]);

    function renderRow(item: MilestoneDateData) {
        if (!item.id) return <>"⚠️ brak ID"</>;
        const _contract = item._milestone?._contract;
        const _milestone = item._milestone;
        const _admin = isOurContract(_contract) ? _contract?._admin : _contract?._ourContract?._admin;

        return (
            <>
                <span className="text-info">
                    [{_contract?.projectOurId}] {_contract?._ourIdOrNumber_Alias} | {_milestone?._type.name}{" "}
                    {_milestone?.name || ""} <MilestoneStatusBadge status={_milestone?.status!} />
                </span>
                <div className="mb-2">
                    {item._milestone?.description || ""} {item.description || ""}
                </div>
                <div className="text-muted mb-2">
                    Kontrakt: [{_contract?._type?.name}] {_contract?.name || "⚠️ Brak nazwy kontraktu"}{" "}
                    <ContractStatusBadge status={_contract?.status!} />
                </div>
                <div className="text-muted mb-2">
                    Administrator: {_admin ? `${_admin.name} ${_admin.surname}` : "⚠️ brak administratora"}
                </div>
                <div className="mb-2">
                    Od: <span className="fs-4">{ToolsDate.dateISOToDMY(item.startDate)}</span> do:{" "}
                    <span className="fs-4">{ToolsDate.dateISOToDMY(item.endDate)}</span>
                </div>
                <div className="text-secondary small">
                    Ostatnia aktualizacja: {ToolsDate.dateToDDmmmYYYYHHMM(item.lastUpdated)}
                </div>
            </>
        );
    }

    return (
        <FilterableTable<MilestoneDateData>
            id="milestone-dates"
            title={title}
            FilterBodyComponent={MilestoneDatesFilterBody}
            tableStructure={[{ header: "Zakres czasowy", renderTdBody: renderRow }]}
            AddNewButtonComponents={[]}
            EditButtonComponent={MilestoneDateEditModalButton}
            isDeletable={true}
            repository={milestoneDatesRepository}
            selectedObjectRoute={"/milestonedate/"}
        />
    );
}
