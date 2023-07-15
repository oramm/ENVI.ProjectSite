"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LettersFilterBody = void 0;
const react_1 = __importDefault(require("react"));
const CommonFormComponents_1 = require("../../View/Modals/CommonFormComponents");
const react_bootstrap_1 = require("react-bootstrap");
const FormContext_1 = require("../../View/Modals/FormContext");
const MainSetupReact_1 = __importDefault(require("../../React/MainSetupReact"));
const LettersController_1 = require("./LettersController");
function LettersFilterBody({}) {
    const { register, watch } = (0, FormContext_1.useFormContext)();
    const _project = watch('_project');
    const _contract = watch('_contract');
    return (react_1.default.createElement(react_bootstrap_1.Row, { xl: 5, md: 3, xs: 1 },
        react_1.default.createElement(react_bootstrap_1.Form.Group, { as: react_bootstrap_1.Col },
            react_1.default.createElement(react_bootstrap_1.Form.Label, null, "Szukana fraza"),
            react_1.default.createElement(react_bootstrap_1.Form.Control, { type: "text", placeholder: "Wpisz tekst", ...register('searchText') })),
        react_1.default.createElement(react_bootstrap_1.Form.Group, { as: react_bootstrap_1.Col },
            react_1.default.createElement(react_bootstrap_1.Form.Label, null, "Utworzono od"),
            react_1.default.createElement(react_bootstrap_1.Form.Control, { type: "date", defaultValue: MainSetupReact_1.default.LettersFilterInitState.CREATION_DATE_FROM, ...register('creationDateFrom') })),
        react_1.default.createElement(react_bootstrap_1.Form.Group, { as: react_bootstrap_1.Col },
            react_1.default.createElement(react_bootstrap_1.Form.Label, null, "Utworzono do"),
            react_1.default.createElement(react_bootstrap_1.Form.Control, { type: "date", defaultValue: MainSetupReact_1.default.LettersFilterInitState.CREATION_DATE_TO, ...register('creationDateTo') })),
        react_1.default.createElement(react_bootstrap_1.Form.Group, { as: react_bootstrap_1.Col },
            react_1.default.createElement(CommonFormComponents_1.ProjectSelector, { name: '_project', repository: LettersController_1.projectsRepository, showValidationInfo: false })),
        react_1.default.createElement(react_bootstrap_1.Form.Group, { as: react_bootstrap_1.Col },
            react_1.default.createElement(react_bootstrap_1.Form.Label, null, "Kontrakt"),
            react_1.default.createElement(CommonFormComponents_1.ContractSelectFormElement, { repository: LettersController_1.contractsRepository, name: '_contract', typesToInclude: 'all', showValidationInfo: false, _project: _project })),
        1 && react_1.default.createElement(react_bootstrap_1.Form.Group, { as: react_bootstrap_1.Col },
            react_1.default.createElement(react_bootstrap_1.Form.Label, null, "Sprawa"),
            react_1.default.createElement(CommonFormComponents_1.CaseSelectMenuElement, { name: '_case', repository: LettersController_1.casesRepository, showValidationInfo: false, _contract: _contract, multiple: false }))));
}
exports.LettersFilterBody = LettersFilterBody;
