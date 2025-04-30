import React, { useEffect, useState } from "react";
import FilterableTable from "../../View/Resultsets/FilterableTable/FilterableTable";
import { MilestoneDateData, OtherContract, OurContract } from "../../../Typings/bussinesTypes";
import ToolsDate from "../../React/ToolsDate";
import { milestoneDatesRepository } from "./MilestoneDatesController";
import { MilestoneDateEditModalButton } from "./Modals/MilestoneDateButtons";
import { MilestoneDatesFilterBody } from "./MilestoneDatesFilterBody";
import { isOurContract } from "../../../Typings/typeGuards";
import { ContractStatusBadge, DaysLeftBadge, MilestoneStatusBadge } from "../../View/Resultsets/CommonComponents";
import { PartialEditTrigger } from "../../View/Modals/GeneralModalButtons";
import { ContractModalBodyStatus, MilestoneModalBodyStatus } from "./Modals/MilestoneDateBodiesPartial";
import { useFilterableTableContext } from "../../View/Resultsets/FilterableTable/FilterableTableContext";
import { Alert } from "react-bootstrap";
import MainSetup from "../../React/MainSetupReact";

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
                    {renderMilestoneStatus(item)}
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
                        {renderContractStatus(item)}
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
                    <span className="fs-5">{ToolsDate.dateISOToDMY(item.endDate)}</span>{" "}
                    <span>{renderDaysLeft(item)}</span>
                </div>

                {/* Ostatnia aktualizacja */}
                <div className="text-secondary small">
                    Ostatnia aktualizacja: {ToolsDate.dateToDDmmmYYYYHHMM(item.lastUpdated)}
                </div>
            </div>
        );
    }

    function renderContractStatus(item: MilestoneDateData) {
        if (!item._milestone?._contract?.status) return <Alert variant="danger">Brak statusu</Alert>;
        const { handleEditObject } = useFilterableTableContext<MilestoneDateData>();
        return (
            <PartialEditTrigger
                modalProps={{
                    initialData: item,
                    modalTitle: `Edycja statusu kontraktu ${item._milestone?._contract?._ourIdOrNumber_Alias}`,
                    repository: milestoneDatesRepository,
                    ModalBodyComponent: ContractModalBodyStatus,
                    onEdit: handleEditObject,
                    fieldsToUpdate: ["status"],
                    specialActionRoute: "milestoneDateContract",
                    //makeValidationSchema: contractStatusValidationSchema,
                }}
            >
                <ContractStatusBadge status={item._milestone?._contract?.status || ""} />
            </PartialEditTrigger>
        );
    }

    function renderMilestoneStatus(item: MilestoneDateData) {
        const { handleEditObject } = useFilterableTableContext<MilestoneDateData>();
        return (
            <PartialEditTrigger
                modalProps={{
                    initialData: item,
                    modalTitle: `Edycja statusu kamienia milowego ${item._milestone?._FolderNumber_TypeName_Name}`,
                    repository: milestoneDatesRepository,
                    ModalBodyComponent: MilestoneModalBodyStatus,
                    onEdit: handleEditObject,
                    fieldsToUpdate: ["status"],
                    specialActionRoute: "milestoneDateMilestone",
                    //makeValidationSchema: contractStatusValidationSchema,
                }}
            >
                <MilestoneStatusBadge status={item._milestone?.status || ""} />
            </PartialEditTrigger>
        );
    }

    function renderDaysLeft(item: MilestoneDateData) {
        if (
            !item._milestone?.status ||
            ![MainSetup.MilestoneStatus.IN_PROGRESS, MainSetup.MilestoneStatus.NOT_STARTED].includes(
                item._milestone.status
            )
        )
            return null;
        const daysLeft = ToolsDate.countDaysLeftTo(item.endDate);
        return <DaysLeftBadge daysLeft={daysLeft} />;
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
