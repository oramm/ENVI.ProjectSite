import React from "react";
import { MilestoneDateData } from "../../../../../Typings/bussinesTypes";
import { ContractStatusBadge, DaysLeftBadge, MilestoneStatusBadge } from "../../../../View/Resultsets/CommonComponents";
import ToolsDate from "../../../Tools/ToolsDate";
import MainSetup from "../../../MainSetupReact";
import { isOurContract } from "../../../../../Typings/typeGuards";
import { PartialEditTrigger } from "../../../../View/Modals/GeneralModalButtons";
import { useDashboardCardContext } from "../../../../View/Resultsets/DashboardCard/DashboardCardContext";
import { milestoneDatesRepository } from "../../MainWindowController";
import { Alert } from "react-bootstrap";
import {
    ContractModalBodyStatus,
    MilestoneModalBodyStatus,
} from "../../../../Contracts/Dates/Modals/MilestoneDateBodiesPartial";

interface MilestoneDateItemProps {
    object: MilestoneDateData;
    onClick?: () => void;
}

export default function MilestoneDateItem({ object: item, onClick }: MilestoneDateItemProps) {
    if (!item.id) return <>⚠️ brak ID</>;

    const _contract = item._milestone?._contract;
    const _milestone = item._milestone;
    let contractLabel = `${_contract?._ourIdOrNumber_Alias} ` || " ";

    if (isOurContract(_contract)) contractLabel += _contract?._type?.name;
    function renderDaysLeft() {
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
    function renderContractStatus(item: MilestoneDateData) {
        if (!item._milestone?._contract?.status) return <Alert variant="danger">Brak statusu</Alert>;
        const { handleEditObject } = useDashboardCardContext<MilestoneDateData>();
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
        const { handleEditObject } = useDashboardCardContext<MilestoneDateData>();
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

    return (
        <div onClick={onClick} style={{ cursor: onClick ? "pointer" : "default" }}>
            <div className="mb-2">
                {contractLabel}
                {renderContractStatus(item)}
            </div>
            <div className="mb-2">
                <span className="small">Kamień: </span>
                <span className="fw-bold me-1">{_milestone?._type.name}</span>{" "}
                <span className="me-1">{_milestone?.name || ""}</span>
                {renderMilestoneStatus(item)}
                <div className="mt-1">
                    <span className="small">Od:</span>{" "}
                    <span className="fs-6">{ToolsDate.dateISOToDMY(item.startDate)}</span>{" "}
                    <span className="small">do:</span>{" "}
                    <span className="fs-6">{ToolsDate.dateISOToDMY(item.endDate)}</span> {renderDaysLeft()}
                </div>
            </div>
        </div>
    );
}
