"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContractsFilterBody = void 0;
const react_1 = __importDefault(require("react"));
const CommonComponents_1 = require("../../View/Resultsets/CommonComponents");
const react_bootstrap_1 = require("react-bootstrap");
const ContractsSearch_1 = require("./ContractsSearch");
const FormContext_1 = require("../../View/FormContext");
const ToolsDate_1 = __importDefault(require("../../React/ToolsDate"));
function ContractsFilterBody({}) {
    const { register } = (0, FormContext_1.useFormContext)();
    return (react_1.default.createElement(react_1.default.Fragment, null,
        react_1.default.createElement(react_bootstrap_1.Form.Group, null,
            react_1.default.createElement(react_bootstrap_1.Form.Label, null, "Szukana fraza"),
            react_1.default.createElement(react_bootstrap_1.Form.Control, { type: "text", placeholder: "Wpisz tekst", ...register('searchText') })),
        react_1.default.createElement(react_bootstrap_1.Form.Group, null,
            react_1.default.createElement(react_bootstrap_1.Form.Label, null, "Pocz\u0105tek od"),
            react_1.default.createElement(react_bootstrap_1.Form.Control, { type: "date", defaultValue: ToolsDate_1.default.addDays(new Date(), -365).toISOString().slice(0, 10), ...register('startDateFrom') })),
        react_1.default.createElement(react_bootstrap_1.Form.Group, null,
            react_1.default.createElement(react_bootstrap_1.Form.Label, null, "Pocz\u0105tek do"),
            react_1.default.createElement(react_bootstrap_1.Form.Control, { type: "date", defaultValue: ToolsDate_1.default.addDays(new Date(), +600).toISOString().slice(0, 10), ...register('startDateTo') })),
        react_1.default.createElement(CommonComponents_1.ProjectSelector, { repository: ContractsSearch_1.projectsRepository, required: false, showValidationInfo: false }),
        react_1.default.createElement(CommonComponents_1.ContractTypeSelectFormElement, { name: '_contractType', showValidationInfo: false })));
}
exports.ContractsFilterBody = ContractsFilterBody;
