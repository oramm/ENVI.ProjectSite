"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MilestoneDatesFilterBody = void 0;
const react_1 = __importStar(require("react"));
const react_bootstrap_1 = require("react-bootstrap");
const FormContext_1 = require("../../View/Modals/FormContext");
const BussinesObjectSelectors_1 = require("../../View/Modals/CommonFormComponents/BussinesObjectSelectors");
const MilestoneDatesController_1 = require("./MilestoneDatesController");
const GenericComponents_1 = require("../../View/Modals/CommonFormComponents/GenericComponents");
const StatusSelectors_1 = require("../../View/Modals/CommonFormComponents/StatusSelectors");
const MainSetupReact_1 = __importDefault(require("../../React/MainSetupReact"));
function MilestoneDatesFilterBody() {
    const { register, watch, setValue, reset, trigger } = (0, FormContext_1.useFormContext)();
    const _project = watch("_project");
    (0, react_1.useEffect)(() => {
        const resetData = {
            milestoneStatuses: MainSetupReact_1.default.MilestoneDatesFilterInitState.STATUSES,
            endDateFrom: MainSetupReact_1.default.MilestoneDatesFilterInitState.END_DATE_FROM,
        };
        reset(resetData);
        trigger();
    }, []);
    (0, react_1.useEffect)(() => {
        setValue("_contract", undefined);
    }, [_project]);
    return (react_1.default.createElement(react_1.default.Fragment, null,
        react_1.default.createElement(react_bootstrap_1.Row, null,
            react_1.default.createElement(react_bootstrap_1.Form.Group, { as: react_bootstrap_1.Col, md: 6, xl: 2 },
                react_1.default.createElement(react_bootstrap_1.Form.Label, null, "Szukana fraza"),
                react_1.default.createElement(react_bootstrap_1.Form.Control, { type: "text", placeholder: "Wpisz tekst", ...register("searchText") })),
            react_1.default.createElement(react_bootstrap_1.Form.Group, { as: react_bootstrap_1.Col, md: 6, xl: 2 },
                react_1.default.createElement(BussinesObjectSelectors_1.ProjectSelector, { repository: MilestoneDatesController_1.projectsRepository, showValidationInfo: false })),
            react_1.default.createElement(react_bootstrap_1.Form.Group, { as: react_bootstrap_1.Col, md: 12, xl: 5 },
                react_1.default.createElement(react_bootstrap_1.Form.Label, null, "Kontrakt"),
                react_1.default.createElement(BussinesObjectSelectors_1.ContractSelector, { name: "_contract", typesToInclude: "all", showValidationInfo: false, _project: _project })),
            react_1.default.createElement(react_bootstrap_1.Form.Group, { as: react_bootstrap_1.Col, xl: 3 },
                react_1.default.createElement(StatusSelectors_1.ContractStatusSelector, { showValidationInfo: false, multiple: true, name: "contractStatuses", label: "Statusy kontratu" }))),
        react_1.default.createElement(react_bootstrap_1.Row, null,
            react_1.default.createElement(GenericComponents_1.DateRangeInput, { as: react_bootstrap_1.Col, md: 6, lg: 4, label: "Rozpocz\u0119cie", fromName: "startDateFrom", toName: "startDateTo", showValidationInfo: false }),
            react_1.default.createElement(GenericComponents_1.DateRangeInput, { as: react_bootstrap_1.Col, md: 6, lg: 4, label: "Zako\u0144czenie", fromName: "endDateFrom", toName: "endDateTo", showValidationInfo: false }),
            react_1.default.createElement(react_bootstrap_1.Form.Group, { as: react_bootstrap_1.Col, sm: 12, md: 8, lg: 4, xl: 4, controlId: "_person" },
                react_1.default.createElement(react_bootstrap_1.Form.Label, null, "Administrator kontraktu"),
                react_1.default.createElement(BussinesObjectSelectors_1.PersonSelector, { name: "_person", repository: MilestoneDatesController_1.personsRepository, showValidationInfo: false }))),
        react_1.default.createElement(react_bootstrap_1.Row, null,
            react_1.default.createElement(react_bootstrap_1.Form.Group, { as: react_bootstrap_1.Col, xl: 4 },
                react_1.default.createElement(BussinesObjectSelectors_1.ContractTypeSelector, { name: "_contractType", showValidationInfo: false })),
            react_1.default.createElement(react_bootstrap_1.Form.Group, { as: react_bootstrap_1.Col, xl: 4 },
                react_1.default.createElement(BussinesObjectSelectors_1.ContractRangeSelector, { repository: MainSetupReact_1.default.contractRangesRepository, showValidationInfo: false })),
            react_1.default.createElement(react_bootstrap_1.Form.Group, { as: react_bootstrap_1.Col, xl: 4 },
                react_1.default.createElement(StatusSelectors_1.MilestoneStatusSelector, { showValidationInfo: false, name: "milestoneStatuses", label: "Statusy kamieni milowych", multiple: true })))));
}
exports.MilestoneDatesFilterBody = MilestoneDatesFilterBody;
