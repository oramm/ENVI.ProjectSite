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
exports.ContractMilestoneModalBody = void 0;
const react_1 = __importStar(require("react"));
const react_bootstrap_1 = require("react-bootstrap");
const BussinesObjectSelectors_1 = require("../../../View/Modals/CommonFormComponents/BussinesObjectSelectors");
const FormContext_1 = require("../../../View/Modals/FormContext");
const GenericComponents_1 = require("../../../View/Modals/CommonFormComponents/GenericComponents");
const StatusSelectors_1 = require("../../../View/Modals/CommonFormComponents/StatusSelectors");
const CommonComponentsController_1 = require("../../../View/Resultsets/CommonComponentsController");
const react_hook_form_1 = require("react-hook-form");
const CommonComponents_1 = require("../../../View/Resultsets/CommonComponents");
function ContractMilestoneModalBody({ isEditing, initialData, contextData }) {
    const { register, reset, watch, formState: { errors }, trigger, control, } = (0, FormContext_1.useFormContext)();
    const { fields, append, remove, replace } = (0, react_hook_form_1.useFieldArray)({
        control,
        name: "_dates",
    });
    const _type = watch("_type");
    const _contract = (initialData?._contract || contextData); // Memoize processedDates to prevent infinite loops
    const processedDates = (0, react_1.useMemo)(() => {
        const dates = initialData?._dates;
        if (!dates || dates?.length === 0) {
            // Jeśli brak dat, zwróć jeden pusty wiersz
            return [
                {
                    startDate: null,
                    endDate: null,
                    description: "",
                },
            ];
        }
        return dates.map((d) => ({
            ...d,
            startDate: d.startDate ? d.startDate.split("T")[0] : "",
            endDate: d.endDate ? d.endDate.split("T")[0] : "",
        }));
    }, [initialData?._dates]);
    // Initialize form fields (excluding field array which is managed separately)
    (0, react_1.useEffect)(() => {
        const resetData = {
            _contract,
            _type: initialData?._type,
            name: initialData?.name,
            description: initialData?.description || "",
            status: initialData?.status,
            // Note: _dates is excluded - field array manages this independently
        };
        reset(resetData);
        trigger();
    }, [initialData, reset, _contract]); // Sync field array with processed dates (separate from form reset)
    (0, react_1.useEffect)(() => {
        replace(processedDates);
    }, [processedDates, replace]);
    // Trigger validation when fields array changes
    (0, react_1.useEffect)(() => {
        trigger("_dates");
    }, [fields.length, trigger]);
    function shouldShowNameField() {
        if (initialData?._type?.isUniquePerContract)
            return false;
        if (_type?.isUniquePerContract)
            return false;
        return true;
    }
    function hasAnyDateError(errors, index) {
        return (0, CommonComponentsController_1.hasError)(errors, `_dates.${index}.startDate`) || (0, CommonComponentsController_1.hasError)(errors, `_dates.${index}.endDate`);
    }
    const handleAddDateRange = (0, react_1.useCallback)(() => {
        append({
            startDate: null,
            endDate: null,
            description: "",
        });
        // Validation will be triggered automatically by useEffect watching fields.length
    }, [append]);
    const handleRemoveDateRange = (0, react_1.useCallback)((index) => {
        remove(index);
        // Validation will be triggered automatically by useEffect watching fields.length
    }, [remove]);
    function renderDates() {
        return fields.map((field, index) => (react_1.default.createElement(react_bootstrap_1.Row, { className: "mb-2", key: field.id },
            react_1.default.createElement(react_bootstrap_1.Col, null,
                react_1.default.createElement(react_bootstrap_1.Form.Group, { controlId: `_dates.${index}.startDate` },
                    react_1.default.createElement(react_bootstrap_1.Form.Label, null, "Data rozpocz\u0119cia"),
                    react_1.default.createElement(react_hook_form_1.Controller, { name: `_dates.${index}.startDate`, control: control, render: ({ field: { onChange, value, ...fieldProps } }) => (react_1.default.createElement(react_bootstrap_1.Form.Control, { ...fieldProps, type: "date", value: value || "", isInvalid: hasAnyDateError(errors, index), isValid: !hasAnyDateError(errors, index), onChange: (e) => {
                                onChange(e.target.value);
                                // Waliduj oba pola po zmianie
                                trigger([`_dates.${index}.startDate`, `_dates.${index}.endDate`]);
                            } })) }),
                    react_1.default.createElement(GenericComponents_1.ErrorMessage, { name: `_dates.${index}.startDate`, errors: errors }))),
            react_1.default.createElement(react_bootstrap_1.Col, null,
                react_1.default.createElement(react_bootstrap_1.Form.Group, { controlId: `_dates.${index}.endDate` },
                    react_1.default.createElement(react_bootstrap_1.Form.Label, null, "Data zako\u0144czenia"),
                    react_1.default.createElement(react_hook_form_1.Controller, { name: `_dates.${index}.endDate`, control: control, render: ({ field: { onChange, value, ...fieldProps } }) => (react_1.default.createElement(react_bootstrap_1.Form.Control, { ...fieldProps, type: "date", value: value || "", isInvalid: hasAnyDateError(errors, index), isValid: !hasAnyDateError(errors, index), onChange: (e) => {
                                onChange(e.target.value);
                                // Waliduj oba pola po zmianie
                                trigger([`_dates.${index}.startDate`, `_dates.${index}.endDate`]);
                            } })) }),
                    react_1.default.createElement(GenericComponents_1.ErrorMessage, { name: `_dates.${index}.endDate`, errors: errors }))),
            react_1.default.createElement(react_bootstrap_1.Col, null,
                react_1.default.createElement(react_bootstrap_1.Form.Group, { controlId: `_dates.${index}.description` },
                    react_1.default.createElement(react_bootstrap_1.Form.Label, null, "Uwagi"),
                    react_1.default.createElement(react_bootstrap_1.Form.Control, { as: "textarea", rows: 3, placeholder: "Dodaj komentarz", isInvalid: (0, CommonComponentsController_1.hasError)(errors, `_dates.${index}.description`), isValid: !(0, CommonComponentsController_1.hasError)(errors, `_dates.${index}.description`), ...register(`_dates.${index}.description`) }),
                    react_1.default.createElement(GenericComponents_1.ErrorMessage, { name: `_dates.${index}.description`, errors: errors }))),
            react_1.default.createElement(react_bootstrap_1.Col, { xs: "auto", className: "d-flex align-items-center" },
                react_1.default.createElement(CommonComponents_1.DeleteIconButton, { layout: "vertical", onClick: () => handleRemoveDateRange(index) })))));
    }
    return (react_1.default.createElement(react_1.default.Fragment, null,
        !isEditing && react_1.default.createElement(BussinesObjectSelectors_1.MilestoneTypeSelector, { contractType: _contract._type }),
        shouldShowNameField() && (react_1.default.createElement(react_bootstrap_1.Form.Group, { controlId: "name", className: "mb-2" },
            react_1.default.createElement(react_bootstrap_1.Form.Label, null, "Nazwa"),
            react_1.default.createElement(react_bootstrap_1.Form.Control, { as: "textarea", rows: 2, placeholder: "Podaj nazw\u0119", isInvalid: !!errors?.name, isValid: !errors?.name, ...register("name") }),
            react_1.default.createElement(GenericComponents_1.ErrorMessage, { name: "name", errors: errors }))),
        " ",
        renderDates(),
        react_1.default.createElement(react_bootstrap_1.Row, { className: "mb-3" },
            react_1.default.createElement(react_bootstrap_1.Col, null,
                " ",
                react_1.default.createElement("button", { type: "button", className: "btn btn-outline-primary", onClick: handleAddDateRange }, "+ Dodaj przedzia\u0142 dat"))),
        react_1.default.createElement(GenericComponents_1.ErrorMessage, { name: "_dates", errors: errors }),
        react_1.default.createElement(StatusSelectors_1.MilestoneStatusSelector, { showValidationInfo: true }),
        react_1.default.createElement(react_bootstrap_1.Form.Group, { controlId: "description" },
            react_1.default.createElement(react_bootstrap_1.Form.Label, null, "Uwagi"),
            react_1.default.createElement(react_bootstrap_1.Form.Control, { as: "textarea", rows: 3, placeholder: "Dodaj komentarz", isInvalid: !!errors?.description, isValid: !errors?.description, ...register("description") }),
            react_1.default.createElement(GenericComponents_1.ErrorMessage, { name: "description", errors: errors }))));
}
exports.ContractMilestoneModalBody = ContractMilestoneModalBody;
