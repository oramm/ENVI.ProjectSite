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
Object.defineProperty(exports, "__esModule", { value: true });
exports.CaseModalBody = void 0;
const react_1 = __importStar(require("react"));
const react_bootstrap_1 = require("react-bootstrap");
const BussinesObjectSelectors_1 = require("../../../View/Modals/CommonFormComponents/BussinesObjectSelectors");
const FormContext_1 = require("../../../View/Modals/FormContext");
const GenericComponents_1 = require("../../../View/Modals/CommonFormComponents/GenericComponents");
function CaseModalBody({ isEditing, initialData, contextData: contextData }) {
    const { register, reset, getValues, watch, formState: { dirtyFields, errors, isValid }, trigger, } = (0, FormContext_1.useFormContext)();
    const _type = watch("_type");
    const _parent = (initialData?._parent || contextData);
    (0, react_1.useEffect)(() => {
        console.log("CaseModalBody useEffect", initialData);
        const resetData = {
            _parent,
            _type: initialData?._type,
            name: initialData?.name,
            description: initialData?.description || "",
        };
        reset(resetData);
        trigger();
    }, [initialData, reset]);
    function shoulShowCaseNameField() {
        if (initialData?._type?.isUniquePerMilestone)
            return false;
        if (_type?.isUniquePerMilestone)
            return false;
        return true;
    }
    return (react_1.default.createElement(react_1.default.Fragment, null,
        !isEditing && react_1.default.createElement(BussinesObjectSelectors_1.CaseTypeSelectFormElement, { milestoneType: _parent._type }),
        shoulShowCaseNameField() && (react_1.default.createElement(react_bootstrap_1.Form.Group, { controlId: "name" },
            react_1.default.createElement(react_bootstrap_1.Form.Label, null, "Nazwa sprawy"),
            react_1.default.createElement(react_bootstrap_1.Form.Control, { as: "textarea", rows: 2, placeholder: "Podaj nazw\u0119", isInvalid: !!errors?.name, isValid: !errors?.name, ...register("name") }),
            react_1.default.createElement(GenericComponents_1.ErrorMessage, { name: "name", errors: errors }))),
        react_1.default.createElement(react_bootstrap_1.Form.Group, { controlId: "description" },
            react_1.default.createElement(react_bootstrap_1.Form.Label, null, "Uwagi"),
            react_1.default.createElement(react_bootstrap_1.Form.Control, { as: "textarea", rows: 3, placeholder: "Dodaj komentarz", isValid: !errors?.description, isInvalid: !!errors?.description, ...register("description") }),
            react_1.default.createElement(GenericComponents_1.ErrorMessage, { name: "description", errors: errors }))));
}
exports.CaseModalBody = CaseModalBody;
