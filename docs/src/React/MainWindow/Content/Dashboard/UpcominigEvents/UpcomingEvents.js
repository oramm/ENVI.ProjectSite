"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importDefault(require("react"));
const SecuritiesList_1 = __importDefault(require("./SecuritiesList"));
const MilestonesList_1 = __importDefault(require("./MilestonesList"));
function UpcomingEvents() {
    return (react_1.default.createElement(react_1.default.Fragment, null,
        react_1.default.createElement("div", { className: "mb-3 bg-white" },
            react_1.default.createElement(MilestonesList_1.default, null)),
        react_1.default.createElement("div", { className: "mb-3" },
            react_1.default.createElement(SecuritiesList_1.default, null))));
}
exports.default = UpcomingEvents;
