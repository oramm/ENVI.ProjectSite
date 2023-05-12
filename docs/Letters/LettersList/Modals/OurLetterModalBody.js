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
const LettersSearch_1 = require("../LettersSearch");
const FormContext_1 = require("../../../View/Modals/FormContext");
const react_bootstrap_1 = require("react-bootstrap");
function OurLetterModalBody(props) {
    const initialData = props.initialData;
    const { register, setValue, watch, formState, control } = (0, FormContext_1.useFormContext)();
    const _contract = watch('_contract');
    const _project = watch('_project');
    (0, react_1.useEffect)(() => {
        //setValue('_entitiesMain', initialData?._entitiesMain, { shouldValidate: true });
    }, [initialData, setValue]);
    return (react_1.default.createElement(react_1.default.Fragment, null,
        react_1.default.createElement(react_bootstrap_1.Form.Group, null,
            react_1.default.createElement(react_bootstrap_1.Form.Label, null, "Dotyczy spraw"),
            react_1.default.createElement(CommonFormComponents_1.CaseSelectMenuElement, { name: '_cases', repository: LettersSearch_1.casesRepository, required: true, _project: _project, _contract: _contract })),
        react_1.default.createElement(LetterModalBody_1.LetterModalBody, { ...props }),
        react_1.default.createElement(react_bootstrap_1.Form.Group, null,
            react_1.default.createElement(react_bootstrap_1.Form.Label, null, "Odbiorca"),
            react_1.default.createElement(CommonFormComponents_1.MyAsyncTypeahead, { name: '_entitiesMain', labelKey: 'name', repository: LettersSearch_1.entitiesRepository, multiple: true }))));
}
exports.OurLetterModalBody = OurLetterModalBody;
