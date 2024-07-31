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
exports.RadioButtonGroup = exports.FileInput = exports.DateRangeInput = exports.valueValidation = exports.ValueInPLNInput = exports.SelectTextOptionFormElement = exports.MyAsyncTypeahead = exports.ErrorMessage = exports.ErrorMessage1 = void 0;
const react_1 = __importStar(require("react"));
const react_bootstrap_1 = require("react-bootstrap");
const react_bootstrap_typeahead_1 = require("react-bootstrap-typeahead");
require("react-bootstrap-typeahead/css/Typeahead.css");
require("../../../Css/styles.css");
const FormContext_1 = require("../FormContext");
const react_hook_form_1 = require("react-hook-form");
const react_number_format_1 = require("react-number-format");
const Yup = __importStar(require("yup"));
const CommonComponentsController_1 = require("../../Resultsets/CommonComponentsController");
function ErrorMessage1({ errors, name }) {
    return react_1.default.createElement(react_1.default.Fragment, null, errors[name] && react_1.default.createElement(react_bootstrap_1.Form.Text, { className: "text-danger" }, errors[name]?.message));
}
exports.ErrorMessage1 = ErrorMessage1;
function ErrorMessage({ errors, name }) {
    // Function to access nested properties
    const getNestedError = (errors, path) => {
        const keys = path.split("."); // Split the path into keys
        let current = errors;
        for (let key of keys) {
            if (current[key]) {
                current = current[key];
            }
            else {
                return null; // If the path does not exist, return null
            }
        }
        return current;
    };
    const error = getNestedError(errors, name);
    return react_1.default.createElement(react_1.default.Fragment, null, error && react_1.default.createElement(react_bootstrap_1.Form.Text, { className: "text-danger" }, error.message));
}
exports.ErrorMessage = ErrorMessage;
/** Jeśli multiple jest true to wartość pola jest tablicą obiektów, jeśli false to pojedynczym obiektem
 * @param name nazwa pola w formularzu - zostanie wysłane na serwer jako składowa obiektu FormData
 * @param repository repozytorium z którego pobierane są dane
 * @param labelKey nazwa pola w repozytorium które ma być wyświetlane w polu wyboru
 * @param searchKey nazwa pola w repozytorium które ma być wyszukiwane po stronie serwera (sprawdź odpowiedni controller) domyślnie jest równe labelKey
 * @param specialSerwerSearchActionRoute nazwa nietypowego route na serwerze która ma być wywołana zamiast standardowego z RepositoryReact
 * @param multiple czy pole wyboru ma być wielokrotnego wyboru
 * @param renderMenuItemChildren funkcja renderująca elementy listy wyboru (domyślnie wyświetla tylko labelKey)
 */
