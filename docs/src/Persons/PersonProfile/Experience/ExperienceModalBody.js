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
exports.ExperienceModalBody = void 0;
const react_1 = __importStar(require("react"));
const react_bootstrap_1 = require("react-bootstrap");
const FormContext_1 = require("../../../View/Modals/FormContext");
const GenericComponents_1 = require("../../../View/Modals/CommonFormComponents/GenericComponents");
function ExperienceModalBody({ isEditing, initialData }) {
    const { register, reset, formState: { errors }, trigger, } = (0, FormContext_1.useFormContext)();
    (0, react_1.useEffect)(() => {
        const resetData = {
            organizationName: initialData?.organizationName,
            positionName: initialData?.positionName,
            description: initialData?.description,
            dateFrom: initialData?.dateFrom,
            dateTo: initialData?.dateTo,
            isCurrent: initialData?.isCurrent || false,
        };
        reset(resetData);
        trigger();
    }, [initialData, reset]);
    return (react_1.default.createElement(react_1.default.Fragment, null,
        react_1.default.createElement(react_bootstrap_1.Form.Group, { controlId: "organizationName", className: "mb-3" },
            react_1.default.createElement(react_bootstrap_1.Form.Label, null, "Organizacja"),
            react_1.default.createElement(react_bootstrap_1.Form.Control, { type: "text", placeholder: "Podaj nazw\u0119 organizacji", isInvalid: !!errors?.organizationName, isValid: !errors?.organizationName, ...register("organizationName") }),
            react_1.default.createElement(GenericComponents_1.ErrorMessage, { name: "organizationName", errors: errors })),
        react_1.default.createElement(react_bootstrap_1.Form.Group, { controlId: "positionName", className: "mb-3" },
            react_1.default.createElement(react_bootstrap_1.Form.Label, null, "Stanowisko"),
            react_1.default.createElement(react_bootstrap_1.Form.Control, { type: "text", placeholder: "Podaj stanowisko", isInvalid: !!errors?.positionName, isValid: !errors?.positionName, ...register("positionName") }),
            react_1.default.createElement(GenericComponents_1.ErrorMessage, { name: "positionName", errors: errors })),
        react_1.default.createElement(react_bootstrap_1.Form.Group, { controlId: "description", className: "mb-3" },
            react_1.default.createElement(react_bootstrap_1.Form.Label, null, "Opis"),
            react_1.default.createElement(react_bootstrap_1.Form.Control, { as: "textarea", rows: 3, placeholder: "Opis obowi\u0105zk\u00F3w", isInvalid: !!errors?.description, isValid: !errors?.description, ...register("description") }),
            react_1.default.createElement(GenericComponents_1.ErrorMessage, { name: "description", errors: errors })),
        react_1.default.createElement(react_bootstrap_1.Form.Group, { controlId: "dateFrom", className: "mb-3" },
            react_1.default.createElement(react_bootstrap_1.Form.Label, null, "Data od"),
            react_1.default.createElement(react_bootstrap_1.Form.Control, { type: "date", ...register("dateFrom") })),
        react_1.default.createElement(react_bootstrap_1.Form.Group, { controlId: "dateTo", className: "mb-3" },
            react_1.default.createElement(react_bootstrap_1.Form.Label, null, "Data do"),
            react_1.default.createElement(react_bootstrap_1.Form.Control, { type: "date", ...register("dateTo") })),
        react_1.default.createElement(react_bootstrap_1.Form.Group, { controlId: "isCurrent", className: "mb-3" },
            react_1.default.createElement(react_bootstrap_1.Form.Check, { type: "checkbox", label: "Obecne miejsce pracy", ...register("isCurrent") }))));
}
exports.ExperienceModalBody = ExperienceModalBody;
