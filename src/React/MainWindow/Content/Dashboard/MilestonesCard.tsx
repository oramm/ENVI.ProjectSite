import React, { useCallback } from "react";
import DashboardCard, { DashboardCardData } from "../../../../View/Resultsets/DashboardCard/DashboardCard";
import { useDashboardCardData } from "../../../../View/Resultsets/DashboardCard/useDashboardCardData";
import { milestoneDatesRepository, MilestonesBusinessLogic } from "../../MainWindowController";
import MilestoneDateItem from "./MilestoneDateItem";
import { MilestoneDateData } from "../../../../../Typings/bussinesTypes";
import MainSetup from "../../../MainSetupReact";
import { isOurContract } from "../../../../../Typings/typeGuards";
import ToolsDate from "../../../Tools/ToolsDate";
import { MilestoneDateEditModalButton } from "../../../../Contracts/Dates/Modals/MilestoneDateButtons";

const sectionsIcons: Record<string, string> = {
    "Po terminie": "🚨",
    "Kończące się do 7 dni": "⚡",
    "Kończące się do 30 dni": "⏰",
    "Pozostałe nadchodzące": "📅",
};

export default function MilestonesCard() {
    const initCardData: DashboardCardData<MilestoneDateData & { timeCategory: string }> = {
        header: {
            title: "Kamienie milowe",
            // daysBeforeToday: 100,
            daysAfterToday: 30,
        },
        sectionAttributeName: "timeCategory",
    };

    const fetchMilestones = useCallback(async (): Promise<(MilestoneDateData & { timeCategory: string })[]> => {
        const endDateTo = ToolsDate.addDays(new Date(), initCardData.header.daysAfterToday!).toISOString().slice(0, 10);
        const milestones = await milestoneDatesRepository.loadItemsFromServerPOST([
            {
                milestoneStatuses: [MainSetup.MilestoneStatus.IN_PROGRESS, MainSetup.MilestoneStatus.NOT_STARTED],
                endDateTo,
            },
        ]);

        // Process milestones to add time category
        return MilestonesBusinessLogic.processCollection(milestones) as (MilestoneDateData & {
            timeCategory: string;
        })[];
    }, []);

    const processEditedObject = MilestonesBusinessLogic.addTimeCategory;

    const {
        dataLoaded,
        data: processedMilestones,
        cardData,
    } = useDashboardCardData<MilestoneDateData & { timeCategory: string }>(
        initCardData,
        sectionsIcons,
        fetchMilestones
    );
    return (
        <DashboardCard
            cardData={cardData}
            dataLoaded={dataLoaded}
            repository={milestoneDatesRepository as any}
            ListItem={MilestoneDateItem as any}
            EditButtonComponent={MilestoneDateEditModalButton as any}
            isDeletable={true}
            detailsRoute="/projects/details"
            headerRoute="/contracts"
            getDetailsId={(milestone) => {
                const contract = milestone._milestone?._contract;
                if (!contract) return "";
                return isOurContract(contract) ? contract.ourId : contract.projectOurId || "";
            }}
            initialObjects={processedMilestones}
            shouldRetrieveDataBeforeEdit={true}
            processEditedObject={processEditedObject}
        />
    );
}
