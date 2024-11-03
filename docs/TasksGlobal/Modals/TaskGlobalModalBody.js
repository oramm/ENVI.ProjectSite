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
exports.TaskGlobalModalBody = void 0;
const react_1 = __importStar(require("react"));
const react_bootstrap_1 = require("react-bootstrap");
const MainSetupReact_1 = __importDefault(require("../../React/MainSetupReact"));
const BussinesObjectSelectors_1 = require("../../View/Modals/CommonFormComponents/BussinesObjectSelectors");
const FormContext_1 = require("../../View/Modals/FormContext");
const StatusSelectors_1 = require("../../View/Modals/CommonFormComponents/StatusSelectors");
const GenericComponents_1 = require("../../View/Modals/CommonFormComponents/GenericComponents");
function TaskGlobalModalBody({ isEditing, initialData, contextData }) {
    const { register, reset, setValue, watch, formState: { dirtyFields, errors, isValid }, trigger, } = (0, FormContext_1.useFormContext)();
    const _case = initialData?._parent || contextData;
    (0, react_1.useEffect)(() => {
        console.log("TaskModalBody useEffect", initialData);
        const resetData = {
            _case,
            name: initialData?.name,
            description: initialData?.description || "",
            deadline: initialData?.deadline || new Date().toISOString().slice(0, 10),
            status: initialData?.status || MainSetupReact_1.default.TaskStatus.BACKLOG,
            _owner: initialData?._owner || MainSetupReact_1.default.getCurrentUserAsPerson(),
        };
        reset(resetData);
        trigger();
    }, [initialData, reset]);
    return (react_1.default.createElement(react_1.default.Fragment, null,
        react_1.default.createElement(react_bootstrap_1.Form.Group, { controlId: "name" },
            react_1.default.createElement(react_bootstrap_1.Form.Label, null, "Nazwa zadania"),
            react_1.default.createElement(react_bootstrap_1.Form.Control, { as: "textarea", rows: 2, placeholder: "Podaj nazw\u0119", isInvalid: !!errors?.name, isValid: !errors?.name, ...register("name") }),
            react_1.default.createElement(GenericComponents_1.ErrorMessage, { name: "name", errors: errors })),
        react_1.default.createElement(react_bootstrap_1.Form.Group, { controlId: "description" },
            react_1.default.createElement(react_bootstrap_1.Form.Label, null, "Uwagi"),
            react_1.default.createElement(react_bootstrap_1.Form.Control, { as: "textarea", rows: 3, placeholder: "Dodaj komentarz", isValid: !errors?.description, isInvalid: !!errors?.description, ...register("description") }),
            react_1.default.createElement(GenericComponents_1.ErrorMessage, { name: "description", errors: errors })),
        react_1.default.createElement(react_bootstrap_1.Form.Group, { controlId: "deadline" },
            react_1.default.createElement(react_bootstrap_1.Form.Label, null, "Termin"),
            react_1.default.createElement(react_bootstrap_1.Form.Control, { type: "date", isValid: !errors.deadline, isInvalid: !!errors.deadline, ...register("deadline") }),
            react_1.default.createElement(GenericComponents_1.ErrorMessage, { name: "deadline", errors: errors })),
        react_1.default.createElement(StatusSelectors_1.TaksStatusSelectFormElement, null),
        react_1.default.createElement(react_bootstrap_1.Form.Group, { controlId: "_owner" },
            react_1.default.createElement(BussinesObjectSelectors_1.PersonSelectorPreloaded, { label: "W\u0142a\u015Bciciel", name: "_owner", repository: MainSetupReact_1.default.personsEnviRepository }))));
}
exports.TaskGlobalModalBody = TaskGlobalModalBody;
