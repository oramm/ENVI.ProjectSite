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
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.SkillDictionaryModalBody = SkillDictionaryModalBody;
const react_1 = __importStar(require("react"));
const react_bootstrap_1 = require("react-bootstrap");
const GenericComponents_1 = require("../../../View/Modals/CommonFormComponents/GenericComponents");
const FormContext_1 = require("../../../View/Modals/FormContext");
function SkillDictionaryModalBody({ initialData }) {
    const { register, reset, formState: { errors }, trigger, } = (0, FormContext_1.useFormContext)();
    (0, react_1.useEffect)(() => {
        reset({
            name: initialData?.name || "",
            description: initialData?.description || "",
        });
        trigger();
    }, [initialData, reset, trigger]);
    return (react_1.default.createElement(react_1.default.Fragment, null,
        react_1.default.createElement(react_bootstrap_1.Form.Group, { controlId: "name" },
            react_1.default.createElement(react_bootstrap_1.Form.Label, null, "Nazwa"),
            react_1.default.createElement(react_bootstrap_1.Form.Control, { type: "text", placeholder: "Podaj nazwe specjalizacji", isInvalid: !!errors?.name, isValid: !errors?.name, ...register("name") }),
            react_1.default.createElement(GenericComponents_1.ErrorMessage, { name: "name", errors: errors })),
        react_1.default.createElement(react_bootstrap_1.Form.Group, { controlId: "description", className: "mt-3" },
            react_1.default.createElement(react_bootstrap_1.Form.Label, null, "Opis (opcjonalnie)"),
            react_1.default.createElement(react_bootstrap_1.Form.Control, { as: "textarea", rows: 3, placeholder: "Podaj opis specjalizacji", isInvalid: !!errors?.description, isValid: !errors?.description, ...register("description") }),
            react_1.default.createElement(GenericComponents_1.ErrorMessage, { name: "description", errors: errors }))));
}
