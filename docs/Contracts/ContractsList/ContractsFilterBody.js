"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContractsFilterBody = void 0;
const react_1 = __importDefault(require("react"));
const BussinesObjectSelectors_1 = require("../../View/Modals/CommonFormComponents/BussinesObjectSelectors");
const react_bootstrap_1 = require("react-bootstrap");
const FormContext_1 = require("../../View/Modals/FormContext");
const ToolsDate_1 = __importDefault(require("../../React/ToolsDate"));
const ContractsController_1 = require("./ContractsController");
const StatusSelectors_1 = require("../../View/Modals/CommonFormComponents/StatusSelectors");
function ContractsFilterBody() {
    const { register } = (0, FormContext_1.useFormContext)();
    return (react_1.default.createElement(react_bootstrap_1.Row, { xl: 12, md: 3, xs: 1 },
        react_1.default.createElement(react_bootstrap_1.Form.Group, { as: react_bootstrap_1.Col, xl: 2 },
            react_1.default.createElement(react_bootstrap_1.Form.Label, null, "Szukana fraza"),
            react_1.default.createElement(react_bootstrap_1.Form.Control, { type: "text", placeholder: "Wpisz tekst", ...register("searchText") })),
        react_1.default.createElement(react_bootstrap_1.Form.Group, { as: react_bootstrap_1.Col, xl: 5 },
            react_1.default.createElement(BussinesObjectSelectors_1.ProjectSelector, { repository: ContractsController_1.projectsRepository, showValidationInfo: false })),
        react_1.default.createElement(react_bootstrap_1.Form.Group, { as: react_bootstrap_1.Col, xl: 5 },
            react_1.default.createElement(BussinesObjectSelectors_1.ContractTypeSelectFormElement, { name: "_contractType", showValidationInfo: false })),
        react_1.default.createElement(react_bootstrap_1.Form.Group, { as: react_bootstrap_1.Col, xl: 2 },
            react_1.default.createElement(react_bootstrap_1.Form.Label, null, "Pocz\u0105tek od"),
            react_1.default.createElement(react_bootstrap_1.Form.Control, { type: "date", defaultValue: ToolsDate_1.default.addDays(new Date(), -365).toISOString().slice(0, 10), ...register("startDateFrom") })),
        react_1.default.createElement(react_bootstrap_1.Form.Group, { as: react_bootstrap_1.Col, xl: 2 },
            react_1.default.createElement(react_bootstrap_1.Form.Label, null, "Pocz\u0105tek do"),
            react_1.default.createElement(react_bootstrap_1.Form.Control, { type: "date", defaultValue: ToolsDate_1.default.addDays(new Date(), +600).toISOString().slice(0, 10), ...register("startDateTo") })),
        react_1.default.createElement(react_bootstrap_1.Form.Group, { as: react_bootstrap_1.Col, xl: 2 },
            react_1.default.createElement(react_bootstrap_1.Form.Label, null, "Koniec od"),
            react_1.default.createElement(react_bootstrap_1.Form.Control, { type: "date", defaultValue: ToolsDate_1.default.addDays(new Date(), -60).toISOString().slice(0, 10), ...register("endDateFrom") })),
        react_1.default.createElement(react_bootstrap_1.Form.Group, { as: react_bootstrap_1.Col, xl: 2 },
            react_1.default.createElement(react_bootstrap_1.Form.Label, null, "Koniec do"),
            react_1.default.createElement(react_bootstrap_1.Form.Control, { type: "date", defaultValue: undefined, ...register("endDateTo") })),
        react_1.default.createElement(react_bootstrap_1.Form.Group, { as: react_bootstrap_1.Col, xl: 2 },
            react_1.default.createElement(StatusSelectors_1.ContractStatusSelectFormElement, { name: "status", showValidationInfo: false })),
        react_1.default.createElement(react_bootstrap_1.Form.Group, { as: react_bootstrap_1.Col, xl: 2 },
            react_1.default.createElement(BussinesObjectSelectors_1.ContractRangeSelector, { repository: ContractsController_1.contractRangesRepository, showValidationInfo: false }))));
}
exports.ContractsFilterBody = ContractsFilterBody;
