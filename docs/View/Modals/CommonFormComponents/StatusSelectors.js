"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClientNeedStatusSelector = exports.ApplicationCallStatusSelector = exports.InvoiceStatusSelector = exports.TaksStatusSelector = exports.OfferBondFormSelector = exports.OfferBondStatusSelector = exports.OfferStatusSelector = exports.SecurityStatusSelector = exports.ContractStatusSelector = exports.ProjectStatusSelector = void 0;
const react_1 = __importDefault(require("react"));
require("react-bootstrap-typeahead/css/Typeahead.css");
require("../../../Css/styles.css");
const MainSetupReact_1 = __importDefault(require("../../../React/MainSetupReact"));
const GenericComponents_1 = require("./GenericComponents");
function ProjectStatusSelector({ showValidationInfo = true, name, label = name, multiple = false, as, }) {
    const statuses = Object.entries(MainSetupReact_1.default.ProjectStatuses).map(([key, value]) => value);
    const resolvedName = name ?? (multiple ? "statuses" : "status");
    const resolvedLabel = label ?? resolvedName;
    return multiple ? (react_1.default.createElement(GenericComponents_1.TypeaheadStringSelector, { options: statuses, showValidationInfo: showValidationInfo, name: resolvedName, label: resolvedLabel, as: as })) : (react_1.default.createElement(GenericComponents_1.TextOptionSelector, { options: statuses, showValidationInfo: showValidationInfo, name: resolvedLabel, label: resolvedLabel, as: as }));
}
exports.ProjectStatusSelector = ProjectStatusSelector;
function ContractStatusSelector({ showValidationInfo = true, multiple, name, label, as, }) {
    const resolvedName = name ?? (multiple ? "statuses" : "status");
    const resolvedLabel = label ?? resolvedName;
    const statuses = Object.entries(MainSetupReact_1.default.ContractStatuses).map(([key, value]) => value);
    return multiple ? (react_1.default.createElement(GenericComponents_1.TypeaheadStringSelector, { options: statuses, showValidationInfo: showValidationInfo, name: resolvedName, label: resolvedLabel, as: as })) : (react_1.default.createElement(GenericComponents_1.TextOptionSelector, { options: statuses, showValidationInfo: showValidationInfo, name: resolvedName, as: as }));
}
exports.ContractStatusSelector = ContractStatusSelector;
function SecurityStatusSelector({ showValidationInfo = true, name = "status", label, as, }) {
    const statuses = Object.entries(MainSetupReact_1.default.SecurityStatus).map(([key, value]) => value);
    return (react_1.default.createElement(GenericComponents_1.TextOptionSelector, { options: statuses, showValidationInfo: showValidationInfo, name: name, label: label, as: as }));
}
exports.SecurityStatusSelector = SecurityStatusSelector;
function OfferStatusSelector({ showValidationInfo = true, name, label, multiple = false, as, }) {
    const resolvedName = name ?? (multiple ? "statuses" : "status");
    const resolvedLabel = label ?? resolvedName;
    const statuses = Object.entries(MainSetupReact_1.default.OfferStatus).map(([key, value]) => value);
    return multiple ? (react_1.default.createElement(GenericComponents_1.TypeaheadStringSelector, { options: statuses, showValidationInfo: showValidationInfo, name: resolvedName, label: resolvedLabel, as: as })) : (react_1.default.createElement(GenericComponents_1.TextOptionSelector, { options: statuses, showValidationInfo: showValidationInfo, name: resolvedName, label: resolvedLabel, as: as }));
}
exports.OfferStatusSelector = OfferStatusSelector;
function OfferBondStatusSelector({ showValidationInfo = true, multiple = false, name, label, as, }) {
    const statuses = Object.entries(MainSetupReact_1.default.OfferBondStatus).map(([key, value]) => value);
    const resolvedName = name ?? (multiple ? "statuses" : "status");
    const resolvedLabel = label ?? resolvedName;
    return multiple ? (react_1.default.createElement(GenericComponents_1.TypeaheadStringSelector, { options: statuses, showValidationInfo: showValidationInfo, name: resolvedName, label: resolvedLabel, as: as })) : (react_1.default.createElement(GenericComponents_1.TextOptionSelector, { options: statuses, showValidationInfo: showValidationInfo, name: resolvedName, label: resolvedLabel, as: as }));
}
exports.OfferBondStatusSelector = OfferBondStatusSelector;
function OfferBondFormSelector({ showValidationInfo = true, name = "form", as, label = name, }) {
    const forms = Object.entries(MainSetupReact_1.default.OfferBondForm).map(([key, value]) => value);
    return (react_1.default.createElement(GenericComponents_1.TextOptionSelector, { options: forms, showValidationInfo: showValidationInfo, name: name, as: as, label: label }));
}
exports.OfferBondFormSelector = OfferBondFormSelector;
function TaksStatusSelector({ showValidationInfo = true, name, label, multiple = false, as, }) {
    const statuses = Object.entries(MainSetupReact_1.default.TaskStatus).map(([key, value]) => value);
    const resolvedName = name ?? (multiple ? "statuses" : "status");
    const resolvedLabel = label ?? resolvedName;
    return multiple ? (react_1.default.createElement(GenericComponents_1.TypeaheadStringSelector, { options: statuses, showValidationInfo: showValidationInfo, name: resolvedName, label: resolvedLabel, as: as })) : (react_1.default.createElement(GenericComponents_1.TextOptionSelector, { options: statuses, showValidationInfo: showValidationInfo, name: resolvedName, label: resolvedLabel, as: as }));
}
exports.TaksStatusSelector = TaksStatusSelector;
function InvoiceStatusSelector({ showValidationInfo = true, multiple = false, name, label, as, }) {
    const statuses = Object.entries(MainSetupReact_1.default.InvoiceStatuses).map(([key, value]) => value);
    const resolvedName = name ?? (multiple ? "statuses" : "status");
    const resolvedLabel = label ?? resolvedName;
    return multiple ? (react_1.default.createElement(GenericComponents_1.TypeaheadStringSelector, { options: statuses, showValidationInfo: showValidationInfo, name: resolvedName, label: resolvedLabel, as: as })) : (react_1.default.createElement(GenericComponents_1.TextOptionSelector, { options: statuses, showValidationInfo: showValidationInfo, name: resolvedName, as: as }));
}
exports.InvoiceStatusSelector = InvoiceStatusSelector;
function ApplicationCallStatusSelector({ showValidationInfo = true, name, label, multiple = false, as, }) {
    const resolvedName = name ?? (multiple ? "statuses" : "status");
    const resolvedLabel = label ?? resolvedName;
    const statuses = Object.entries(MainSetupReact_1.default.ApplicationCallStatus).map(([key, value]) => value);
    return multiple ? (react_1.default.createElement(GenericComponents_1.TypeaheadStringSelector, { options: statuses, showValidationInfo: showValidationInfo, name: resolvedName, label: resolvedLabel, as: as })) : (react_1.default.createElement(GenericComponents_1.TextOptionSelector, { options: statuses, showValidationInfo: showValidationInfo, name: resolvedName, label: resolvedLabel, as: as }));
}
exports.ApplicationCallStatusSelector = ApplicationCallStatusSelector;
function ClientNeedStatusSelector({ showValidationInfo = true, name, label, multiple = false, as, }) {
    const resolvedName = name ?? (multiple ? "statuses" : "status");
    const resolvedLabel = label ?? resolvedName;
    const statuses = Object.entries(MainSetupReact_1.default.ClientNeedStatus).map(([key, value]) => value);
    return multiple ? (react_1.default.createElement(GenericComponents_1.TypeaheadStringSelector, { options: statuses, showValidationInfo: showValidationInfo, name: resolvedName, label: resolvedLabel, as: as })) : (react_1.default.createElement(GenericComponents_1.TextOptionSelector, { options: statuses, showValidationInfo: showValidationInfo, name: resolvedName, label: resolvedLabel, as: as }));
}
exports.ClientNeedStatusSelector = ClientNeedStatusSelector;
