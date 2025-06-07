import React, { useCallback } from "react";
import MainSetup from "../../../MainSetupReact";
import { applicationCallsRepository } from "../../MainWindowController";
import ToolsDate from "../../../Tools/ToolsDate";
import { ApplicationCallData } from "../../../../../Typings/bussinesTypes";
import DashboardCard, { DashboardCardSectionData } from "../../../../View/Resultsets/DashboardCard/DashboardCard";
import { useDashboardCardData } from "../../../../View/Resultsets/DashboardCard/useDashboardCardData";
import { ApplicationCallEditModalButton } from "../../../../financialAidProgrammes/FocusAreas/ApplicationCalls/Modals/ApplicationCallModalButtons";

const sectionIcons: Record<string, string> = {
    Nieznany: "❓",
    Zaplanowany: "🗓️",
    Otwarty: "📂",
    Zamknięty: "🔒",
};

export default function ApplicationCallsCard({ className }: { className: string }) {
    const initCardData = {
        header: {
            title: "Nabory",
            daysBeforeToday: 100,
            daysAfterToday: 100,
        },
        sectionAttributeName: "status" as keyof ApplicationCallData,
    };
    const fetchData = useCallback(async () => {
        const endDateFrom = ToolsDate.addDays(new Date(), -initCardData.header.daysBeforeToday)
            .toISOString()
            .slice(0, 10);
        const endDateTo = ToolsDate.addDays(new Date(), initCardData.header.daysAfterToday).toISOString().slice(0, 10);
        const orConditions = [
            {
                statuses: Object.values(MainSetup.ApplicationCallStatus),
                endDateFrom,
                endDateTo,
            },
        ];
        return (await applicationCallsRepository.loadItemsFromServerPOST(orConditions)) as ApplicationCallData[];
    }, []);

    const { dataLoaded, data, cardData } = useDashboardCardData<ApplicationCallData>(
        initCardData,
        sectionIcons,
        fetchData
    );

    function renderSectionSubtitle({ sectionData }: { sectionData: DashboardCardSectionData }) {
        const objectsInSection = data.filter((object) => object.status === sectionData.key);
        return <span></span>;
    }

    function renderListItem({ object }: { object: ApplicationCallData }) {
        return (
            <>
                <span className="text-secondary small flex-grow-1">
                    <span className="fw-semibold">{object._focusArea.alias}</span>
                    {", "}
                    <span className="fw-light">{object.description}</span>
                </span>
                <span className="text-secondary small text-end ms-2" style={{ minWidth: 70 }}>
                    <span className="fw-light">{object.endDate && ToolsDate.dateToDdMmm(object.endDate)}</span>
                </span>
            </>
        );
    }

    return (
        <DashboardCard<ApplicationCallData>
            cardData={cardData}
            dataLoaded={dataLoaded}
            initialObjects={data}
            repository={applicationCallsRepository}
            ListItem={renderListItem}
            SectionSubtittle={renderSectionSubtitle}
            className={className}
            isDeletable={false}
            EditButtonComponent={ApplicationCallEditModalButton}
            shouldRetrieveDataBeforeEdit={false}
            headerRoute="/financialAidProgrammes/applicationCalls"
        />
    );
}
