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
exports.OurLetterModalBody = void 0;
const react_1 = __importStar(require("react"));
const CommonFormComponents_1 = require("../../../View/Modals/CommonFormComponents");
const LetterModalBody_1 = require("./LetterModalBody");
const FormContext_1 = require("../../../View/Modals/FormContext");
const react_bootstrap_1 = require("react-bootstrap");
const LettersController_1 = require("../LettersController");
function OurLetterModalBody(props) {
    const { initialData, isEditing } = props;
    const { setValue, watch, register, formState: { errors } } = (0, FormContext_1.useFormContext)();
    const _cases = watch('_cases');
    (0, react_1.useEffect)(() => {
        setValue('_entitiesMain', initialData?._entitiesMain, { shouldDirty: false, shouldValidate: true });
        setValue('_entitiesCc', initialData?._entitiesCc, { shouldDirty: false, shouldValidate: true });
    }, [initialData, setValue]);
    return (react_1.default.createElement(react_1.default.Fragment, null,
        react_1.default.createElement(LetterModalBody_1.LetterModalBody, { ...props }),
        !isEditing &&
            react_1.default.createElement(CommonFormComponents_1.OurLetterTemplateSelectFormElement, { _cases: _cases || [] }),
        react_1.default.createElement(react_bootstrap_1.Form.Group, null,
            react_1.default.createElement(react_bootstrap_1.Form.Label, null, "Odbiorcy"),
            react_1.default.createElement(CommonFormComponents_1.MyAsyncTypeahead, { name: '_entitiesMain', labelKey: 'name', repository: LettersController_1.entitiesRepository, multiple: true }),
            react_1.default.createElement(CommonFormComponents_1.ErrorMessage, { errors: errors, name: '_entitiesMain' })),
        react_1.default.createElement(react_bootstrap_1.Form.Group, null,
            react_1.default.createElement(react_bootstrap_1.Form.Label, null, "Do wiadomo\u015Bci"),
            react_1.default.createElement(CommonFormComponents_1.MyAsyncTypeahead, { name: '_entitiesCc', labelKey: 'name', repository: LettersController_1.entitiesRepository, multiple: true }),
            react_1.default.createElement(CommonFormComponents_1.ErrorMessage, { errors: errors, name: '_entitiesCc' })),
        react_1.default.createElement("input", { type: "hidden", ...register('isOur'), value: 'true' })));
}
exports.OurLetterModalBody = OurLetterModalBody;
