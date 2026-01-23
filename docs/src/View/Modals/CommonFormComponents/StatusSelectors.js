"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProjectStatusSelector = ProjectStatusSelector;
exports.ContractStatusSelector = ContractStatusSelector;
exports.SecurityStatusSelector = SecurityStatusSelector;
exports.OfferStatusSelector = OfferStatusSelector;
exports.OfferBondStatusSelector = OfferBondStatusSelector;
exports.OfferBondFormSelector = OfferBondFormSelector;
exports.OfferInvitationMailStatusSelector = OfferInvitationMailStatusSelector;
exports.MilestoneStatusSelector = MilestoneStatusSelector;
exports.TaksStatusSelector = TaksStatusSelector;
exports.InvoiceStatusSelector = InvoiceStatusSelector;
exports.LetterStatusMultipleSelector = LetterStatusMultipleSelector;
exports.ApplicationCallStatusSelector = ApplicationCallStatusSelector;
exports.ClientNeedStatusSelector = ClientNeedStatusSelector;
exports.LetterStatusSelector = LetterStatusSelector;
exports.OurLetterStatusSelector = OurLetterStatusSelector;
exports.IncomingLetterStatusSelector = IncomingLetterStatusSelector;
const react_1 = __importDefault(require("react"));
require("react-bootstrap-typeahead/css/Typeahead.css");
require("../../../Css/styles.css");
const MainSetupReact_1 = __importDefault(require("../../../React/MainSetupReact"));
const GenericComponents_1 = require("./GenericComponents");
function ProjectStatusSelector({ showValidationInfo = true, name, label = name, multiple = false, as, }) {
    return statusSelector({
        statuses: Object.values(MainSetupReact_1.default.ProjectStatuses),
        showValidationInfo,
        name: name ?? (multiple ? "statuses" : "status"),
        label: label ?? name ?? (multiple ? "statuses" : "status"),
        multiple,
        as,
    });
}
function ContractStatusSelector({ showValidationInfo = true, multiple = false, name, label, as, }) {
    return statusSelector({
        statuses: Object.values(MainSetupReact_1.default.ContractStatuses),
        showValidationInfo,
        name: name ?? (multiple ? "statuses" : "status"),
        label: label ?? name ?? (multiple ? "statuses" : "status"),
        multiple,
        as,
    });
}
function SecurityStatusSelector({ showValidationInfo = true, name = "status", label, as, }) {
    return statusSelector({
        statuses: Object.values(MainSetupReact_1.default.SecurityStatus),
        showValidationInfo,
        name,
        label,
        multiple: false,
        as,
    });
}
function OfferStatusSelector({ showValidationInfo = true, name, label, multiple = false, as, }) {
    return statusSelector({
        statuses: Object.values(MainSetupReact_1.default.OfferStatus),
        showValidationInfo,
        name: name ?? (multiple ? "statuses" : "status"),
        label: label ?? name ?? (multiple ? "statuses" : "status"),
        multiple,
        as,
    });
}
function OfferBondStatusSelector({ showValidationInfo = true, multiple = false, name, label, as, }) {
    return statusSelector({
        statuses: Object.values(MainSetupReact_1.default.OfferBondStatus),
        showValidationInfo,
        name: name ?? (multiple ? "statuses" : "status"),
        label: label ?? name ?? (multiple ? "statuses" : "status"),
        multiple,
        as,
    });
}
function OfferBondFormSelector({ showValidationInfo = true, name = "form", as, label = name, }) {
    return statusSelector({
        statuses: Object.values(MainSetupReact_1.default.OfferBondForm),
        showValidationInfo,
        name,
        label,
        multiple: false,
        as,
    });
}
function OfferInvitationMailStatusSelector({ showValidationInfo = true, name, label, multiple = false, as, }) {
    return statusSelector({
        statuses: Object.values(MainSetupReact_1.default.OfferInvitationMailStatus),
        showValidationInfo,
        name: name ?? (multiple ? "statuses" : "status"),
        label: label ?? name ?? (multiple ? "statuses" : "status"),
        multiple,
        as,
    });
}
function MilestoneStatusSelector({ showValidationInfo = true, name, label, multiple = false, as, }) {
    return statusSelector({
        statuses: Object.values(MainSetupReact_1.default.MilestoneStatus),
        showValidationInfo,
        name: name ?? (multiple ? "statuses" : "status"),
        label: label ?? name ?? (multiple ? "statuses" : "status"),
        multiple,
        as,
    });
}
function TaksStatusSelector({ showValidationInfo = true, name, label, multiple = false, as, }) {
    return statusSelector({
        statuses: Object.values(MainSetupReact_1.default.TaskStatus),
        showValidationInfo,
        name: name ?? (multiple ? "statuses" : "status"),
        label: label ?? name ?? (multiple ? "statuses" : "status"),
        multiple,
        as,
    });
}
function InvoiceStatusSelector({ showValidationInfo = true, multiple = false, name, label, as, }) {
    return statusSelector({
        statuses: Object.values(MainSetupReact_1.default.InvoiceStatuses),
        showValidationInfo,
        name: name ?? (multiple ? "statuses" : "status"),
        label: label ?? name ?? (multiple ? "statuses" : "status"),
        multiple,
        as,
    });
}
function LetterStatusMultipleSelector({ showValidationInfo = false, multiple = true, name, label, as, }) {
    return statusSelector({
        statuses: [...Object.values(MainSetupReact_1.default.OurLetterStatus), ...Object.values(MainSetupReact_1.default.IncomingLetterStatus)],
        showValidationInfo,
        name: "statuses",
        label: "Statusy",
        multiple,
        as,
    });
}
function ApplicationCallStatusSelector({ showValidationInfo = true, name, label, multiple = false, as, }) {
    return statusSelector({
        statuses: Object.values(MainSetupReact_1.default.ApplicationCallStatus),
        showValidationInfo,
        name: name ?? (multiple ? "statuses" : "status"),
        label: label ?? name ?? (multiple ? "statuses" : "status"),
        multiple,
        as,
    });
}
function ClientNeedStatusSelector({ showValidationInfo = true, name, label, multiple = false, as, }) {
    return statusSelector({
        statuses: Object.values(MainSetupReact_1.default.ClientNeedStatus),
        showValidationInfo,
        name: name ?? (multiple ? "statuses" : "status"),
        label: label ?? name ?? (multiple ? "statuses" : "status"),
        multiple,
        as,
    });
}
function LetterStatusSelector({ showValidationInfo = true, name, label, multiple = false, as, }) {
    return statusSelector({
        statuses: [...Object.values(MainSetupReact_1.default.OurLetterStatus), ...Object.values(MainSetupReact_1.default.IncomingLetterStatus)],
        showValidationInfo,
        name,
        label,
        multiple,
        as,
    });
}
function OurLetterStatusSelector({ showValidationInfo = true, name, label, multiple = false, as, }) {
    return statusSelector({
        statuses: Object.values(MainSetupReact_1.default.OurLetterStatus),
        showValidationInfo,
        name,
        label,
        multiple,
        as,
    });
}
function IncomingLetterStatusSelector({ showValidationInfo = true, name, label, multiple = false, as, }) {
    return statusSelector({
        statuses: Object.values(MainSetupReact_1.default.IncomingLetterStatus),
        showValidationInfo,
        name,
        label,
        multiple,
        as,
    });
}
function statusSelector({ statuses, showValidationInfo = true, name, label, multiple = false, as, }) {
    const resolvedName = name ?? (multiple ? "statuses" : "status");
    const resolvedLabel = label ?? resolvedName;
    return multiple ? (react_1.default.createElement(GenericComponents_1.TypeaheadStringSelector, { options: statuses, showValidationInfo: showValidationInfo, name: resolvedName, label: resolvedLabel, as: as })) : (react_1.default.createElement(GenericComponents_1.TextOptionSelector, { options: statuses, showValidationInfo: showValidationInfo, name: resolvedName, label: resolvedLabel, as: as }));
}
