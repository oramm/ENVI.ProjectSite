import React, { useEffect, useState } from "react";
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

const invoiceStatusIcons: Record<string, string> = {
    "Na później": "⏳",
    "Do zrobienia": "📝",
    Zrobiona: "✅",
    Wysłana: "📤",
    Zapłacona: "💸",
    "Do korekty": "✏️",
    Wycofana: "🚫",
};

export default function InvoicesCardNEW({ className }: { className: string }) {
    const [dataLoaded, setDataLoaded] = useState(false);
    const [data, setData] = useState<Invoice[]>([]);
    const [cardData, setCardData] = useState<DashboardCardData<Invoice>>({
        header: { title: "", daysBeforeToday: 30, daysAfterToday: 14 },
        sections: [],
        sectionAttributeName: "status",
    });

    // Przykład zakresu dat – podmień na logikę pod projekt!
    const issueDateFrom = ToolsDate.addDays(new Date(), -60).toISOString().slice(0, 10);
    const issueDateTo = ToolsDate.addDays(new Date(), 30).toISOString().slice(0, 10);

    useEffect(() => {
        async function fetchData() {
            setDataLoaded(false);
            const invoices = (await invoicesRepository.loadItemsFromServerPOST([
                {
                    statuses: Object.values(MainSetup.InvoiceStatuses),
                    issueDateFrom,
                    issueDateTo,
                },
            ])) as Invoice[];
            setData(invoices);
            setDataLoaded(true);
        }
        fetchData();
    }, []);

    useEffect(() => {
        if (dataLoaded && data.length > 0) {
            const uniqueStatuses = Array.from(new Set(data.map((inv) => inv.status)));
            const cardSections: DashboardCardSectionData[] = uniqueStatuses.map((status) => ({
                icon: invoiceStatusIcons[status] || "📄",
                key: status,
                label: status,
            }));

            setCardData({
                header: {
                    title: "Faktury",
                    daysBeforeToday: 60,
                    daysAfterToday: 30,
                },
                sections: cardSections,
                sectionAttributeName: "status",
            });
        }
    }, [dataLoaded, data]);

    function renderItemSubtitle({ sectionData }: { sectionData: DashboardCardSectionData }) {
        const invoicesInSection = data.filter((inv) => inv.status === sectionData.key);
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
            SectionSubtittle={renderItemSubtitle}
            className={className}
            isDeletable={false}
            EditButtonComponent={InvoiceEditModalButton}
            shouldRetrieveDataBeforeEdit={false}
        />
    );
}
