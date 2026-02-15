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
exports.EducationModalBody = EducationModalBody;
const react_1 = __importStar(require("react"));
const react_bootstrap_1 = require("react-bootstrap");
const FormContext_1 = require("../../../View/Modals/FormContext");
const GenericComponents_1 = require("../../../View/Modals/CommonFormComponents/GenericComponents");
function EducationModalBody({ isEditing, initialData }) {
    const { register, reset, formState: { errors }, trigger, } = (0, FormContext_1.useFormContext)();
    (0, react_1.useEffect)(() => {
        const resetData = {
            schoolName: initialData?.schoolName,
            degreeName: initialData?.degreeName,
            fieldOfStudy: initialData?.fieldOfStudy,
            dateFrom: initialData?.dateFrom,
            dateTo: initialData?.dateTo,
        };
        reset(resetData);
        trigger();
    }, [initialData, reset]);
    return (react_1.default.createElement(react_1.default.Fragment, null,
        react_1.default.createElement(react_bootstrap_1.Form.Group, { controlId: "schoolName", className: "mb-3" },
            react_1.default.createElement(react_bootstrap_1.Form.Label, null, "Nazwa szko\u0142y/uczelni"),
            react_1.default.createElement(react_bootstrap_1.Form.Control, { type: "text", placeholder: "Podaj nazw\u0119", isInvalid: !!errors?.schoolName, isValid: !errors?.schoolName, ...register("schoolName") }),
            react_1.default.createElement(GenericComponents_1.ErrorMessage, { name: "schoolName", errors: errors })),
        react_1.default.createElement(react_bootstrap_1.Form.Group, { controlId: "degreeName", className: "mb-3" },
            react_1.default.createElement(react_bootstrap_1.Form.Label, null, "Tytu\u0142/stopie\u0144"),
            react_1.default.createElement(react_bootstrap_1.Form.Control, { type: "text", placeholder: "np. magister, in\u017Cynier", isInvalid: !!errors?.degreeName, isValid: !errors?.degreeName, ...register("degreeName") }),
            react_1.default.createElement(GenericComponents_1.ErrorMessage, { name: "degreeName", errors: errors })),
        react_1.default.createElement(react_bootstrap_1.Form.Group, { controlId: "fieldOfStudy", className: "mb-3" },
            react_1.default.createElement(react_bootstrap_1.Form.Label, null, "Kierunek"),
            react_1.default.createElement(react_bootstrap_1.Form.Control, { type: "text", placeholder: "np. Informatyka", isInvalid: !!errors?.fieldOfStudy, isValid: !errors?.fieldOfStudy, ...register("fieldOfStudy") }),
            react_1.default.createElement(GenericComponents_1.ErrorMessage, { name: "fieldOfStudy", errors: errors })),
        react_1.default.createElement(react_bootstrap_1.Form.Group, { controlId: "dateFrom", className: "mb-3" },
            react_1.default.createElement(react_bootstrap_1.Form.Label, null, "Data od"),
            react_1.default.createElement(react_bootstrap_1.Form.Control, { type: "date", ...register("dateFrom") })),
        react_1.default.createElement(react_bootstrap_1.Form.Group, { controlId: "dateTo", className: "mb-3" },
            react_1.default.createElement(react_bootstrap_1.Form.Label, null, "Data do"),
            react_1.default.createElement(react_bootstrap_1.Form.Control, { type: "date", ...register("dateTo") }))));
}
