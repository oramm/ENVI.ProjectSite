import React, { useCallback } from "react";
import MainSetup from "../../../MainSetupReact";
import { offersRepository } from "../../MainWindowController";
import ToolsDate from "../../../Tools/ToolsDate";
import { ExternalOffer, OurOffer } from "../../../../../Typings/bussinesTypes";
import DashboardCard, { DashboardCardData } from "../../../../View/Resultsets/DashboardCard/DashboardCard";
import { useDashboardCardData } from "../../../../View/Resultsets/DashboardCard/useDashboardCardData";
import { OfferEditModalButton } from "../../../../Offers/OffersList/Modals/OfferModalButtons";
import { OfferTenderLink } from "../../../../Offers/OffersList/OfferCommonComponents";

const sectionsIcons: Record<string, string> = {
    "Składamy czy nie?": "❓",
    "Do złożenia": "📝",
    "Czekamy na wynik": "⏳",
    Wygrana: "🏆",
    Przegrana: "❌",
    Wycofana: "🔙",
    Unieważnione: "🚫",
    "Nie składamy": "🛑",
};

export default function OffersCard({ className }: { className: string }) {
    const initCardData: DashboardCardData<OurOffer | ExternalOffer> = {
        header: {
            title: "Oferty",
            daysBeforeToday: 30,
            daysAfterToday: 14,
        },
        sectionAttributeName: "status",
    };

    const fetchData = useCallback(async () => {
        const submissionDeadlineFrom = ToolsDate.addDays(new Date(), -initCardData.header.daysBeforeToday!)
            .toISOString()
            .slice(0, 10);
        const submissionDeadlineTo = ToolsDate.addDays(new Date(), initCardData.header.daysAfterToday!)
            .toISOString()
            .slice(0, 10);

        const orConditions = [
            {
                statuses: Object.values(MainSetup.OfferStatus), // <- popraw, jeśli np. OfferStatuses!
                submissionDeadlineFrom,
                submissionDeadlineTo,
            },
        ];
        return (await offersRepository.loadItemsFromServerPOST(orConditions)) as (OurOffer | ExternalOffer)[];
    }, []);

    const { dataLoaded, data, cardData } = useDashboardCardData<OurOffer | ExternalOffer>(
        initCardData,
        sectionsIcons,
        fetchData,
    );

    function renderOfferListItem({ object }: { object: OurOffer | ExternalOffer }) {
        const statusesWithDeadline = [MainSetup.OfferStatus.TO_DO, MainSetup.OfferStatus.DECISION_PENDING];
        const showDeadline = statusesWithDeadline.includes(object.status!) && object.submissionDeadline;

        return (
            <>
                <span className="text-secondary small">
                    <span className="fw-semibold">{object._city.name}</span>, {object._type.name},{" "}
                    <span className="fw-light">
                        <OfferTenderLink offer={object} />
                    </span>
                    {showDeadline && <span> | {ToolsDate.dateToDdMmm(object.submissionDeadline!)}</span>}
                </span>
            </>
        );
    }

    return (
        <DashboardCard<OurOffer | ExternalOffer>
            cardData={cardData}
            dataLoaded={dataLoaded}
            initialObjects={data}
            repository={offersRepository}
            ListItem={renderOfferListItem}
            className={className}
            isDeletable={false}
            headerRoute="/offers"
            EditButtonComponent={OfferEditModalButton}
        />
    );
}