function MyAsyncTypeahead({ name, repository, labelKey, searchKey = labelKey, contextSearchParams = {}, specialSerwerSearchActionRoute, renderMenuItemChildren = (option) => react_1.default.createElement(react_1.default.Fragment, null, option[labelKey]), renderMenu, multiple = false, allowNew = false, showValidationInfo = true, readOnly = false, }) {
    const { register, control, setValue, formState: { errors }, } = (0, FormContext_1.useFormContext)();
    const [isLoading, setIsLoading] = (0, react_1.useState)(false);
    const [options, setOptions] = (0, react_1.useState)([]);
    function handleSearch(query) {
        //console.log("handleSearch - Query: ", query); // Log the search query
        setIsLoading(true);
        const params = {
            [searchKey]: query,
            ...contextSearchParams,
        };
        repository.loadItemsFromServerPOST([params], specialSerwerSearchActionRoute).then((items) => {
            setOptions(items);
            setIsLoading(false);
            if (items.length > 0 && !(labelKey in items[0]))
                throw new Error(`Nie znaleziono pola ${labelKey} w obiekcie zwróconym przez serwer`);
        });
    }
    // Bypass client-side filtering by returning `true`. Results are already
    // filtered by the search endpoint, so no need to do it again.
    const filterBy = () => true;
    function handleOnChange(selectedOptions, field) {
        let valueToBeSent;
        if (selectedOptions.length > 0) {
            if (selectedOptions[0].customOption) {
                // Nowa wartość wprowadzona przez użytkownika
                valueToBeSent = multiple ? selectedOptions.map((opt) => opt[labelKey]) : selectedOptions[0][labelKey];
            }
            else {
                // Wybrana wartość z listy
                valueToBeSent = multiple ? selectedOptions : selectedOptions[0];
            }
        }
        else {
            valueToBeSent = null;
        }
        setValue(name, valueToBeSent);
        field.onChange(valueToBeSent);
    }
    return (react_1.default.createElement(react_1.default.Fragment, null,
        react_1.default.createElement(react_hook_form_1.Controller, { name: name, control: control, render: ({ field }) => {
                //console.log("Rendering AsyncTypeahead - Field Value: ", field.value);
                return (react_1.default.createElement(react_bootstrap_typeahead_1.AsyncTypeahead, { renderMenu: renderMenu ? renderMenu : undefined, filterBy: filterBy, id: `${name}-asyncTypeahead`, allowNew: allowNew, isLoading: isLoading, labelKey: labelKey, minLength: 2, onSearch: handleSearch, options: options, onChange: (items) => handleOnChange(items, field), onBlur: field.onBlur, selected: field.value ? (multiple ? field.value : [field.value]) : [], multiple: multiple, newSelectionPrefix: "Dodaj nowy: ", placeholder: "-- Wybierz opcj\u0119 --", renderMenuItemChildren: renderMenuItemChildren, isValid: showValidationInfo ? !errors?.[name] : undefined, isInvalid: showValidationInfo ? !!errors?.[name] : undefined }));
            } }),
        react_1.default.createElement(ErrorMessage, { errors: errors, name: name }),
        readOnly && react_1.default.createElement("input", { type: "hidden", ...register(name) })));
}
exports.MyAsyncTypeahead = MyAsyncTypeahead;
function SelectTextOptionFormElement({ options, showValidationInfo = true, name, as, label = name, }) {
    const { register, formState: { errors }, } = (0, FormContext_1.useFormContext)();
    function makeLabel() {
        return label.charAt(0).toUpperCase() + label.slice(1);
    }
    return (react_1.default.createElement(react_bootstrap_1.Form.Group, { controlId: name, as: as },
        react_1.default.createElement(react_bootstrap_1.Form.Label, null, makeLabel()),
        react_1.default.createElement(react_bootstrap_1.Form.Control, { as: "select", isValid: showValidationInfo ? !(0, CommonComponentsController_1.hasError)(errors, name) : undefined, isInvalid: showValidationInfo ? (0, CommonComponentsController_1.hasError)(errors, name) : undefined, ...register(name) },
            react_1.default.createElement("option", { value: "" }, "-- Wybierz opcj\u0119 --"),
            options.map((option, index) => (react_1.default.createElement("option", { key: index, value: option }, option)))),
        react_1.default.createElement(ErrorMessage, { errors: errors, name: name })));
}
exports.SelectTextOptionFormElement = SelectTextOptionFormElement;
/**
 * Wyświetla pole do wprowadzania wartości w PLN
 * @param showValidationInfo czy wyświetlać informacje o błędzie walidacji (domyślnie true)
 * @param keyLabel nazwa pola w formularzu - zostanie wysłane na serwer jako składowa obiektu FormData (domyślnie 'value')
 */
