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
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = OffersCard;
const react_1 = __importStar(require("react"));
const MainSetupReact_1 = __importDefault(require("../../../MainSetupReact"));
const MainWindowController_1 = require("../../MainWindowController");
const ToolsDate_1 = __importDefault(require("../../../Tools/ToolsDate"));
const DashboardCard_1 = __importDefault(require("../../../../View/Resultsets/DashboardCard/DashboardCard"));
const useDashboardCardData_1 = require("../../../../View/Resultsets/DashboardCard/useDashboardCardData");
const OfferModalButtons_1 = require("../../../../Offers/OffersList/Modals/OfferModalButtons");
const OfferCommonComponents_1 = require("../../../../Offers/OffersList/OfferCommonComponents");
const sectionsIcons = {
    "Składamy czy nie?": "❓",
    "Do złożenia": "📝",
    "Czekamy na wynik": "⏳",
    Wygrana: "🏆",
    Przegrana: "❌",
    Wycofana: "🔙",
    Unieważnione: "🚫",
    "Nie składamy": "🛑",
};
function OffersCard({ className }) {
    const initCardData = {
        header: {
            title: "Oferty",
            daysBeforeToday: 30,
            daysAfterToday: 14,
        },
        sectionAttributeName: "status",
    };
    const fetchData = (0, react_1.useCallback)(async () => {
        const submissionDeadlineFrom = ToolsDate_1.default.addDays(new Date(), -initCardData.header.daysBeforeToday)
            .toISOString()
            .slice(0, 10);
        const submissionDeadlineTo = ToolsDate_1.default.addDays(new Date(), initCardData.header.daysAfterToday)
            .toISOString()
            .slice(0, 10);
        const orConditions = [
            {
                statuses: Object.values(MainSetupReact_1.default.OfferStatus), // <- popraw, jeśli np. OfferStatuses!
                submissionDeadlineFrom,
                submissionDeadlineTo,
            },
        ];
        return (await MainWindowController_1.offersRepository.loadItemsFromServerPOST(orConditions));
    }, []);
    const { dataLoaded, data, cardData } = (0, useDashboardCardData_1.useDashboardCardData)(initCardData, sectionsIcons, fetchData);
    function renderOfferListItem({ object }) {
        const statusesWithDeadline = [MainSetupReact_1.default.OfferStatus.TO_DO, MainSetupReact_1.default.OfferStatus.DECISION_PENDING];
        const showDeadline = statusesWithDeadline.includes(object.status) && object.submissionDeadline;
        return (react_1.default.createElement(react_1.default.Fragment, null,
            react_1.default.createElement("span", { className: "text-secondary small" },
                react_1.default.createElement("span", { className: "fw-semibold" }, object._city.name),
                ", ",
                object._type.name,
                ",",
                " ",
                react_1.default.createElement("span", { className: "fw-light" },
                    react_1.default.createElement(OfferCommonComponents_1.OfferTenderLink, { offer: object })),
                showDeadline && react_1.default.createElement("span", null,
                    " | ",
                    ToolsDate_1.default.dateToDdMmm(object.submissionDeadline)))));
    }
    return (react_1.default.createElement(DashboardCard_1.default, { cardData: cardData, dataLoaded: dataLoaded, initialObjects: data, repository: MainWindowController_1.offersRepository, ListItem: renderOfferListItem, className: className, isDeletable: false, headerRoute: "/offers", EditButtonComponent: OfferModalButtons_1.OfferEditModalButton }));
}
