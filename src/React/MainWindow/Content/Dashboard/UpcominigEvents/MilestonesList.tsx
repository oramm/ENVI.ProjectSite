import React, { useEffect, useState } from "react";
import { Alert, Card } from "react-bootstrap";
import { MilestoneDateData, OtherContract, OurContract } from "../../../../../../Typings/bussinesTypes";

import { PartialEditTrigger } from "../../../../../View/Modals/GeneralModalButtons";
import {
    ContractStatusBadge,
    DaysLeftBadge,
    MilestoneStatusBadge,
    MyTooltip,
} from "../../../../../View/Resultsets/CommonComponents";
import FilterableTable from "../../../../../View/Resultsets/FilterableTable/FilterableTable";
import MainSetup from "../../../../MainSetupReact";
import Tools from "../../../../Tools/Tools";
import ToolsDate from "../../../../Tools/ToolsDate";
import { SectionNode } from "../../../../../View/Resultsets/FilterableTable/Section";
import { RowStructure } from "../../../../../View/Resultsets/FilterableTable/FilterableTableTypes";
import { milestoneDatesRepository } from "../../../MainWindowController";
import {
    ContractModalBodyStatus,
    MilestoneModalBodyStatus,
} from "../../../../../Contracts/Dates/Modals/MilestoneDateBodiesPartial";
import { useFilterableTableContext } from "../../../../../View/Resultsets/FilterableTable/FilterableTableContext";
import { isOurContract } from "../../../../../../Typings/typeGuards";
import { MilestoneDateEditModalButton } from "../../../../../Contracts/Dates/Modals/MilestoneDateButtons";

