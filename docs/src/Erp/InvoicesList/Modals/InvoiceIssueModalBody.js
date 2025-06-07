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
exports.InvoiceIssueModalBody = void 0;
const react_1 = __importStar(require("react"));
const react_bootstrap_1 = require("react-bootstrap");
const FormContext_1 = require("../../../View/Modals/FormContext");
const GenericComponents_1 = require("../../../View/Modals/CommonFormComponents/GenericComponents");
function InvoiceIssueModalBody({ initialData }) {
    const { register, reset, setValue, watch, formState: { dirtyFields, errors, isValid }, trigger, } = (0, FormContext_1.useFormContext)();
    (0, react_1.useEffect)(() => {
        console.log("InvoiceModalBody useEffect", initialData);
        const resetData = {
            number: initialData?.number,
        };
        reset(resetData);
        trigger();
    }, [initialData, reset]);
    return (react_1.default.createElement(react_1.default.Fragment, null,
        react_1.default.createElement(react_bootstrap_1.Form.Group, { controlId: "number" },
            react_1.default.createElement(react_bootstrap_1.Form.Label, null, "Numer"),
            react_1.default.createElement(react_bootstrap_1.Form.Control, { as: "input", isValid: !errors?.number, isInvalid: !!errors?.number, ...register("number") }),
            react_1.default.createElement(GenericComponents_1.ErrorMessage, { name: "number", errors: errors })),
        react_1.default.createElement(react_bootstrap_1.Form.Group, { controlId: "file" },
            react_1.default.createElement(react_bootstrap_1.Form.Label, null, "Plik"),
            react_1.default.createElement(GenericComponents_1.FileInput, { acceptedFileTypes: "application/msword, application/vnd.ms-excel, application/pdf", ...register("file"), multiple: false }))));
}
exports.InvoiceIssueModalBody = InvoiceIssueModalBody;
