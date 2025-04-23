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
            <div>
                {/* Nagłówek */}
                <div className="mb-2">
                    <span>
                        [{_contract?.projectOurId}] {_contract?._ourIdOrNumber_Alias}
                    </span>{" "}
                    | <span className="fw-bold">{_milestone?._type.name}</span> <span>{_milestone?.name || ""}</span>{" "}
                    <MilestoneStatusBadge status={_milestone?.status!} />
                </div>

                {/* Opis */}
                <div className="mb-2">
                    <div className="text-dark">{item._milestone?.description}</div>
                    <div className="text-muted small">{item.description}</div>
                </div>

                {/* Kontrakt i admin */}
                <div className="mb-2 small text-muted">
                    <div>
                        Kontrakt:{" "}
                        <span className="fw-semibold">
                            [{_contract?._type?.name}] {_contract?.name || "⚠️ Brak nazwy kontraktu"}
                        </span>{" "}
                        <ContractStatusBadge status={_contract?.status!} />
                    </div>
                    <div>
                        Administrator:{" "}
                        <span className="fw-semibold">
                            {_admin ? `${_admin.name} ${_admin.surname}` : "⚠️ brak administratora"}
                        </span>
                    </div>
                </div>

                {/* Daty */}
                <div className="mb-2">
                    <span className="fw-bold">Od:</span>{" "}
                    <span className="fs-5">{ToolsDate.dateISOToDMY(item.startDate)}</span>{" "}
                    <span className="fw-bold">do:</span>{" "}
                    <span className="fs-5">{ToolsDate.dateISOToDMY(item.endDate)}</span>
                </div>

                {/* Ostatnia aktualizacja */}
                <div className="text-secondary small">
                    Ostatnia aktualizacja: {ToolsDate.dateToDDmmmYYYYHHMM(item.lastUpdated)}
                </div>
            </div>
        );
    }

    return (
        <FilterableTable<MilestoneDateData>
            id="milestone-dates"
            title={title}
            showTableHeader={false}
            FilterBodyComponent={MilestoneDatesFilterBody}
            tableStructure={[{ renderTdBody: renderRow }]}
            AddNewButtonComponents={[]}
            EditButtonComponent={MilestoneDateEditModalButton}
            isDeletable={true}
            repository={milestoneDatesRepository}
            selectedObjectRoute={"/milestonedate/"}
        />
    );
}
