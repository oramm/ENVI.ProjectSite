import { useEffect, useState } from "react";
import { DashboardCardData, DashboardCardSectionData } from "./DashboardCard";

export function useDashboardCardData<DataItemType>(
    config: {
        header: { title: string; daysBeforeToday?: number; daysAfterToday?: number };
        sectionAttributeName: keyof DataItemType;
    },
    icons: Record<string, string>,
    fetchDataFn: () => Promise<DataItemType[]>,
    buildCustomSections?: (data: DataItemType[]) => DashboardCardSectionData[]
) {
    const [dataLoaded, setDataLoaded] = useState(false);
    const [data, setData] = useState<DataItemType[]>([]);
    const [cardData, setCardData] = useState<DashboardCardData<DataItemType>>({
        ...config,
        sections: [],
    });

    function defaultBuildSections(
        data: DataItemType[],
        sectionAttributeName: keyof DataItemType,
        icons: Record<string, string>
    ): DashboardCardSectionData[] {
        const keys = Array.from(new Set(data.map((object) => String(object[sectionAttributeName]))));
        return keys.map((key) => ({
            icon: icons[key] || "📄",
            key,
            label: key,
        }));
    }

    useEffect(() => {
        async function fetchAndSetData() {
            setDataLoaded(false);
            const fetched = await fetchDataFn();
            setData(fetched);
            setDataLoaded(true);
        }
        fetchAndSetData();
    }, [fetchDataFn]);

    useEffect(() => {
        if (dataLoaded && data.length > 0) {
            setCardData({
                ...config,
                sections: buildCustomSections
                    ? buildCustomSections(data)
                    : defaultBuildSections(data, config.sectionAttributeName, icons),
            });
        }
    }, [dataLoaded, data, buildCustomSections, icons]);

    return { dataLoaded, data, cardData };
}
