"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProjectsFilterBody = void 0;
const react_1 = __importDefault(require("react"));
const react_bootstrap_1 = require("react-bootstrap");
const MainSetupReact_1 = __importDefault(require("../React/MainSetupReact"));
const CommonFormComponents_1 = require("../View/Modals/CommonFormComponents");
const FormContext_1 = require("../View/Modals/FormContext");
function ProjectsFilterBody({}) {
    const { register } = (0, FormContext_1.useFormContext)();
    return (react_1.default.createElement(react_1.default.Fragment, null,
        react_1.default.createElement(react_bootstrap_1.Row, null,
            react_1.default.createElement(react_bootstrap_1.Form.Group, { as: react_bootstrap_1.Col, sm: '12' },
                react_1.default.createElement(CommonFormComponents_1.RadioButtonGroup, { name: 'status', options: [
                        { value: 'ACTIVE', name: 'Aktywny' },
                        { value: MainSetupReact_1.default.ProjectStatuses.FINISHED, name: MainSetupReact_1.default.ProjectStatuses.FINISHED },
                    ] })),
            ' ',
            react_1.default.createElement(react_bootstrap_1.Form.Group, { as: react_bootstrap_1.Col, sm: '12' },
                react_1.default.createElement(react_bootstrap_1.Form.Label, null, "Szukana fraza"),
                react_1.default.createElement(react_bootstrap_1.Form.Control, { type: "text", placeholder: "Wpisz tekst", ...register('searchText') })))));
}
exports.ProjectsFilterBody = ProjectsFilterBody;
