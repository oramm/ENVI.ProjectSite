"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importStar(require("react"));
const MainSetupReact_1 = __importDefault(require("../../../MainSetupReact"));
const MainWindowController_1 = require("../../MainWindowController");
const ToolsDate_1 = __importDefault(require("../../../Tools/ToolsDate"));
const DashboardCard_1 = __importDefault(require("../../../../View/Resultsets/DashboardCard/DashboardCard"));
const useDashboardCardData_1 = require("../../../../View/Resultsets/DashboardCard/useDashboardCardData");
const ApplicationCallModalButtons_1 = require("../../../../financialAidProgrammes/FocusAreas/ApplicationCalls/Modals/ApplicationCallModalButtons");
const sectionIcons = {
    Nieznany: "❓",
    Zaplanowany: "🗓️",
    Otwarty: "📂",
    Zamknięty: "🔒",
};
function ApplicationCallsCard({ className }) {
    const initCardData = {
        header: {
            title: "Nabory",
            daysBeforeToday: 100,
            daysAfterToday: 100,
        },
        sectionAttributeName: "status",
    };
    const fetchData = (0, react_1.useCallback)(async () => {
        const endDateFrom = ToolsDate_1.default.addDays(new Date(), -initCardData.header.daysBeforeToday)
            .toISOString()
            .slice(0, 10);
        const endDateTo = ToolsDate_1.default.addDays(new Date(), initCardData.header.daysAfterToday).toISOString().slice(0, 10);
        const orConditions = [
            {
                statuses: Object.values(MainSetupReact_1.default.ApplicationCallStatus),
                endDateFrom,
                endDateTo,
            },
        ];
        return (await MainWindowController_1.applicationCallsRepository.loadItemsFromServerPOST(orConditions));
    }, []);
    const { dataLoaded, data, cardData } = (0, useDashboardCardData_1.useDashboardCardData)(initCardData, sectionIcons, fetchData);
    function renderSectionSubtitle({ sectionData }) {
        const objectsInSection = data.filter((object) => object.status === sectionData.key);
        return react_1.default.createElement("span", null);
    }
    function renderListItem({ object }) {
        return (react_1.default.createElement(react_1.default.Fragment, null,
            react_1.default.createElement("span", { className: "text-secondary small flex-grow-1" },
                react_1.default.createElement("span", { className: "fw-semibold" }, object._focusArea.alias),
                ", ",
                react_1.default.createElement("span", { className: "fw-light" }, object.description)),
            react_1.default.createElement("span", { className: "text-secondary small text-end ms-2", style: { minWidth: 70 } },
                react_1.default.createElement("span", { className: "fw-light" }, object.endDate && ToolsDate_1.default.dateToDdMmm(object.endDate)))));
    }
    return (react_1.default.createElement(DashboardCard_1.default, { cardData: cardData, dataLoaded: dataLoaded, initialObjects: data, repository: MainWindowController_1.applicationCallsRepository, ListItem: renderListItem, SectionSubtittle: renderSectionSubtitle, className: className, isDeletable: false, EditButtonComponent: ApplicationCallModalButtons_1.ApplicationCallEditModalButton, shouldRetrieveDataBeforeEdit: false, headerRoute: "/financialAidProgrammes/applicationCalls" }));
}
exports.default = ApplicationCallsCard;
