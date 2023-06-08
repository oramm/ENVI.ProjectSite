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
exports.InvoiceSetAsSentModalBody = void 0;
const react_1 = __importStar(require("react"));
const CommonFormComponents_1 = require("../../../View/Modals/CommonFormComponents");
const react_bootstrap_1 = require("react-bootstrap");
const FormContext_1 = require("../../../View/Modals/FormContext");
function InvoiceSetAsSentModalBody({ initialData }) {
    const { register, reset, setValue, watch, formState: { dirtyFields, errors, isValid }, trigger } = (0, FormContext_1.useFormContext)();
    (0, react_1.useEffect)(() => {
        console.log('InvoiceModalBody useEffect', initialData);
        const resetData = {
            sentDate: initialData?.sentDate,
        };
        reset(resetData);
        trigger();
    }, [initialData, reset]);
    return (react_1.default.createElement(react_1.default.Fragment, null,
        react_1.default.createElement(react_bootstrap_1.Form.Group, { controlId: "sentDate" },
            react_1.default.createElement(react_bootstrap_1.Form.Label, null, "Data utworzenia"),
            react_1.default.createElement(react_bootstrap_1.Form.Control, { type: "date", isValid: !errors.sentDate, isInvalid: !!errors.sentDate, ...register('sentDate') }),
            react_1.default.createElement(CommonFormComponents_1.ErrorMessage, { name: 'sentDate', errors: errors }))));
}
exports.InvoiceSetAsSentModalBody = InvoiceSetAsSentModalBody;
