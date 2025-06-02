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
const DashboardCard_1 = __importDefault(require("../../../../View/Resultsets/DashboardCard/DashboardCard"));
const useDashboardCardData_1 = require("../../../../View/Resultsets/DashboardCard/useDashboardCardData");
const MainWindowController_1 = require("../../MainWindowController");
const MilestoneDateItem_1 = __importDefault(require("./MilestoneDateItem"));
const MainSetupReact_1 = __importDefault(require("../../../MainSetupReact"));
const typeGuards_1 = require("../../../../../Typings/typeGuards");
const ToolsDate_1 = __importDefault(require("../../../Tools/ToolsDate"));
const MilestoneDateButtons_1 = require("../../../../Contracts/Dates/Modals/MilestoneDateButtons");
const sectionsIcons = {
    "Po terminie": "🚨",
    "Kończące się do 7 dni": "⚡",
    "Kończące się do 30 dni": "⏰",
    "Pozostałe nadchodzące": "📅",
};
function MilestonesCard() {
    const initCardData = {
        header: {
            title: "Kamienie milowe",
            daysBeforeToday: 100,
            daysAfterToday: 30,
        },
        sectionAttributeName: "timeCategory",
    };
    const fetchMilestones = (0, react_1.useCallback)(async () => {
        const endDateFrom = ToolsDate_1.default.addDays(new Date(), -initCardData.header.daysBeforeToday)
            .toISOString()
            .slice(0, 10);
        const endDateTo = ToolsDate_1.default.addDays(new Date(), initCardData.header.daysAfterToday).toISOString().slice(0, 10);
        const milestones = await MainWindowController_1.milestoneDatesRepository.loadItemsFromServerPOST([
            {
                milestoneStatuses: [MainSetupReact_1.default.MilestoneStatus.IN_PROGRESS, MainSetupReact_1.default.MilestoneStatus.NOT_STARTED],
                endDateFrom,
                endDateTo,
            },
        ]);
        // Process milestones to add time category
        return MainWindowController_1.MilestonesBusinessLogic.processCollection(milestones);
    }, []);
    const processEditedObject = MainWindowController_1.MilestonesBusinessLogic.addTimeCategory;
    const { dataLoaded, data: processedMilestones, cardData, } = (0, useDashboardCardData_1.useDashboardCardData)(initCardData, sectionsIcons, fetchMilestones);
    return (react_1.default.createElement(DashboardCard_1.default, { cardData: cardData, dataLoaded: dataLoaded, repository: MainWindowController_1.milestoneDatesRepository, ListItem: MilestoneDateItem_1.default, EditButtonComponent: MilestoneDateButtons_1.MilestoneDateEditModalButton, isDeletable: true, detailsRoute: "/projects/details", getDetailsId: (milestone) => {
            const contract = milestone._milestone?._contract;
            if (!contract)
                return "";
            return (0, typeGuards_1.isOurContract)(contract) ? contract.ourId : contract.projectOurId || "";
        }, initialObjects: processedMilestones, shouldRetrieveDataBeforeEdit: true, processEditedObject: processEditedObject }));
}
exports.default = MilestonesCard;
