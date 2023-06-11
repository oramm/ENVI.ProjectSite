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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProjectModalBody = void 0;
const react_1 = __importStar(require("react"));
const react_bootstrap_1 = require("react-bootstrap");
const MainSetupReact_1 = __importDefault(require("../../React/MainSetupReact"));
const CommonFormComponents_1 = require("../../View/Modals/CommonFormComponents");
const FormContext_1 = require("../../View/Modals/FormContext");
function ProjectModalBody({ isEditing, initialData }) {
    const { register, reset, setValue, watch, formState: { dirtyFields, errors, isValid }, trigger } = (0, FormContext_1.useFormContext)();
    (0, react_1.useEffect)(() => {
        const resetData = {
            name: initialData?.name,
            alias: initialData?.alias,
            comment: initialData?.comment,
            startDate: initialData?.startDate || new Date().toISOString().slice(0, 10),
            endDate: initialData?.endDate || new Date().toISOString().slice(0, 10),
            status: initialData?.status || MainSetupReact_1.default.projectStatusNames[1],
            totalValue: initialData?.totalValue,
            qualifiedValue: initialData?.qualifiedValue,
            dotationValue: initialData?.dotationValue,
            ourId: initialData?.ourId,
            _employers: initialData?._employers,
            _engineers: initialData?._engineers
        };
        reset(resetData);
        trigger();
    }, [initialData, reset]);
    return (react_1.default.createElement(react_1.default.Fragment, null,
        react_1.default.createElement(react_bootstrap_1.Form.Group, { controlId: "ourId" },
            react_1.default.createElement(react_bootstrap_1.Form.Label, null, "Oznaczenie Projektu"),
            react_1.default.createElement(react_bootstrap_1.Form.Control, { type: 'text', placeholder: "Podaj numer", isInvalid: !!errors?.ourId, isValid: !errors?.ourId, ...register('ourId') }),
            react_1.default.createElement(CommonFormComponents_1.ErrorMessage, { errors: errors, name: 'ourId' })),
        react_1.default.createElement(react_bootstrap_1.Form.Group, { controlId: "name" },
            react_1.default.createElement(react_bootstrap_1.Form.Label, null, "Nazwa projektu"),
            react_1.default.createElement(react_bootstrap_1.Form.Control, { as: "textarea", rows: 2, placeholder: "Podaj nazw\u0119", isInvalid: !!errors?.name, isValid: !errors?.name, ...register('name') }),
            react_1.default.createElement(CommonFormComponents_1.ErrorMessage, { errors: errors, name: 'name' })),
        react_1.default.createElement(react_bootstrap_1.Form.Group, { controlId: "alias" },
            react_1.default.createElement(react_bootstrap_1.Form.Label, null, "Alias"),
            react_1.default.createElement(react_bootstrap_1.Form.Control, { type: "text", placeholder: "Podaj alias", isValid: !errors?.alias, isInvalid: !!errors?.alias, ...register('alias') }),
            react_1.default.createElement(CommonFormComponents_1.ErrorMessage, { errors: errors, name: 'alias' })),
        react_1.default.createElement(react_bootstrap_1.Form.Group, { controlId: "comment" },
            react_1.default.createElement(react_bootstrap_1.Form.Label, null, "Opis"),
            react_1.default.createElement(react_bootstrap_1.Form.Control, { as: "textarea", rows: 3, placeholder: "Podaj opis", isValid: !errors?.comment, isInvalid: !!errors?.comment, ...register('comment') }),
            react_1.default.createElement(CommonFormComponents_1.ErrorMessage, { errors: errors, name: 'comment' })),
        react_1.default.createElement(react_bootstrap_1.Row, null,
            react_1.default.createElement(react_bootstrap_1.Form.Group, { as: react_bootstrap_1.Col, controlId: "totalValue" },
                react_1.default.createElement(react_bootstrap_1.Form.Label, null, "Warto\u015B\u0107 ca\u0142kowita"),
                react_1.default.createElement(CommonFormComponents_1.ValueInPLNInput, { keyLabel: 'totalValue' })),
            react_1.default.createElement(react_bootstrap_1.Form.Group, { as: react_bootstrap_1.Col, controlId: "qualifiedValue" },
                react_1.default.createElement(react_bootstrap_1.Form.Label, null, "Warto\u015B\u0107 kwalifikowana"),
                react_1.default.createElement(CommonFormComponents_1.ValueInPLNInput, { keyLabel: 'qualifiedValue' })),
            react_1.default.createElement(react_bootstrap_1.Form.Group, { as: react_bootstrap_1.Col, controlId: "dotationValue" },
                react_1.default.createElement(react_bootstrap_1.Form.Label, null, "Warto\u015B\u0107 dofinansowania"),
                react_1.default.createElement(CommonFormComponents_1.ValueInPLNInput, { keyLabel: 'dotationValue' }))),
        react_1.default.createElement(react_bootstrap_1.Row, null,
            react_1.default.createElement(react_bootstrap_1.Form.Group, { as: react_bootstrap_1.Col, controlId: "startDate" },
                react_1.default.createElement(react_bootstrap_1.Form.Label, null, "Pocz\u0105tek"),
                react_1.default.createElement(react_bootstrap_1.Form.Control, { type: "date", isValid: !errors.startDate, isInvalid: !!errors.startDate, ...register('startDate'), onChange: (e) => {
                        register("startDate").onChange(e); // wywołaj standardowe zachowanie
                        trigger("endDate");
                    } }),
                react_1.default.createElement(CommonFormComponents_1.ErrorMessage, { errors: errors, name: 'startDate' })),
            react_1.default.createElement(react_bootstrap_1.Form.Group, { as: react_bootstrap_1.Col, controlId: "endDate" },
                react_1.default.createElement(react_bootstrap_1.Form.Label, null, "Zako\u0144czenie"),
                react_1.default.createElement(react_bootstrap_1.Form.Control, { type: "date", isValid: !errors.endDate, isInvalid: !!errors.endDate, ...register('endDate'), onChange: (e) => {
                        register("endDate").onChange(e); // wywołaj standardowe zachowanie
                        trigger("startDate");
                    } }),
                react_1.default.createElement(CommonFormComponents_1.ErrorMessage, { errors: errors, name: 'endDate' }))),
        react_1.default.createElement(CommonFormComponents_1.ProjectStatusSelectFormElement, null)));
}
exports.ProjectModalBody = ProjectModalBody;
