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
exports.ConfirmModal = exports.SpinnerBootstrap = exports.ProgressBar = exports.FileInput = exports.ValueInPLNInput = exports.handleEditMyAsyncTypeaheadElement = exports.MyAsyncTypeahead = exports.PersonSelectFormElement = exports.ContractTypeSelectFormElement = exports.ContractStatus = void 0;
const react_1 = __importStar(require("react"));
const react_bootstrap_1 = require("react-bootstrap");
const react_bootstrap_typeahead_1 = require("react-bootstrap-typeahead");
require("react-bootstrap-typeahead/css/Typeahead.css");
const MainSetupReact_1 = __importDefault(require("../../React/MainSetupReact"));
const FormContext_1 = require("../FormContext");
const react_hook_form_1 = require("react-hook-form");
const ContractsController_1 = __importDefault(require("../../Contracts/ContractsList/ContractsController"));
const react_number_format_1 = require("react-number-format");
function ContractStatus({ required = false, showValidationInfo = true }) {
    const { register, formState: { errors } } = (0, FormContext_1.useFormContext)();
    return (react_1.default.createElement(react_bootstrap_1.Form.Group, { controlId: "status" },
        react_1.default.createElement(react_bootstrap_1.Form.Label, null, "Status"),
        react_1.default.createElement(react_bootstrap_1.Form.Control, { as: "select", isValid: showValidationInfo ? !errors?.status : undefined, isInvalid: showValidationInfo ? !!errors?.status : undefined, ...register('status', {
                required: { value: required, message: 'Pole jest wymagane' },
            }) },
            react_1.default.createElement("option", { value: "" }, "-- Wybierz opcj\u0119 --"),
            ContractsController_1.default.statusNames.map((statusName, index) => (react_1.default.createElement("option", { key: index, value: statusName }, statusName)))),
        errors?.status && (react_1.default.createElement(react_bootstrap_1.Form.Text, { className: "text-danger" }, errors.status.message))));
}
exports.ContractStatus = ContractStatus;
;
function ContractTypeSelectFormElement({ typesToInclude = 'all', required = false, showValidationInfo = true, }) {
    const { control, watch, setValue, formState: { errors } } = (0, FormContext_1.useFormContext)();
    const label = 'Typ Kontraktu';
    const name = '_contractType';
    const repository = MainSetupReact_1.default.contractTypesRepository;
    function makeoptions(repositoryDataItems) {
        const filteredItems = repositoryDataItems.filter((item) => {
            if (typesToInclude === 'all')
                return true;
            if (typesToInclude === 'our' && item.isOur)
                return true;
            if (typesToInclude === 'other' && !item.isOur)
                return true;
            return false;
        });
        return filteredItems;
    }
    function handleOnChange(selectedOptions, field) {
        setValue(name, selectedOptions);
        field.onChange(selectedOptions);
    }
    return (react_1.default.createElement(react_bootstrap_1.Form.Group, { controlId: label },
        react_1.default.createElement(react_bootstrap_1.Form.Label, null, label),
        react_1.default.createElement(react_1.default.Fragment, null,
            react_1.default.createElement(react_hook_form_1.Controller, { name: name, control: control, rules: { required: { value: required, message: 'Wybierz typ kontraktu' } }, 
                //defaultValue={makeoptions(selectedRepositoryItems || [])}
                render: ({ field }) => (react_1.default.createElement(react_bootstrap_typeahead_1.Typeahead, { id: `${label}-controlled`, labelKey: "name", options: makeoptions(repository.items), onChange: (items) => handleOnChange(items, field), selected: field.value, placeholder: "-- Wybierz typ --", isValid: showValidationInfo ? !(errors?.[name]) : undefined, isInvalid: showValidationInfo ? !!(errors?.[name]) : undefined, renderMenuItemChildren: (option, props, index) => {
                        const myOption = option;
                        return (react_1.default.createElement("div", null,
                            react_1.default.createElement("span", null, myOption.name),
                            react_1.default.createElement("div", { className: "text-muted small" }, myOption.description)));
                    } })) }),
            errors?.[name] && (react_1.default.createElement(react_bootstrap_1.Form.Text, { className: "text-danger" }, errors?.[name].message)))));
}
exports.ContractTypeSelectFormElement = ContractTypeSelectFormElement;
function PersonSelectFormElement({ label, name, repository, multiple, showValidationInfo = true, required = false }) {
    const { control, setValue, formState: { errors } } = (0, FormContext_1.useFormContext)();
    function makeoptions(repositoryDataItems) {
        repositoryDataItems.map(item => item._nameSurname = `${item.name} ${item.surname}`);
        return repositoryDataItems;
    }
    function handleOnChange(selectedOptions, field) {
        setValue(name, selectedOptions);
        field.onChange(selectedOptions);
    }
    return (react_1.default.createElement(react_bootstrap_1.Form.Group, { controlId: label },
        react_1.default.createElement(react_bootstrap_1.Form.Label, null, label),
        react_1.default.createElement(react_hook_form_1.Controller, { name: name, control: control, rules: { required: { value: required, message: `${name} musi być wybrany` } }, render: ({ field }) => (react_1.default.createElement(react_bootstrap_typeahead_1.Typeahead, { id: `${label}-controlled`, labelKey: "_nameSurname", options: makeoptions(repository.items), onChange: (items) => handleOnChange(items, field), selected: field.value, placeholder: "-- Wybierz osob\u0119 --", multiple: multiple, isValid: showValidationInfo ? !(errors?.[name]) : undefined, isInvalid: showValidationInfo ? !!(errors?.[name]) : undefined })) }),
        errors?.[name] && (react_1.default.createElement(react_bootstrap_1.Form.Text, { className: "text-danger" }, errors[name]?.message))));
}
exports.PersonSelectFormElement = PersonSelectFormElement;
/**
 * @param name nazwa pola w formularzu - zostanie wysłane na serwer jako składowa obiektu FormData
 * @param repository repozytorium z którego pobierane są dane
 * @param labelKey nazwa pola w repozytorium które ma być wyświetlane w polu wyboru
 * @param searchKey nazwa pola w repozytorium które ma być wyszukiwane po stronie serwera (sprawdź odpowiedni controller) domyślnie jest równe labelKey
 * @param specialSerwerSearchActionRoute nazwa nietypowego route na serwerze która ma być wywołana zamiast standardowego z RepositoryReact
 * @param multiple czy pole wyboru ma być wielokrotnego wyboru
 * @param renderMenuItemChildren funkcja renderująca elementy listy wyboru (domyślnie wyświetla tylko labelKey)
*/
function MyAsyncTypeahead({ name, repository, labelKey, searchKey = labelKey, contextSearchParams = [], specialSerwerSearchActionRoute, renderMenuItemChildren = (option) => react_1.default.createElement(react_1.default.Fragment, null, option[labelKey]), multiple = false, isRequired = false }) {
    const { control, setValue, formState: { errors } } = (0, FormContext_1.useFormContext)();
    const [isLoading, setIsLoading] = (0, react_1.useState)(false);
    const [options, setOptions] = (0, react_1.useState)([]);
    function handleSearch(query) {
        setIsLoading(true);
        const formData = new FormData();
        formData.append(searchKey, query);
        contextSearchParams.forEach(param => formData.append(param.key, param.value));
        repository.loadItemsfromServer(formData, specialSerwerSearchActionRoute)
            .then((items) => {
            setOptions(items);
            setIsLoading(false);
        });
    }
    // Bypass client-side filtering by returning `true`. Results are already
    // filtered by the search endpoint, so no need to do it again.
    const filterBy = () => true;
    function handleOnChange(selectedOptions, field) {
        setValue(name, selectedOptions);
        field.onChange(selectedOptions);
    }
    return (react_1.default.createElement(react_hook_form_1.Controller, { name: name, control: control, rules: { required: { value: isRequired, message: `${name} musi być wybrany` } }, render: ({ field }) => (react_1.default.createElement(react_bootstrap_typeahead_1.AsyncTypeahead, { filterBy: filterBy, id: "async-example", isLoading: isLoading, labelKey: labelKey, minLength: 3, onSearch: handleSearch, options: options, onChange: (items) => handleOnChange(items, field), onBlur: field.onBlur, selected: field.value ? field.value : [], multiple: multiple, newSelectionPrefix: "Dodaj nowy: ", placeholder: "-- Wybierz opcj\u0119 --", renderMenuItemChildren: renderMenuItemChildren, isValid: isRequired && field.value && field.value.length > 0, isInvalid: isRequired && (!field.value || field.value.length === 0) })) }));
}
exports.MyAsyncTypeahead = MyAsyncTypeahead;
;
function handleEditMyAsyncTypeaheadElement(currentSelectedDataItems, previousSelectedItems, setSuperiorElementState) {
    const currentAndPreviousSelections = previousSelectedItems.concat(currentSelectedDataItems);
    const allUniqueDataItems = currentAndPreviousSelections.reduce((uniqueItems, dataItem) => {
        const isDuplicate = uniqueItems.some(item => item.id === dataItem.id);
        if (!isDuplicate) {
            uniqueItems.push(dataItem);
        }
        return uniqueItems;
    }, []);
    const finalItemsSelected = (currentSelectedDataItems.length < allUniqueDataItems.length) ? currentSelectedDataItems : allUniqueDataItems;
    setSuperiorElementState(finalItemsSelected);
    console.log('handleEditMyAsyncTypeaheadElement:: ', finalItemsSelected);
}
exports.handleEditMyAsyncTypeaheadElement = handleEditMyAsyncTypeaheadElement;
/**
 * Wyświetla pole do wprowadzania wartości w PLN
 * @param required czy pole jest wymagane
 * @param showValidationInfo czy wyświetlać informacje o błędzie walidacji
 * @param keyLabel nazwa pola w formularzu - zostanie wysłane na serwer jako składowa obiektu FormData
 */
