"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProjectSelectorModalBody = void 0;
const react_1 = __importDefault(require("react"));
const CommonFormComponents_1 = require("../../../View/Modals/CommonFormComponents");
const react_bootstrap_1 = require("react-bootstrap");
const LettersSearch_1 = require("../LettersSearch");
const FormContext_1 = require("../../../View/Modals/FormContext");
function ProjectSelectorModalBody({ isEditing, additionalProps }) {
    const { register, setValue, watch, formState } = (0, FormContext_1.useFormContext)();
    const _project = watch('_project');
    return (react_1.default.createElement(react_1.default.Fragment, null,
        react_1.default.createElement(CommonFormComponents_1.ProjectSelector, { repository: LettersSearch_1.projectsRepository, required: true, name: '_project' }),
        react_1.default.createElement(react_bootstrap_1.Form.Group, null,
            react_1.default.createElement(react_bootstrap_1.Form.Label, null, "Dotyczy spraw"),
            react_1.default.createElement(CommonFormComponents_1.CaseSelectMenuElement, { name: '_cases', repository: LettersSearch_1.casesRepository }))));
}
exports.ProjectSelectorModalBody = ProjectSelectorModalBody;
;
