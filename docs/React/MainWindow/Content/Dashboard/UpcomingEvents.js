"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importDefault(require("react"));
const ContractsList_1 = __importDefault(require("./UpcominigEvents/ContractsList"));
const SecuritiesList_1 = __importDefault(require("./UpcominigEvents/SecuritiesList"));
function UpcomingEvents() {
    return (react_1.default.createElement(react_1.default.Fragment, null,
        react_1.default.createElement("div", { className: 'mb-3' },
            react_1.default.createElement(ContractsList_1.default, null)),
        react_1.default.createElement("div", { className: 'mb-3' },
            react_1.default.createElement(SecuritiesList_1.default, null))));
}
exports.default = UpcomingEvents;