function ValueInPLNInput({ required = false, showValidationInfo = true, keyLabel = 'value', }) {
    const { register, control, setValue, watch, formState: { errors } } = (0, FormContext_1.useFormContext)();
    const watchedValue = watch(keyLabel);
    let ref = (0, react_1.useRef)();
    function handleValueChange(values) {
        setValue(keyLabel, values.floatValue);
    }
    const classNames = ['form-control'];
    if (showValidationInfo) {
        if (errors.value) {
            classNames.push('is-invalid');
        }
        else {
            classNames.push('is-valid');
        }
    }
    return (react_1.default.createElement(react_1.default.Fragment, null,
        react_1.default.createElement(react_bootstrap_1.InputGroup, { className: "mb-3" },
            react_1.default.createElement(react_hook_form_1.Controller, { control: control, name: keyLabel, rules: {
                    required: {
                        value: required,
                        message: "Podaj wartość! Jeśli jej nie znasz to wpisz zero",
                    },
                    max: { value: 9999999999, message: "Zbyt duża liczba" },
                }, render: ({ field }) => (react_1.default.createElement(react_number_format_1.NumericFormat, { ...field, getInputRef: ref, value: watchedValue, thousandSeparator: " ", decimalSeparator: ",", decimalScale: 2, fixedDecimalScale: true, displayType: "input", allowNegative: false, onValueChange: handleValueChange, className: classNames.join(" "), valueIsNumericString: true })) }),
            react_1.default.createElement(react_bootstrap_1.InputGroup.Text, { id: "basic-addon1" }, "PLN")),
        errors?.value && (react_1.default.createElement(react_bootstrap_1.Form.Text, { className: "text-danger" }, errors.value?.message))));
}
exports.ValueInPLNInput = ValueInPLNInput;
/**Pole dodawania plików
 * @param fieldName nazwa pola w formularzu
 * @param isRequired czy pole jest wymagane
 * @param acceptedFileTypes typy plików dozwolone do dodania np. "image/*" lub
 * "image/png, image/jpeg, application/msword, application/vnd.ms-excel, application/pdf"
 */
