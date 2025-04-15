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
        return (
            <>
                {item.id ? item.id : "⚠️ brak ID"}
                <h6>
                    {item._milestone?._contract?._ourIdOrNumber_Alias} | {item._milestone?._type.name}{" "}
                    {item._milestone?.name || ""}
                </h6>
                <div className="text-muted">{item._milestone?._contract?.name || "⚠️ Brak nazwy kontraktu"}</div>
                <div>
                    Od: <strong>{ToolsDate.dateISOToDMY(item.startDate)}</strong> do{" "}
                    <strong>{ToolsDate.dateISOToDMY(item.endDate)}</strong>
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
