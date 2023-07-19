"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TasksFilterBody = void 0;
const react_1 = __importDefault(require("react"));
const react_bootstrap_1 = require("react-bootstrap");
const FormContext_1 = require("../../../../View/Modals/FormContext");
const CommonFormComponents_1 = require("../../../../View/Modals/CommonFormComponents");
const ContractContext_1 = require("../../ContractContext");
const ToolsDate_1 = __importDefault(require("../../../../React/ToolsDate"));
const ContractsController_1 = require("../../ContractsController");
const MainSetupReact_1 = __importDefault(require("../../../../React/MainSetupReact"));
function TasksFilterBody() {
    const { register } = (0, FormContext_1.useFormContext)();
    const { contract } = (0, ContractContext_1.useContract)();
    return (react_1.default.createElement(react_bootstrap_1.Row, { xl: 5, md: 3, xs: 1 },
        react_1.default.createElement(react_bootstrap_1.Form.Group, { as: react_bootstrap_1.Col },
            react_1.default.createElement(react_bootstrap_1.Form.Label, null, "Szukana fraza"),
            react_1.default.createElement(react_bootstrap_1.Form.Control, { type: "text", placeholder: "Wpisz tekst", ...register('searchText') })),
        react_1.default.createElement(react_bootstrap_1.Form.Group, { as: react_bootstrap_1.Col },
            react_1.default.createElement(react_bootstrap_1.Form.Label, null, "Zako\u0144czenie od"),
            react_1.default.createElement(react_bootstrap_1.Form.Control, { type: "date", defaultValue: ToolsDate_1.default.addDays(new Date(), -365).toISOString().slice(0, 10), ...register('deadlineFrom') })),
        react_1.default.createElement(react_bootstrap_1.Form.Group, { as: react_bootstrap_1.Col },
            react_1.default.createElement(react_bootstrap_1.Form.Label, null, "Zako\u0144czenie do"),
            react_1.default.createElement(react_bootstrap_1.Form.Control, { type: "date", defaultValue: ToolsDate_1.default.addDays(new Date(), +600).toISOString().slice(0, 10), ...register('deadlineTo') })),
        react_1.default.createElement(react_bootstrap_1.Form.Group, { as: react_bootstrap_1.Col },
            react_1.default.createElement(react_bootstrap_1.Form.Label, null, "Sprawa"),
            react_1.default.createElement(CommonFormComponents_1.CaseSelectMenuElement, { repository: ContractsController_1.casesRepository, showValidationInfo: false, _contract: contract })),
        react_1.default.createElement(react_bootstrap_1.Form.Group, { as: react_bootstrap_1.Col },
            react_1.default.createElement(CommonFormComponents_1.TaksStatusSelectFormElement, { showValidationInfo: false })),
        react_1.default.createElement(react_bootstrap_1.Form.Group, { as: react_bootstrap_1.Col },
            react_1.default.createElement(CommonFormComponents_1.PersonSelectFormElement, { showValidationInfo: false, repository: MainSetupReact_1.default.personsEnviRepository, name: '_owner', label: 'W\u0142a\u015Bciciel' }))));
}
exports.TasksFilterBody = TasksFilterBody;
