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
exports.MeetingModalBody = MeetingModalBody;
const react_1 = __importStar(require("react"));
const react_bootstrap_1 = require("react-bootstrap");
const FormContext_1 = require("../../../../../View/Modals/FormContext");
const GenericComponents_1 = require("../../../../../View/Modals/CommonFormComponents/GenericComponents");
function MeetingModalBody({ isEditing, initialData, contextData }) {
    const { register, reset, formState: { errors }, trigger } = (0, FormContext_1.useFormContext)();
    (0, react_1.useEffect)(() => {
        const resetData = {
            contractId: contextData,
            name: initialData?.name || '',
            date: initialData?.date || new Date().toISOString().slice(0, 10),
            location: initialData?.location || '',
        };
        reset(resetData);
        trigger();
    }, [initialData, reset]);
    return (react_1.default.createElement(react_1.default.Fragment, null,
        react_1.default.createElement(react_bootstrap_1.Form.Group, { controlId: "name" },
            react_1.default.createElement(react_bootstrap_1.Form.Label, null, "Nazwa spotkania"),
            react_1.default.createElement(react_bootstrap_1.Form.Control, { as: "textarea", rows: 2, placeholder: "Podaj nazw\u0119 spotkania", isInvalid: !!errors?.name, isValid: !errors?.name, ...register('name') }),
            react_1.default.createElement(GenericComponents_1.ErrorMessage, { name: "name", errors: errors })),
        react_1.default.createElement(react_bootstrap_1.Form.Group, { controlId: "date" },
            react_1.default.createElement(react_bootstrap_1.Form.Label, null, "Data spotkania"),
            react_1.default.createElement(react_bootstrap_1.Form.Control, { type: "date", isValid: !errors?.date, isInvalid: !!errors?.date, ...register('date') }),
            react_1.default.createElement(GenericComponents_1.ErrorMessage, { name: "date", errors: errors })),
        react_1.default.createElement(react_bootstrap_1.Form.Group, { controlId: "location" },
            react_1.default.createElement(react_bootstrap_1.Form.Label, null, "Lokalizacja"),
            react_1.default.createElement(react_bootstrap_1.Form.Control, { type: "text", placeholder: "np. Biuro, Teams, Zoom", isValid: !errors?.location, isInvalid: !!errors?.location, ...register('location') }),
            react_1.default.createElement(GenericComponents_1.ErrorMessage, { name: "location", errors: errors }))));
}