export default function MilestonesList() {
    const [milestoneDates, setMilestoneDates] = useState([] as MilestoneDateData[]);
    const [sections, setSections] = useState([] as SectionNode<MilestoneDateData>[]);

    const [externalUpdate, setExternalUpdate] = useState(0);
    const [dataLoaded, setDataLoaded] = useState(false);

    useEffect(() => {
        document.title = "Główna";
    }, []);

    useEffect(() => {
        async function fetchData() {
            setDataLoaded(false);
            const endDateTo = ToolsDate.addDays(new Date(), -130);
            const milestones = await milestoneDatesRepository.loadItemsFromServerPOST([
                {
                    milestoneStatuses: [MainSetup.MilestoneStatus.IN_PROGRESS, MainSetup.MilestoneStatus.NOT_STARTED],
                    endDateTo: endDateTo.toISOString().slice(0, 10),
                    getRemainingValue: true,
                    _admin: filterByCurrentUser() ? MainSetup.getCurrentUserAsPerson() : undefined,
                },
            ]);
            setMilestoneDates(milestones);
            setDataLoaded(true);
        }

        fetchData();
    }, []);

    useEffect(() => {
        const ourMilestones = milestoneDates.filter((m) => m._milestone?._contract?._type.isOur);
        const otherMilestones = milestoneDates.filter((m) => !m._milestone?._contract?._type.isOur);
        setSections(buildTree(ourMilestones, otherMilestones));
        setExternalUpdate((prevState) => prevState + 1);
    }, [milestoneDates]);

    /**
     * Filtrowanie będzie tylko dla użytkowników z uprawnieniami poniżej ENVI_MANAGER i ADMIN
     */
    function filterByCurrentUser() {
        const privilegedRoles = [MainSetup.SystemRoles.ADMIN.systemName, MainSetup.SystemRoles.ENVI_MANAGER.systemName];
        return !privilegedRoles.includes(MainSetup.currentUser.systemRoleName);
    }

    function renderRow(item: MilestoneDateData) {
        if (!item.id) return <>"⚠️ brak ID"</>;

        const _contract = item._milestone?._contract;
        const _milestone = item._milestone;
        let contractLabel = `${_contract?._ourIdOrNumber_Alias} ` || " ";

        if (isOurContract(_contract)) contractLabel += _contract?._type?.name;

        return (
            <>
                <div>
                    {contractLabel} {renderContractStatus(item)}
                </div>
                <div className="mb-2">
                    <span className="small">Kamień: </span>
                    <span className="fw-bold me-1">{_milestone?._type.name}</span>{" "}
                    <span className="me-1">{_milestone?.name || ""}</span>
                    {renderMilestoneStatus(item)}
                    <div>{renderDates(item)}</div>
                </div>
            </>
        );
    }

    function renderDates(item: MilestoneDateData) {
        return (
            <div className="mb-2">
                <span className="fw-bold">Od:</span>{" "}
                <span className="fs-5">{ToolsDate.dateISOToDMY(item.startDate)}</span>{" "}
                <span className="fw-bold">do:</span>{" "}
                <span className="fs-5">{ToolsDate.dateISOToDMY(item.endDate)}</span> <span>{renderDaysLeft(item)}</span>
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

    function renderRemainingValue(milestoneDate: MilestoneDateData) {
        const _contract = milestoneDate._milestone?._contract as OurContract | OtherContract;
        if (!_contract) return <>Brak kontraktu</>;
        const ourId = "ourId" in _contract ? _contract.ourId : "";
        if (!ourId || !_contract._remainingNotIssuedValue || !_contract._remainingNotScheduledValue) return <></>;
        const formatedNotScheduledValue = Tools.formatNumber((_contract._remainingNotScheduledValue as number) || 0, 0);
        const formatedNotIssuedValue = Tools.formatNumber((_contract._remainingNotIssuedValue as number) || 0, 0);
        return (
            <>
                <MyTooltip content="Różnica pomiędzy wartością wysłanych faktur a wartością umowy" placement="right">
                    <div className="text-end text-success">{formatedNotIssuedValue}</div>
                </MyTooltip>
                <MyTooltip
                    content="Różnica pomiędzy wartością wszystkich  faktur w witrynie a wartością umowy"
                    placement="right"
                >
                    <div className="text-end text-danger">{formatedNotScheduledValue}</div>
                </MyTooltip>
            </>
        );
    }

    function makeTablestructure() {
        const tableStructure: RowStructure<MilestoneDateData>[] = [{ renderTdBody: renderRow }];

        const allowedRoles = [MainSetup.SystemRoles.ADMIN.systemName, MainSetup.SystemRoles.ENVI_MANAGER.systemName];

        if (MainSetup.isRoleAllowed(allowedRoles)) {
            tableStructure.push({
                header: "Do rozliczenia",
                renderTdBody: (milestone) => renderRemainingValue(milestone),
            });
        }
        return tableStructure;
    }

    return (
        <FilterableTable<MilestoneDateData>
            id="milestones"
            title={""}
            showTableHeader={false}
            initialSections={sections}
            tableStructure={makeTablestructure()}
            isDeletable={false}
            EditButtonComponent={MilestoneDateEditModalButton}
            repository={milestoneDatesRepository}
            selectedObjectRoute={"/milestone/"}
            externalUpdate={externalUpdate}
        />
    );
}

type DateEditTriggerProps = {
    date: string;
    milestone: MilestoneDateData;
    onEdit: (milestone: MilestoneDateData) => void;
};

function DateEditTrigger({ date, milestone, onEdit }: DateEditTriggerProps) {
    return date ? ToolsDate.dateYMDtoDMY(date) : "Jeszcze nie ustalono";
}

function buildTree(
    ourMilestoneDates: MilestoneDateData[],
    otherMilestoneDates: MilestoneDateData[]
): SectionNode<MilestoneDateData>[] {
    const milestoneGroupNodes: SectionNode<MilestoneDateData>[] = [
        {
            id: "milestoneGroupOur",
            isInAccordion: true,
            level: 1,
            type: "milestoneGroup",
            childrenNodesType: "milestone",
            repository: milestoneDatesRepository,
            dataItem: { id: 1 },
            titleLabel: "Kontrakty ENVI",
            children: [],
            leaves: [...ourMilestoneDates],
            isDeletable: false,
        },
        {
            id: "milestoneGroupOther",
            isInAccordion: true,
            level: 1,
            type: "milestoneGroup",
            childrenNodesType: "milestone",
            repository: milestoneDatesRepository,
            dataItem: { id: 2 },
            titleLabel: "Pozostałe kontrakty",
            children: [],
            leaves: [...otherMilestoneDates],
            isDeletable: false,
        },
    ];

    return milestoneGroupNodes;
}
