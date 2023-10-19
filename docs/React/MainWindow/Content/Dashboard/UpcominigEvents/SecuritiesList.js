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
const react_bootstrap_1 = require("react-bootstrap");
const CommonComponents_1 = require("../../../../../View/Resultsets/CommonComponents");
const FilterableTable_1 = __importDefault(require("../../../../../View/Resultsets/FilterableTable/FilterableTable"));
const MainSetupReact_1 = __importDefault(require("../../../../MainSetupReact"));
const Tools_1 = __importDefault(require("../../../../Tools"));
const ToolsDate_1 = __importDefault(require("../../../../ToolsDate"));
const MainWindowController_1 = require("../../../MainWindowController");
function SecuritiesList() {
    const [securities, setSecurities] = (0, react_1.useState)([]);
    const [externalUpdate, setExternalUpdate] = (0, react_1.useState)(0);
    const [dataLoaded, setDataLoaded] = (0, react_1.useState)(false);
    (0, react_1.useEffect)(() => {
        async function fetchData() {
            setDataLoaded(false);
            const firstPartExpiryDateTo = ToolsDate_1.default.addDays(new Date(), 30);
            const [securities] = await Promise.all([
                MainWindowController_1.securitiesRepository.loadItemsFromServer({
                    status: JSON.stringify([
                        MainSetupReact_1.default.ContractStatuses.IN_PROGRESS,
                        MainSetupReact_1.default.ContractStatuses.NOT_STARTED
                    ]),
                    firstPartExpiryDateTo: firstPartExpiryDateTo.toISOString().slice(0, 10),
                }),
            ]);
            setSecurities(securities);
            setExternalUpdate(prevState => prevState + 1);
            setDataLoaded(true);
        }
        ;
        fetchData();
    }, []);
    function renderValue(value) {
        if (value === undefined)
            return react_1.default.createElement(react_1.default.Fragment, null);
        const formatedValue = Tools_1.default.formatNumber(value);
        return react_1.default.createElement("div", { className: "text-end" }, formatedValue);
    }
    function renderType(isCash) {
        return react_1.default.createElement(react_1.default.Fragment, null, isCash ? 'Gotówka' : 'Gwarancja');
    }
    function renderFirstPartExpiryDate(security) {
        if (!security.firstPartExpiryDate)
            return react_1.default.createElement(react_1.default.Fragment, null, security._contract.startDate);
        const daysLeft = ToolsDate_1.default.countDaysLeftTo(security.firstPartExpiryDate);
        return react_1.default.createElement(react_1.default.Fragment, null,
            react_1.default.createElement("div", null, security.firstPartExpiryDate),
            daysLeft < 30 ? react_1.default.createElement("div", null,
                react_1.default.createElement(CommonComponents_1.DaysLeftBadge, { daysLeft: daysLeft })) : '');
    }
    function renderSecondPartExpiryDate(security) {
        if (!security.secondPartExpiryDate)
            return react_1.default.createElement(react_1.default.Fragment, null, security._contract.guaranteeEndDate || 'Sprawdź w umowie');
        const daysLeft = ToolsDate_1.default.countDaysLeftTo(security.secondPartExpiryDate);
        return react_1.default.createElement(react_1.default.Fragment, null,
            react_1.default.createElement("div", null, security.secondPartExpiryDate),
            daysLeft < 30 ? react_1.default.createElement("div", null,
                react_1.default.createElement(CommonComponents_1.DaysLeftBadge, { daysLeft: daysLeft })) : '');
    }
    function renderDescription(security) {
        if (!security.description)
            return react_1.default.createElement(react_1.default.Fragment, null);
        return react_1.default.createElement(react_1.default.Fragment, null, security.description);
    }
    function handleEditObject(object) {
        setSecurities(securities.map((o) => (o.id === object.id ? object : o)));
        setExternalUpdate(prevState => prevState + 1);
    }
    return (react_1.default.createElement(react_bootstrap_1.Card, null,
        react_1.default.createElement(react_bootstrap_1.Card.Body, null,
            react_1.default.createElement(react_bootstrap_1.Card.Title, null, "ZNWu do zwrotu"),
            react_1.default.createElement(FilterableTable_1.default, { id: 'securities', title: '', tableStructure: [
                    { header: 'Typ', renderTdBody: (security) => renderType(security.isCash) },
                    { header: 'Oznaczenie', renderTdBody: (security) => react_1.default.createElement(react_1.default.Fragment, null, security._contract.ourId) },
                    { header: 'Wartość', renderTdBody: (security) => renderValue(security.value) },
                    { header: 'Zwrócono', renderTdBody: (security) => renderValue(security.returnedValue) },
                    { header: 'Do zwrotu', renderTdBody: (security) => renderValue(security._remainingValue) },
                    { header: '70% Wygasa', renderTdBody: (security) => renderFirstPartExpiryDate(security) },
                    { header: '30% Wygasa', renderTdBody: (security) => renderSecondPartExpiryDate(security) },
                    { header: 'Uwagi', renderTdBody: (security) => renderDescription(security) },
                ], isDeletable: true, repository: MainWindowController_1.securitiesRepository, selectedObjectRoute: '/contract/', externalUpdate: externalUpdate, initialObjects: securities }))));
}
exports.default = SecuritiesList;
