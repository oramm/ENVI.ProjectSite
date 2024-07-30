import React, { useEffect, useState } from "react";
import { Alert, Card } from "react-bootstrap";
import { OurContract, OtherContract, SystemRoleName, Milestone } from "../../../../../../Typings/bussinesTypes";

import { PartialEditTrigger } from "../../../../../View/Modals/GeneralModalButtons";
import { ContractStatusBadge, DaysLeftBadge, MyTooltip } from "../../../../../View/Resultsets/CommonComponents";
import FilterableTable from "../../../../../View/Resultsets/FilterableTable/FilterableTable";
import MainSetup from "../../../../MainSetupReact";
import Tools from "../../../../Tools";
import ToolsDate from "../../../../ToolsDate";
import { milestonesRepository } from "../../../MainWindowController";
import { SectionNode } from "../../../../../View/Resultsets/FilterableTable/Section";
import { RowStructure } from "../../../../../View/Resultsets/FilterableTable/FilterableTableTypes";

export default function MilestonesList() {
    const [milestones, setMilestones] = useState([] as Milestone[]);
    const [ourMilestones, setOurMilestones] = useState<Milestone[]>([]);
    const [otherMilestones, setOtherMilestones] = useState<Milestone[]>([]);

    const [externalUpdate, setExternalUpdate] = useState(0);
    const [dataLoaded, setDataLoaded] = useState(false);

    useEffect(() => {
        async function fetchData() {
            setDataLoaded(false);
            const endDateTo = ToolsDate.addDays(new Date(), 30);
            const milestones = (await Promise.all([
                milestonesRepository.loadItemsFromServerPOST([
                    {
                        status: [MainSetup.ContractStatuses.IN_PROGRESS, MainSetup.ContractStatuses.NOT_STARTED],
                        endDateTo: endDateTo.toISOString().slice(0, 10),
                        getRemainingValue: true,
                        _admin: filterByCurrentUser() ? MainSetup.getCurrentUserAsPerson() : undefined,
                    },
                ]),
            ])) as Milestone[];
            setMilestones(milestones);
            setOurMilestones(milestones.filter((m) => m._contract?._type.isOur));
            setOtherMilestones(milestones.filter((m) => !m._contract?._type.isOur));
            setExternalUpdate((prevState) => prevState + 1);
            setDataLoaded(true);
        }

        fetchData();
    }, []);
    /**
     * Filtrowanie będzie tylko dla użytkowników z uprawnieniami poniżej ENVI_MANAGER i ADMIN
     */
    function filterByCurrentUser() {
        const privilegedRoles = [MainSetup.SystemRoles.ADMIN.systemName, MainSetup.SystemRoles.ENVI_MANAGER.systemName];
        return !privilegedRoles.includes(MainSetup.currentUser.systemRoleName);
    }

    function renderName(milestone: Milestone) {
        return (
            <>
                <>{milestone.name}</>
                {milestone.status && <ContractStatusBadge status={milestone.status} />}
            </>
        );
    }

    function renderEndDate(milestone: Milestone) {
        const { endDate } = milestone;
        if (!endDate) return <Alert variant="danger">Brak daty zakończenia</Alert>;
        const daysLeft = ToolsDate.countDaysLeftTo(endDate);

        return (
            <>
                <div>{endDate}</div>
                <div>
                    <DaysLeftBadge daysLeft={daysLeft} />
                </div>
            </>
        );
    }

    function renderStartDate(milestone: Milestone) {
        const { startDate } = milestone;
        if (!startDate) return <Alert variant="danger">Brak daty rozpoczęcia</Alert>;
        return <div>{startDate}</div>;
    }

    function handleEditObject(object: Milestone) {
        setMilestones(milestones.map((o) => (o.id === object.id ? object : o)));
        setExternalUpdate((prevState) => prevState + 1);
    }

    function renderRemainingValue(milestone: Milestone) {
        const _contract = milestone._contract as OurContract | OtherContract;
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
        const tableStructure: RowStructure<Milestone>[] = [
            {
                header: "Projekt",
                renderTdBody: (milestone: Milestone) => <>{milestone._contract?._project.ourId}</>,
            },
            {
                header: "Oznaczenie",
                renderTdBody: (milestone: Milestone) => <>{"ourId" in milestone ? milestone.ourId : ""}</>,
            },
            { header: "Numer", objectAttributeToShow: "number" },
            { header: "Nazwa", renderTdBody: (milestone: Milestone) => renderName(milestone) },
            {
                header: "Rozpoczęcie",
                renderTdBody: (milestone: Milestone) => renderStartDate(milestone),
            },
            { header: "Zakończenie", renderTdBody: (milestone: Milestone) => renderEndDate(milestone) },
        ];

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
        <Card>
            <Card.Body>
                <Card.Title>Kończące się kamienie milowe</Card.Title>
                <FilterableTable<Milestone>
                    id="milestones"
                    title={""}
                    initialSections={buildTree(ourMilestones, otherMilestones)}
                    tableStructure={makeTablestructure()}
                    isDeletable={false}
                    repository={milestonesRepository}
                    selectedObjectRoute={"/milestone/"}
                    externalUpdate={externalUpdate}
                />
            </Card.Body>
        </Card>
    );
}

type DateEditTriggerProps = {
    date: string;
    milestone: Milestone;
    onEdit: (milestone: Milestone) => void;
};

function DateEditTrigger({ date, milestone, onEdit }: DateEditTriggerProps) {
    return date ? ToolsDate.dateYMDtoDMY(date) : "Jeszcze nie ustalono";
}

function buildTree(ourMilestones: Milestone[], otherMilestones: Milestone[]): SectionNode<Milestone>[] {
    const milestoneGroupNodes: SectionNode<Milestone>[] = [
        {
            id: "milestoneGroupOur",
            isInAccordion: true,
            level: 1,
            type: "milestoneGroup",
            childrenNodesType: "milestone",
            repository: milestonesRepository,
            dataItem: { id: 1 },
            titleLabel: "Kontrakty ENVI",
            children: [],
            leaves: [...ourMilestones],
            isDeletable: false,
        },
        {
            id: "milestoneGroupOther",
            isInAccordion: true,
            level: 1,
            type: "milestoneGroup",
            childrenNodesType: "milestone",
            repository: milestonesRepository,
            dataItem: { id: 2 },
            titleLabel: "Pozostałe kontrakty",
            children: [],
            leaves: [...otherMilestones],
            isDeletable: false,
        },
    ];

    return milestoneGroupNodes;
}