function ValueInPLNInput({ showValidationInfo = true, name = "value" }) {
    const { control, setValue, watch, formState: { errors }, } = (0, FormContext_1.useFormContext)();
    const watchedValue = watch(name);
    (0, react_1.useEffect)(() => {
        setValue(name, watchedValue ?? "", { shouldValidate: true });
    }, [watchedValue, setValue]);
    const classNames = ["form-control"];
    if (showValidationInfo) {
        classNames.push((0, CommonComponentsController_1.hasError)(errors, name) ? "is-invalid" : "is-valid");
    }
    return (react_1.default.createElement(react_1.default.Fragment, null,
        react_1.default.createElement(react_bootstrap_1.InputGroup, { className: "mb-3" },
            react_1.default.createElement(react_hook_form_1.Controller, { control: control, name: name, render: ({ field }) => (react_1.default.createElement(react_number_format_1.NumericFormat, { ...field, value: watchedValue, thousandSeparator: " ", decimalSeparator: ".", decimalScale: 2, allowLeadingZeros: false, fixedDecimalScale: true, displayType: "input", allowNegative: false, onValueChange: (values) => {
                        setValue(name, values.floatValue);
                        //field.onChange(values.floatValue);
                    }, className: classNames.join(" "), valueIsNumericString: false })) }),
            react_1.default.createElement(react_bootstrap_1.InputGroup.Text, { id: "basic-addon1" }, "PLN")),
        react_1.default.createElement(ErrorMessage, { name: name, errors: errors })));
}
exports.ValueInPLNInput = ValueInPLNInput;
exports.valueValidation = Yup.string()
    .typeError("Wartość jest wymagana")
    .required("Wartość jest wymagana")
    .test("valueValidation", "Wartość musi być mniejsza od 9 999 999 999", function (value) {
    if (value === undefined)
        return false;
    const parsedValue = parseFloat(value.replace(/[^0-9.]/g, "").replace(",", "."));
    return parsedValue < 9999999999;
});
exports.DateRangeInput = (0, react_1.forwardRef)(({ showValidationInfo = true, fromName, toName, label, defaultFromValue, defaultToValue, ...colProps }, ref) => {
    const { control, setValue, watch, formState: { errors }, } = (0, FormContext_1.useFormContext)();
    const watchedFromValue = watch(fromName, defaultFromValue ?? "");
    const watchedToValue = watch(toName, defaultToValue ?? "");
    (0, react_1.useEffect)(() => {
        setValue(fromName, watchedFromValue ?? "", { shouldValidate: true });
        setValue(toName, watchedToValue ?? "", { shouldValidate: true });
    }, [watchedFromValue, watchedToValue, setValue]);
    const getClassName = (name) => {
        const classNames = ["form-control"];
        if (showValidationInfo) {
            classNames.push(hasError(errors, name) ? "is-invalid" : "is-valid");
        }
        return classNames.join(" ");
    };
    const hasError = (errors, name) => {
        return errors && errors[name];
    };
    return (react_1.default.createElement(react_bootstrap_1.Form.Group, { as: react_bootstrap_1.Col, ref: ref, ...colProps },
        react_1.default.createElement(react_bootstrap_1.Form.Label, null, label),
        react_1.default.createElement(react_bootstrap_1.InputGroup, null,
            react_1.default.createElement(react_bootstrap_1.InputGroup.Text, { id: "date-from-label" }, "Od"),
            react_1.default.createElement(react_hook_form_1.Controller, { control: control, name: fromName, render: ({ field }) => (react_1.default.createElement(react_bootstrap_1.Form.Control, { ...field, type: "date", value: watchedFromValue, onChange: (e) => setValue(fromName, e.target.value, { shouldValidate: true }), className: getClassName(fromName) })) }),
            react_1.default.createElement(react_bootstrap_1.InputGroup.Text, { id: "date-to-label" }, "Do"),
            react_1.default.createElement(react_hook_form_1.Controller, { control: control, name: toName, render: ({ field }) => (react_1.default.createElement(react_bootstrap_1.Form.Control, { ...field, type: "date", value: watchedToValue, onChange: (e) => setValue(toName, e.target.value, { shouldValidate: true }), className: getClassName(toName) })) })),
        react_1.default.createElement(ErrorMessage, { name: fromName, errors: errors }),
        react_1.default.createElement(ErrorMessage, { name: toName, errors: errors })));
});
function FileInput({ name, required = false, acceptedFileTypes = "", multiple = true }) {
    const { control, formState: { errors }, } = (0, FormContext_1.useFormContext)();
    return (react_1.default.createElement(react_1.default.Fragment, null,
        react_1.default.createElement(react_hook_form_1.Controller, { control: control, name: name, defaultValue: [], 
            //render={({ field: { onChange } }) => (
            render: ({ field: { value, onChange, ...field } }) => (react_1.default.createElement(react_bootstrap_1.Form.Control, { type: "file", value: value?.fileName, required: required, accept: acceptedFileTypes, isInvalid: !!errors[name], isValid: !errors[name], multiple: multiple, onChange: (event) => {
                    const files = event.target.files;
                    onChange(files);
                } })) }),
        react_1.default.createElement(ErrorMessage, { name: name, errors: errors })));
}
exports.FileInput = FileInput;
function RadioButtonGroup({ name, options }) {
    const { control } = (0, FormContext_1.useFormContext)();
    return (react_1.default.createElement(react_hook_form_1.Controller, { name: name, control: control, defaultValue: options[0].value, rules: { required: true }, render: ({ field }) => (react_1.default.createElement(react_bootstrap_1.ButtonGroup, null, options.map((radio, idx) => (react_1.default.createElement(react_bootstrap_1.ToggleButton, { key: idx, id: `radio-${idx}`, type: "radio", variant: "outline-secondary", name: "radio", value: radio.value, checked: field.value === radio.value, onChange: () => field.onChange(radio.value) }, radio.name))))) }));
}
exports.RadioButtonGroup = RadioButtonGroup;
