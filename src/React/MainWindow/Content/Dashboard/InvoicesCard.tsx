import React, { useCallback, useEffect, useState } from "react";
import MainSetup from "../../../MainSetupReact";
import { invoicesRepository } from "../../MainWindowController";
import ToolsDate from "../../../Tools/ToolsDate";
import { Invoice } from "../../../../../Typings/bussinesTypes";
import Tools from "../../../Tools/Tools";
import DashboardCard, {
    DashboardCardData,
    DashboardCardSectionData,
} from "../../../../View/Resultsets/DashboardCard/DashboardCard";
import { InvoiceEditModalButton } from "../../../../Erp/InvoicesList/Modals/InvoiceModalButtons";
import { useDashboardCardData } from "../../../../View/Resultsets/DashboardCard/useDashboardCardData";

const sectionIcons: Record<string, string> = {
    "Na później": "⏳",
    "Do zrobienia": "📝",
    Zrobiona: "✅",
    Wysłana: "📤",
    Zapłacona: "💸",
    "Do korekty": "✏️",
    Wycofana: "🚫",
};

export default function InvoicesCard({ className }: { className: string }) {
    const initCardData = {
        header: {
            title: "Faktury",
            daysBeforeToday: 45,
            daysAfterToday: 14,
        },
        sectionAttributeName: "status" as keyof Invoice,
    };
    const fetchData = useCallback(async () => {
        const issueDateFrom = ToolsDate.addDays(new Date(), -60).toISOString().slice(0, 10);
        const issueDateTo = ToolsDate.addDays(new Date(), 30).toISOString().slice(0, 10);
        const orConditions = [
            {
                statuses: Object.values(MainSetup.InvoiceStatuses),
                issueDateFrom,
                issueDateTo,
            },
        ];
        return (await invoicesRepository.loadItemsFromServerPOST(orConditions)) as Invoice[];
    }, []);

    const { dataLoaded, data, cardData } = useDashboardCardData<Invoice>(initCardData, sectionIcons, fetchData);

    function renderSectionSubtitle({ sectionData }: { sectionData: DashboardCardSectionData }) {
        const invoicesInSection = data.filter((object) => object.status === sectionData.key);
        const totalValue = Tools.formatNumber(getTotalValue(invoicesInSection)) + " zł";

        return <span>Łącznie: {totalValue}</span>;
    }

    function renderListItem({ object }: { object: Invoice }) {
        return (
            <>
                <span className="text-secondary small flex-grow-1">
                    <span className="fw-semibold">{object._contract.ourId}</span>
                    {", "}
                    {object.number || object._contract._city?.name}
                </span>
                <span className="text-secondary small text-end ms-2" style={{ minWidth: 70 }}>
                    <span className="fw-light">{Tools.formatNumber(object._totalNetValue || 0)} zł</span>
                </span>
            </>
        );
    }

    function getTotalValue(invoices: Invoice[] = []) {
        return invoices.reduce((acc, inv) => {
            // Zamieni wszystko (number, undefined, string) na string, więc replace zawsze istnieje
            const raw = inv._totalNetValue;
            const num = parseFloat(String(raw).replace(",", "."));
            return acc + (isNaN(num) ? 0 : num);
        }, 0);
    }

    return (
        <DashboardCard<Invoice>
            cardData={cardData}
            dataLoaded={dataLoaded}
            initialObjects={data}
            repository={invoicesRepository}
            ListItem={renderListItem}
            SectionSubtittle={renderSectionSubtitle}
            className={className}
            isDeletable={false}
            EditButtonComponent={InvoiceEditModalButton}
            shouldRetrieveDataBeforeEdit={false}
            detailsRoute="/invoice/"
        />
    );
}
