"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LettersFilterBody = void 0;
const react_1 = __importDefault(require("react"));
const CommonFormComponents_1 = require("../../View/Modals/CommonFormComponents");
const react_bootstrap_1 = require("react-bootstrap");
const LettersSearch_1 = require("./LettersSearch");
const FormContext_1 = require("../../View/Modals/FormContext");
const MainSetupReact_1 = __importDefault(require("../../React/MainSetupReact"));
function LettersFilterBody({}) {
    const { register } = (0, FormContext_1.useFormContext)();
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
            react_1.default.createElement(CommonFormComponents_1.ProjectSelector, { name: '_project', repository: LettersSearch_1.projectsRepository, showValidationInfo: false }))));
}
exports.LettersFilterBody = LettersFilterBody;