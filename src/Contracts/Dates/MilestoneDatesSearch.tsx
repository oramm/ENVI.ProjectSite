import React, { useEffect } from "react";
import FilterableTable from "../../View/Resultsets/FilterableTable/FilterableTable";
import { MilestoneDateData } from "../../../Typings/bussinesTypes";
import ToolsDate from "../../React/ToolsDate";
import { milestoneDatesRepository } from "./MilestoneDatesController";
import { MilestoneDateEditModalButton } from "./Modals/MilestoneDateButtons";
import { MilestoneDatesFilterBody } from "./MilestoneDatesFilterBody";

export default function MilestoneDatesSearch({ title }: { title: string }) {
    useEffect(() => {
        document.title = title;
    }, [title]);

    function renderRow(item: MilestoneDateData) {
        if (!item.id) return <>"⚠️ brak ID"</>;
        const _contract = item._milestone?._contract;
        const _milestone = item._milestone;
        return (
            <>
                <span className="text-info">
                    [{_contract?.projectOurId}] {_contract?._ourIdOrNumber_Alias} | {_milestone?._type.name}{" "}
                    {_milestone?.name || ""}
                </span>
                <div className="mb-2">
                    {item._milestone?.description || ""} {item.description || ""}
                </div>
                <div className="text-muted mb-2">
                    Kontrakt: [{_contract?._type?.name}] {_contract?.name || "⚠️ Brak nazwy kontraktu"}
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
