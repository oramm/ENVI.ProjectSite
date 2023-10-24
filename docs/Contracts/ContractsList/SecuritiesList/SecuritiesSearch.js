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
const Tools_1 = __importDefault(require("../../../React/Tools"));
const ToolsDate_1 = __importDefault(require("../../../React/ToolsDate"));
const GeneralModalButtons_1 = require("../../../View/Modals/GeneralModalButtons");
const CommonComponents_1 = require("../../../View/Resultsets/CommonComponents");
const FilterableTable_1 = __importDefault(require("../../../View/Resultsets/FilterableTable/FilterableTable"));
const ContractsController_1 = require("../ContractsController");
const SecurityModalBodiesPartial_1 = require("./Modals/SecurityModalBodiesPartial");
const SecurityModalButtons_1 = require("./Modals/SecurityModalButtons");
const SecurityValidationSchema_1 = require("./Modals/SecurityValidationSchema");
const SecuritiesFilterBody_1 = require("./SecuritiesFilterBody");
function SecuritiesSearch({ title }) {
    const [securities, setSecurities] = (0, react_1.useState)([]);
    const [externalUpdate, setExternalUpdate] = (0, react_1.useState)(0);
    function renderValueGeneric(security, value, fieldsToUpdate) {
        if (security.value === undefined)
            return react_1.default.createElement(react_1.default.Fragment, null);
        const formatedValue = Tools_1.default.formatNumber(value);
        return react_1.default.createElement(GeneralModalButtons_1.PartialEditTrigger, { modalProps: {
                initialData: security,
                ModalBodyComponent: SecurityModalBodiesPartial_1.SecurityModalBodyValue,
                makeValidationSchema: SecurityValidationSchema_1.securityValueValidationSchema,
                repository: ContractsController_1.securitiesRepository,
                modalTitle: 'Edycja wartości',
                onEdit: handleEditObject,
                fieldsToUpdate: fieldsToUpdate
            } },
            react_1.default.createElement("div", { className: "text-end" }, formatedValue));
    }
    function renderValue(security) {
        return renderValueGeneric(security, security.value, ['value']);
    }
    function renderReturnedValue(security) {
        return renderValueGeneric(security, security.returnedValue, ['returnedValue']);
    }
    function renderRemainingValue(security) {
        if (security.value === undefined)
            return react_1.default.createElement(react_1.default.Fragment, null);
        const formatedValue = Tools_1.default.formatNumber(security._remainingValue);
        return react_1.default.createElement("div", { className: "text-end" }, formatedValue);
    }
    function renderType(isCash) {
        return react_1.default.createElement(react_1.default.Fragment, null, isCash ? 'Gotówka' : 'Gwarancja');
    }
    function renderFirstPartExpiryDate(security) {
        let element;
        if (!security.firstPartExpiryDate)
            element = react_1.default.createElement(react_1.default.Fragment, null, security._contract.startDate);
        const daysLeft = ToolsDate_1.default.countDaysLeftTo(security.firstPartExpiryDate);
        element = react_1.default.createElement(react_1.default.Fragment, null,
            react_1.default.createElement("div", null, security.firstPartExpiryDate),
            daysLeft < 30 ? react_1.default.createElement("div", null,
                react_1.default.createElement(CommonComponents_1.DaysLeftBadge, { daysLeft: daysLeft })) : '');
        return react_1.default.createElement(GeneralModalButtons_1.PartialEditTrigger, { modalProps: {
                initialData: security,
                ModalBodyComponent: SecurityModalBodiesPartial_1.SecurityModalBodyDates,
                makeValidationSchema: SecurityValidationSchema_1.suecurityDatesValidationSchema,
                repository: ContractsController_1.securitiesRepository,
                modalTitle: 'Edycja dat',
                onEdit: handleEditObject,
                fieldsToUpdate: ['firstPartExpiryDate', 'secondPartExpiryDate']
            } }, element);
    }
    function renderSecondPartExpiryDate(security) {
        let element;
        if (!security.secondPartExpiryDate)
            element = react_1.default.createElement(react_1.default.Fragment, null, security._contract.guaranteeEndDate || 'Sprawdź w umowie');
        const daysLeft = ToolsDate_1.default.countDaysLeftTo(security.secondPartExpiryDate);
        element = react_1.default.createElement(react_1.default.Fragment, null,
            react_1.default.createElement("div", null, security.secondPartExpiryDate),
            daysLeft < 30 ? react_1.default.createElement("div", null,
                react_1.default.createElement(CommonComponents_1.DaysLeftBadge, { daysLeft: daysLeft })) : '');
        return react_1.default.createElement(GeneralModalButtons_1.PartialEditTrigger, { modalProps: {
                initialData: security,
                ModalBodyComponent: SecurityModalBodiesPartial_1.SecurityModalBodyDates,
                makeValidationSchema: SecurityValidationSchema_1.suecurityDatesValidationSchema,
                repository: ContractsController_1.securitiesRepository,
                modalTitle: 'Edycja dat',
                onEdit: handleEditObject,
                fieldsToUpdate: ['firstPartExpiryDate', 'secondPartExpiryDate']
            } }, element);
    }
    function renderDescription(security) {
        if (!security.description)
            return react_1.default.createElement(react_1.default.Fragment, null);
        return react_1.default.createElement(react_1.default.Fragment, null,
            react_1.default.createElement(GeneralModalButtons_1.PartialEditTrigger, { modalProps: {
                    initialData: security,
                    ModalBodyComponent: SecurityModalBodiesPartial_1.SecurityModalBodyDescritpion,
                    makeValidationSchema: SecurityValidationSchema_1.securityDescriptionValidationSchema,
                    repository: ContractsController_1.securitiesRepository,
                    modalTitle: 'Edycja opisu',
                    onEdit: handleEditObject,
                    fieldsToUpdate: ['description']
                } },
                react_1.default.createElement(react_1.default.Fragment, null, security.description)),
            ' ',
            react_1.default.createElement(GeneralModalButtons_1.PartialEditTrigger, { modalProps: {
                    initialData: security,
                    ModalBodyComponent: SecurityModalBodiesPartial_1.SecurityModalBodyStatus,
                    makeValidationSchema: SecurityValidationSchema_1.securityStatusValidationSchema,
                    repository: ContractsController_1.securitiesRepository,
                    modalTitle: 'Edycja statusu',
                    onEdit: handleEditObject,
                    fieldsToUpdate: ['description']
                } },
                react_1.default.createElement(CommonComponents_1.SecurityStatusBadge, { status: security.status })));
    }
    function handleEditObject(object) {
        setSecurities(ContractsController_1.securitiesRepository.items.map((o) => (o.id === object.id ? object : o)));
        setExternalUpdate(prevState => prevState + 1);
    }
    return (react_1.default.createElement(FilterableTable_1.default, { id: 'securities', title: title, FilterBodyComponent: SecuritiesFilterBody_1.SecuritiesFilterBody, tableStructure: [
            { header: 'Typ', renderTdBody: (security) => renderType(security.isCash) },
            { header: 'Oznaczenie', renderTdBody: (security) => react_1.default.createElement(react_1.default.Fragment, null, security._contract.ourId) },
            { header: 'Wartość', renderTdBody: (security) => renderValue(security) },
            { header: 'Zwrócono', renderTdBody: (security) => renderReturnedValue(security) },
            { header: 'Do zwrotu', renderTdBody: (security) => renderRemainingValue(security) },
            { header: '70% Wygasa', renderTdBody: (security) => renderFirstPartExpiryDate(security) },
            { header: '30% Wygasa', renderTdBody: (security) => renderSecondPartExpiryDate(security) },
            { header: 'Uwagi', renderTdBody: (security) => renderDescription(security) },
        ], AddNewButtonComponents: [SecurityModalButtons_1.SecurityCashAddNewModalButton, SecurityModalButtons_1.SecurityGuaranteeAddNewModalButton], EditButtonComponent: SecurityModalButtons_1.SecurityEditModalButton, isDeletable: true, repository: ContractsController_1.securitiesRepository, selectedObjectRoute: '/contract/', initialObjects: securities, externalUpdate: externalUpdate }));
}
exports.default = SecuritiesSearch;
