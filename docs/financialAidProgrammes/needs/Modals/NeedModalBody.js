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
exports.NeedModalBody = void 0;
const react_1 = __importStar(require("react"));
const CommonFormComponents_1 = require("../../../View/Modals/CommonFormComponents");
const react_bootstrap_1 = require("react-bootstrap");
const FormContext_1 = require("../../../View/Modals/FormContext");
const FinancialAidProgrammesController_1 = require("../../FinancialAidProgrammesController");
function NeedModalBody({ isEditing, initialData }) {
    const { register, reset, formState: { errors }, trigger, } = (0, FormContext_1.useFormContext)();
    (0, react_1.useEffect)(() => {
        const resetData = {
            _client: initialData?._client,
            name: initialData?.name,
            description: initialData?.description,
            status: initialData?.status,
        };
        reset(resetData);
        trigger();
    }, [initialData, reset, trigger]);
    return (react_1.default.createElement(react_1.default.Fragment, null,
        react_1.default.createElement(react_bootstrap_1.Form.Group, null,
            react_1.default.createElement(react_bootstrap_1.Form.Label, null, "Klient"),
            react_1.default.createElement(CommonFormComponents_1.MyAsyncTypeahead, { name: "_client", labelKey: "name", repository: FinancialAidProgrammesController_1.clientsRepository, multiple: false, showValidationInfo: true }),
            react_1.default.createElement(CommonFormComponents_1.ErrorMessage, { errors: errors, name: "_client" })),
        react_1.default.createElement(react_bootstrap_1.Form.Group, { controlId: "name" },
            react_1.default.createElement(react_bootstrap_1.Form.Label, null, "Nazwa"),
            react_1.default.createElement(react_bootstrap_1.Form.Control, { type: "text", placeholder: "Podaj nazw\u0119", isValid: !errors?.name, isInvalid: !!errors?.name, ...register("name") }),
            react_1.default.createElement(CommonFormComponents_1.ErrorMessage, { name: "name", errors: errors })),
        react_1.default.createElement(react_bootstrap_1.Form.Group, { controlId: "description" },
            react_1.default.createElement(react_bootstrap_1.Form.Label, null, "Opis"),
            react_1.default.createElement(react_bootstrap_1.Form.Control, { as: "textarea", rows: 3, placeholder: "Podaj opis", isValid: !errors?.description, isInvalid: !!errors?.description, ...register("description") }),
            react_1.default.createElement(CommonFormComponents_1.ErrorMessage, { name: "description", errors: errors })),
        react_1.default.createElement(react_bootstrap_1.Form.Group, { controlId: "status" },
            react_1.default.createElement(react_bootstrap_1.Form.Label, null, "Status"),
            react_1.default.createElement(react_bootstrap_1.Form.Control, { as: "select", isInvalid: !!errors?.status, ...register("status") },
                react_1.default.createElement("option", { value: "" }, "Wybierz status"),
                react_1.default.createElement("option", { value: "active" }, "Aktywny"),
                react_1.default.createElement("option", { value: "pending" }, "Oczekuj\u0105cy"),
                react_1.default.createElement("option", { value: "completed" }, "Zako\u0144czony"),
                react_1.default.createElement("option", { value: "cancelled" }, "Anulowany")),
            react_1.default.createElement(CommonFormComponents_1.ErrorMessage, { name: "status", errors: errors }))));
}
exports.NeedModalBody = NeedModalBody;
