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
exports.ContractModalBodyDates = exports.ContractModalBodyName = exports.ContractModalBodyStatus = void 0;
const react_1 = __importStar(require("react"));
const react_bootstrap_1 = require("react-bootstrap");
const FormContext_1 = require("../../../View/Modals/FormContext");
const ToolsForms_1 = __importDefault(require("../../../React/ToolsForms"));
const ToolsDate_1 = __importDefault(require("../../../React/ToolsDate"));
const StatusSelectors_1 = require("../../../View/Modals/CommonFormComponents/StatusSelectors");
const GenericComponents_1 = require("../../../View/Modals/CommonFormComponents/GenericComponents");
function ContractModalBodyStatus({ initialData }) {
    const { setValue, register, formState: { errors }, } = (0, FormContext_1.useFormContext)();
    (0, react_1.useEffect)(() => {
        setValue("status", initialData?.status || "", { shouldValidate: true });
    }, [initialData, setValue]);
    return react_1.default.createElement(StatusSelectors_1.ContractStatusSelectFormElement, null);
}
exports.ContractModalBodyStatus = ContractModalBodyStatus;
function ContractModalBodyName({ initialData }) {
    const { setValue, register, formState: { errors }, } = (0, FormContext_1.useFormContext)();
    (0, react_1.useEffect)(() => {
        setValue("name", initialData?.name || "", { shouldValidate: true });
    }, [initialData, setValue]);
    return (react_1.default.createElement(react_bootstrap_1.Form.Group, { controlId: "name" },
        react_1.default.createElement(react_bootstrap_1.Form.Label, null, "Nazwa kontraktu"),
        react_1.default.createElement(react_bootstrap_1.Form.Control, { as: "textarea", rows: 2, placeholder: "Podaj nazw\u0119", isInvalid: !!errors?.name, isValid: !errors?.name, ...register("name") }),
        react_1.default.createElement(GenericComponents_1.ErrorMessage, { errors: errors, name: "name" })));
}
exports.ContractModalBodyName = ContractModalBodyName;
function ContractModalBodyDates({ initialData, isEditing, additionalProps = {}, }) {
    const { setValue, register, formState: { errors }, trigger, watch, } = (0, FormContext_1.useFormContext)();
    let { watchAllFieldsExternal, startDateSugestion, endDateSugestion, guaranteeEndDateSugestion } = additionalProps;
    //jeśli nie ma watch w formularzu zewnętrznym to będzie tutaj
    const watchAllFields = watchAllFieldsExternal || watch();
    if (isEditing) {
        startDateSugestion = initialData?.startDate;
        endDateSugestion = initialData?.endDate;
        guaranteeEndDateSugestion = initialData?.guaranteeEndDate;
    }
    else {
        startDateSugestion = new Date().toISOString().slice(0, 10);
        endDateSugestion = ToolsDate_1.default.addDays(startDateSugestion, 365).toISOString().slice(0, 10);
        guaranteeEndDateSugestion = ToolsDate_1.default.addDays(endDateSugestion, 365 * 2)
            .toISOString()
            .slice(0, 10);
    }
    (0, react_1.useEffect)(() => {
        setValue("startDate", startDateSugestion, { shouldValidate: true });
        setValue("endDate", endDateSugestion, { shouldValidate: true });
        setValue("guaranteeEndDate", guaranteeEndDateSugestion, { shouldValidate: true });
    }, [initialData, setValue]);
    return (react_1.default.createElement(react_bootstrap_1.Row, null,
        react_1.default.createElement(react_bootstrap_1.Form.Group, { as: react_bootstrap_1.Col, controlId: "startDate" },
            react_1.default.createElement(react_bootstrap_1.Form.Label, null, "Pocz\u0105tek"),
            react_1.default.createElement(react_bootstrap_1.Form.Control, { type: "date", isValid: !errors.startDate, isInvalid: !!errors.startDate, ...register("startDate"), className: !isEditing ? ToolsForms_1.default.getSuggestedClass("startDate", watchAllFields, startDateSugestion) : "", onChange: (e) => {
                    register("startDate").onChange(e); // wywołaj standardowe zachowanie
                    trigger("endDate");
                } }),
            react_1.default.createElement(GenericComponents_1.ErrorMessage, { errors: errors, name: "startDate" })),
        react_1.default.createElement(react_bootstrap_1.Form.Group, { as: react_bootstrap_1.Col, controlId: "endDate" },
            react_1.default.createElement(react_bootstrap_1.Form.Label, null, "Zako\u0144czenie"),
            react_1.default.createElement(react_bootstrap_1.Form.Control, { type: "date", isValid: !errors.endDate, isInvalid: !!errors.endDate, ...register("endDate"), className: !isEditing ? ToolsForms_1.default.getSuggestedClass("endDate", watchAllFields, endDateSugestion) : "", onChange: (e) => {
                    register("endDate").onChange(e); // wywołaj standardowe zachowanie
                    trigger("startDate");
                    trigger("guaranteeEndDate");
                } }),
            react_1.default.createElement(GenericComponents_1.ErrorMessage, { errors: errors, name: "endDate" })),
        react_1.default.createElement(react_bootstrap_1.Form.Group, { as: react_bootstrap_1.Col, controlId: "guaranteeEndDate" },
            react_1.default.createElement(react_bootstrap_1.Form.Label, null, "Gwarancja"),
            react_1.default.createElement(react_bootstrap_1.Form.Control, { type: "date", isValid: !errors.guaranteeEndDate, isInvalid: !!errors.guaranteeEndDate, ...register("guaranteeEndDate"), className: !isEditing
                    ? ToolsForms_1.default.getSuggestedClass("guaranteeEndDate", watchAllFields, guaranteeEndDateSugestion)
                    : "", onChange: (e) => {
                    register("guaranteeEndDate").onChange(e); // wywołaj standardowe zachowanie
                    //trigger("startDate");
                } }),
            react_1.default.createElement(GenericComponents_1.ErrorMessage, { errors: errors, name: "guaranteeEndDate" }))));
}
exports.ContractModalBodyDates = ContractModalBodyDates;