function FileInput({ fieldName, isRequired = false, acceptedFileTypes = '', }) {
    const [file, setFile] = (0, react_1.useState)(null);
    const handleFileChange = (event) => {
        const selectedFile = event.target.files && event.target.files[0];
        if (selectedFile) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setFile(selectedFile);
            };
            reader.readAsDataURL(selectedFile);
        }
    };
    return (react_1.default.createElement(react_bootstrap_1.Form.Group, null,
        react_1.default.createElement(react_bootstrap_1.Form.Label, null, "Wybierz plik"),
        react_1.default.createElement(react_bootstrap_1.Form.Control, { type: "file", name: fieldName, onChange: handleFileChange, required: isRequired, accept: acceptedFileTypes })));
}
exports.FileInput = FileInput;
function ProgressBar() {
    return (react_1.default.createElement("progress", { style: { height: "5px" } }));
}
exports.ProgressBar = ProgressBar;
function SpinnerBootstrap() {
    return (react_1.default.createElement(react_bootstrap_1.Spinner, { animation: "border", variant: "success" }));
}
exports.SpinnerBootstrap = SpinnerBootstrap;
const AlertComponent = ({ message, type, timeout = 3000 }) => {
    const [show, setShow] = (0, react_1.useState)(true);
    (0, react_1.useEffect)(() => {
        const timer = setTimeout(() => {
            setShow(false);
        }, timeout);
        return () => {
            clearTimeout(timer);
        };
    }, [timeout]);
    if (!show) {
        return null;
    }
    return (react_1.default.createElement(react_bootstrap_1.Alert, { variant: type, onClose: () => setShow(false), dismissible: true }, message));
};
function ConfirmModal({ show, onClose, title, prompt, onConfirm }) {
    const [isWaiting, setIsWaiting] = (0, react_1.useState)(false);
    const [isError, setIsError] = (0, react_1.useState)(false);
    const [errorMessage, setErrorMessage] = (0, react_1.useState)('');
    async function handleConfirmAndClose() {
        setIsWaiting(true);
        try {
            await onConfirm();
        }
        catch (e) {
            if (e instanceof Error) {
                setIsError(true);
                setErrorMessage(e.message);
            }
            console.log(e);
        }
        setIsWaiting(false);
        onClose();
    }
    return (react_1.default.createElement(react_bootstrap_1.Modal, { show: show, onHide: onClose },
        react_1.default.createElement(react_bootstrap_1.Modal.Header, { closeButton: true },
            react_1.default.createElement(react_bootstrap_1.Modal.Title, null, title)),
        react_1.default.createElement(react_bootstrap_1.Modal.Body, null, prompt),
        react_1.default.createElement(react_bootstrap_1.Modal.Footer, null,
            react_1.default.createElement(react_bootstrap_1.Button, { variant: "secondary", onClick: onClose }, "Anuluj"),
            react_1.default.createElement(react_bootstrap_1.Button, { variant: "primary", onClick: handleConfirmAndClose },
                "Ok",
                isWaiting && react_1.default.createElement(react_bootstrap_1.Spinner, { as: "span", animation: "grow", size: "sm", role: "status", "aria-hidden": "true" })),
            isError && (react_1.default.createElement(AlertComponent, { message: errorMessage, type: 'danger', timeout: 5000 })))));
}
exports.ConfirmModal = ConfirmModal;
