"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importDefault(require("react"));
const CommonComponents_1 = require("../../../../View/Resultsets/CommonComponents");
const ToolsDate_1 = __importDefault(require("../../../Tools/ToolsDate"));
const MainSetupReact_1 = __importDefault(require("../../../MainSetupReact"));
const typeGuards_1 = require("../../../../../Typings/typeGuards");
const GeneralModalButtons_1 = require("../../../../View/Modals/GeneralModalButtons");
const DashboardCardContext_1 = require("../../../../View/Resultsets/DashboardCard/DashboardCardContext");
const MainWindowController_1 = require("../../MainWindowController");
const react_bootstrap_1 = require("react-bootstrap");
const MilestoneDateBodiesPartial_1 = require("../../../../Contracts/Dates/Modals/MilestoneDateBodiesPartial");
function MilestoneDateItem({ object: item, onClick }) {
    if (!item.id)
        return react_1.default.createElement(react_1.default.Fragment, null, "\u26A0\uFE0F brak ID");
    const _contract = item._milestone?._contract;
    const _milestone = item._milestone;
    let contractLabel = `${_contract?._ourIdOrNumber_Alias} ` || " ";
    if ((0, typeGuards_1.isOurContract)(_contract))
        contractLabel += _contract?._type?.name;
    function renderDaysLeft() {
        if (!item._milestone?.status ||
            ![MainSetupReact_1.default.MilestoneStatus.IN_PROGRESS, MainSetupReact_1.default.MilestoneStatus.NOT_STARTED].includes(item._milestone.status))
            return null;
        const daysLeft = ToolsDate_1.default.countDaysLeftTo(item.endDate);
        return react_1.default.createElement(CommonComponents_1.DaysLeftBadge, { daysLeft: daysLeft });
    }
    function renderContractStatus(item) {
        if (!item._milestone?._contract?.status)
            return react_1.default.createElement(react_bootstrap_1.Alert, { variant: "danger" }, "Brak statusu");
        const { handleEditObject } = (0, DashboardCardContext_1.useDashboardCardContext)();
        return (react_1.default.createElement(GeneralModalButtons_1.PartialEditTrigger, { modalProps: {
                initialData: item,
                modalTitle: `Edycja statusu kontraktu ${item._milestone?._contract?._ourIdOrNumber_Alias}`,
                repository: MainWindowController_1.milestoneDatesRepository,
                ModalBodyComponent: MilestoneDateBodiesPartial_1.ContractModalBodyStatus,
                onEdit: handleEditObject,
                fieldsToUpdate: ["status"],
                specialActionRoute: "milestoneDateContract",
                //makeValidationSchema: contractStatusValidationSchema,
            } },
            react_1.default.createElement(CommonComponents_1.ContractStatusBadge, { status: item._milestone?._contract?.status || "" })));
    }
    function renderMilestoneStatus(item) {
        const { handleEditObject } = (0, DashboardCardContext_1.useDashboardCardContext)();
        return (react_1.default.createElement(GeneralModalButtons_1.PartialEditTrigger, { modalProps: {
                initialData: item,
                modalTitle: `Edycja statusu kamienia milowego ${item._milestone?._FolderNumber_TypeName_Name}`,
                repository: MainWindowController_1.milestoneDatesRepository,
                ModalBodyComponent: MilestoneDateBodiesPartial_1.MilestoneModalBodyStatus,
                onEdit: handleEditObject,
                fieldsToUpdate: ["status"],
                specialActionRoute: "milestoneDateMilestone",
                //makeValidationSchema: contractStatusValidationSchema,
            } },
            react_1.default.createElement(CommonComponents_1.MilestoneStatusBadge, { status: item._milestone?.status || "" })));
    }
    return (react_1.default.createElement("div", { onClick: onClick, style: { cursor: onClick ? "pointer" : "default" } },
        react_1.default.createElement("div", { className: "mb-2" },
            contractLabel,
            renderContractStatus(item)),
        react_1.default.createElement("div", { className: "mb-2" },
            react_1.default.createElement("span", { className: "small" }, "Kamie\u0144: "),
            react_1.default.createElement("span", { className: "fw-bold me-1" }, _milestone?._type.name),
            " ",
            react_1.default.createElement("span", { className: "me-1" }, _milestone?.name || ""),
            renderMilestoneStatus(item),
            react_1.default.createElement("div", { className: "mt-1" },
                react_1.default.createElement("span", { className: "small" }, "Od:"),
                " ",
                react_1.default.createElement("span", { className: "fs-6" }, ToolsDate_1.default.dateISOToDMY(item.startDate)),
                " ",
                react_1.default.createElement("span", { className: "small" }, "do:"),
                " ",
                react_1.default.createElement("span", { className: "fs-6" }, ToolsDate_1.default.dateISOToDMY(item.endDate)),
                " ",
                renderDaysLeft()))));
}
exports.default = MilestoneDateItem;
