"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClientNeedStatusSelector = exports.ApplicationCallStatusSelector = exports.InvoiceStatusSelectFormElement = exports.TaksStatusSelectFormElement = exports.OfferBondFormSelector = exports.OfferBondStatusSelector = exports.OfferStatusSelector = exports.SecurityStatusSelectFormElement = exports.ContractStatusSelector = exports.ProjectStatusSelectFormElement = void 0;
const react_1 = __importDefault(require("react"));
require("react-bootstrap-typeahead/css/Typeahead.css");
require("../../../Css/styles.css");
const MainSetupReact_1 = __importDefault(require("../../../React/MainSetupReact"));
const GenericComponents_1 = require("./GenericComponents");
function ProjectStatusSelectFormElement({ showValidationInfo = true, name = "status", as, }) {
    const statuses = Object.entries(MainSetupReact_1.default.ProjectStatuses).map(([key, value]) => value);
    return (react_1.default.createElement(GenericComponents_1.SelectTextOptionFormElement, { options: statuses, showValidationInfo: showValidationInfo, name: name, as: as }));
}
exports.ProjectStatusSelectFormElement = ProjectStatusSelectFormElement;
function ContractStatusSelector({ showValidationInfo = true, name = "status", as }) {
    const statuses = Object.entries(MainSetupReact_1.default.ContractStatuses).map(([key, value]) => value);
    return (react_1.default.createElement(GenericComponents_1.SelectTextOptionFormElement, { options: statuses, showValidationInfo: showValidationInfo, name: name, as: as }));
}
exports.ContractStatusSelector = ContractStatusSelector;
function SecurityStatusSelectFormElement({ showValidationInfo = true, name = "status", as, }) {
    const statuses = Object.entries(MainSetupReact_1.default.SecurityStatus).map(([key, value]) => value);
    return (react_1.default.createElement(GenericComponents_1.SelectTextOptionFormElement, { options: statuses, showValidationInfo: showValidationInfo, name: name, as: as }));
}
exports.SecurityStatusSelectFormElement = SecurityStatusSelectFormElement;
function OfferStatusSelector({ showValidationInfo = true, name = "status", as }) {
    const statuses = Object.entries(MainSetupReact_1.default.OfferStatus).map(([key, value]) => value);
    return (react_1.default.createElement(GenericComponents_1.SelectTextOptionFormElement, { options: statuses, showValidationInfo: showValidationInfo, name: name, as: as }));
}
exports.OfferStatusSelector = OfferStatusSelector;
function OfferBondStatusSelector({ showValidationInfo = true, name = "status", as }) {
    const statuses = Object.entries(MainSetupReact_1.default.OfferBondStatus).map(([key, value]) => value);
    return (react_1.default.createElement(GenericComponents_1.SelectTextOptionFormElement, { options: statuses, showValidationInfo: showValidationInfo, name: name, as: as }));
}
exports.OfferBondStatusSelector = OfferBondStatusSelector;
function OfferBondFormSelector({ showValidationInfo = true, name = "form", as }) {
    const forms = Object.entries(MainSetupReact_1.default.OfferBondForm).map(([key, value]) => value);
    return react_1.default.createElement(GenericComponents_1.SelectTextOptionFormElement, { options: forms, showValidationInfo: showValidationInfo, name: name, as: as });
}
exports.OfferBondFormSelector = OfferBondFormSelector;
function TaksStatusSelectFormElement({ showValidationInfo = true, name = "status", as, }) {
    let statuses = Object.entries(MainSetupReact_1.default.TaskStatus).map(([key, value]) => value);
    return (react_1.default.createElement(GenericComponents_1.SelectTextOptionFormElement, { options: statuses, showValidationInfo: showValidationInfo, name: name, as: as }));
}
exports.TaksStatusSelectFormElement = TaksStatusSelectFormElement;
function InvoiceStatusSelectFormElement({ showValidationInfo = true, name = "status", as, }) {
    const statuses = Object.entries(MainSetupReact_1.default.InvoiceStatuses).map(([key, value]) => value);
    return (react_1.default.createElement(GenericComponents_1.SelectTextOptionFormElement, { options: statuses, showValidationInfo: showValidationInfo, name: name, as: as }));
}
exports.InvoiceStatusSelectFormElement = InvoiceStatusSelectFormElement;
function ApplicationCallStatusSelector({ showValidationInfo = true, name = "status", as, }) {
    const statuses = Object.entries(MainSetupReact_1.default.ApplicationCallStatus).map(([key, value]) => value);
    return (react_1.default.createElement(GenericComponents_1.SelectTextOptionFormElement, { options: statuses, showValidationInfo: showValidationInfo, name: name, as: as }));
}
exports.ApplicationCallStatusSelector = ApplicationCallStatusSelector;
function ClientNeedStatusSelector({ showValidationInfo = true, name = "status", as }) {
    const statuses = Object.entries(MainSetupReact_1.default.ClientNeedStatus).map(([key, value]) => value);
    return (react_1.default.createElement(GenericComponents_1.SelectTextOptionFormElement, { options: statuses, showValidationInfo: showValidationInfo, name: name, as: as }));
}
exports.ClientNeedStatusSelector = ClientNeedStatusSelector;
