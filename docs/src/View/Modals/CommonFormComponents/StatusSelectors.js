"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.IncomingLetterStatusSelector = exports.OurLetterStatusSelector = exports.LetterStatusSelector = exports.ClientNeedStatusSelector = exports.ApplicationCallStatusSelector = exports.InvoiceStatusSelector = exports.TaksStatusSelector = exports.MilestoneStatusSelector = exports.OfferInvitationMailStatusSelector = exports.OfferBondFormSelector = exports.OfferBondStatusSelector = exports.OfferStatusSelector = exports.SecurityStatusSelector = exports.ContractStatusSelector = exports.ProjectStatusSelector = void 0;
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
exports.ProjectStatusSelector = ProjectStatusSelector;
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
exports.ContractStatusSelector = ContractStatusSelector;
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
exports.SecurityStatusSelector = SecurityStatusSelector;
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
exports.OfferStatusSelector = OfferStatusSelector;
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
exports.OfferBondStatusSelector = OfferBondStatusSelector;
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
exports.OfferBondFormSelector = OfferBondFormSelector;
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
exports.OfferInvitationMailStatusSelector = OfferInvitationMailStatusSelector;
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
exports.MilestoneStatusSelector = MilestoneStatusSelector;
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
exports.TaksStatusSelector = TaksStatusSelector;
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
exports.InvoiceStatusSelector = InvoiceStatusSelector;
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
exports.ApplicationCallStatusSelector = ApplicationCallStatusSelector;
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
exports.ClientNeedStatusSelector = ClientNeedStatusSelector;
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
exports.LetterStatusSelector = LetterStatusSelector;
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
exports.OurLetterStatusSelector = OurLetterStatusSelector;
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
exports.IncomingLetterStatusSelector = IncomingLetterStatusSelector;
function statusSelector({ statuses, showValidationInfo = true, name, label, multiple = false, as, className = "", }) {
    const resolvedName = name ?? (multiple ? "statuses" : "status");
    const resolvedLabel = label ?? resolvedName;
    return multiple ? (react_1.default.createElement(GenericComponents_1.TypeaheadStringSelector, { options: statuses, showValidationInfo: showValidationInfo, name: resolvedName, label: resolvedLabel, as: as })) : (react_1.default.createElement(GenericComponents_1.TextOptionSelector, { options: statuses, showValidationInfo: showValidationInfo, name: resolvedName, label: resolvedLabel, as: as }));
}
