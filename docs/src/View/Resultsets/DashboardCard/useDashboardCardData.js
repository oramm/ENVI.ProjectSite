"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useDashboardCardData = void 0;
const react_1 = require("react");
function useDashboardCardData(config, icons, fetchDataFn, buildCustomSections) {
    const [dataLoaded, setDataLoaded] = (0, react_1.useState)(false);
    const [data, setData] = (0, react_1.useState)([]);
    const [cardData, setCardData] = (0, react_1.useState)({
        ...config,
        sections: [],
    });
    function defaultBuildSections(data, sectionAttributeName, icons) {
        const keys = Array.from(new Set(data.map((object) => String(object[sectionAttributeName]))));
        return keys.map((key) => ({
            icon: icons[key] || "📄",
            key,
            label: key,
        }));
    }
    (0, react_1.useEffect)(() => {
        async function fetchAndSetData() {
            setDataLoaded(false);
            const fetched = await fetchDataFn();
            setData(fetched);
        }
        fetchAndSetData();
    }, [fetchDataFn]);
    (0, react_1.useEffect)(() => {
        setCardData({
            ...config,
            sections: buildCustomSections
                ? buildCustomSections(data)
                : defaultBuildSections(data, config.sectionAttributeName, icons),
        });
        setDataLoaded(true);
    }, [data, buildCustomSections, icons]);
    return { dataLoaded, data, cardData };
}
exports.useDashboardCardData = useDashboardCardData;
