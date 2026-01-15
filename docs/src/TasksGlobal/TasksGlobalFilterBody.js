"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TasksGlobalFilterBody = TasksGlobalFilterBody;
const react_1 = __importDefault(require("react"));
const react_bootstrap_1 = require("react-bootstrap");
const ContractContext_1 = require("../Contracts/ContractsList/ContractContext");
const MainSetupReact_1 = __importDefault(require("../React/MainSetupReact"));
const BussinesObjectSelectors_1 = require("../View/Modals/CommonFormComponents/BussinesObjectSelectors");
const StatusSelectors_1 = require("../View/Modals/CommonFormComponents/StatusSelectors");
function TasksGlobalFilterBody() {
    const { project } = (0, ContractContext_1.useContract)();
    return (react_1.default.createElement(react_bootstrap_1.Row, null,
        react_1.default.createElement(react_bootstrap_1.Form.Group, { as: react_bootstrap_1.Col, md: 6, controlId: "_contract" },
            react_1.default.createElement(react_bootstrap_1.Form.Label, null, "Kontrakt"),
            react_1.default.createElement(BussinesObjectSelectors_1.ContractSelector, { showValidationInfo: false, _project: project })),
        react_1.default.createElement(react_bootstrap_1.Form.Group, { as: react_bootstrap_1.Col, md: 3, controlId: "_owner" },
            react_1.default.createElement(BussinesObjectSelectors_1.PersonSelectorPreloaded, { showValidationInfo: false, repository: MainSetupReact_1.default.personsEnviRepository, name: "_owner", label: "W\u0142a\u015Bciciel" })),
        react_1.default.createElement(react_bootstrap_1.Form.Group, { as: react_bootstrap_1.Col, md: 3 },
            react_1.default.createElement(StatusSelectors_1.ContractStatusSelector, { showValidationInfo: false, multiple: true, label: "Statusy kontratu" }))));
}
