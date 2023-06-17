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
exports.FileInput = exports.FileInput1 = exports.valueValidation = exports.ValueInPLNInput = exports.CaseSelectMenuElement = exports.MyAsyncTypeahead = exports.ErrorMessage = exports.PersonSelectFormElement = exports.OurLetterTemplateSelectFormElement = exports.ContractTypeSelectFormElement = exports.ContractSelectFormElement = exports.InvoiceStatusSelectFormElement = exports.TaksStatusSelectFormElement = exports.ContractStatusSelectFormElement = exports.ProjectStatusSelectFormElement = exports.StatusSelectFormElement = exports.ProjectSelector = void 0;
const react_1 = __importStar(require("react"));
const react_bootstrap_1 = require("react-bootstrap");
const react_bootstrap_typeahead_1 = require("react-bootstrap-typeahead");
require("react-bootstrap-typeahead/css/Typeahead.css");
require("../../Css/styles.css");
const MainSetupReact_1 = __importDefault(require("../../React/MainSetupReact"));
const FormContext_1 = require("./FormContext");
const react_hook_form_1 = require("react-hook-form");
const react_number_format_1 = require("react-number-format");
const Yup = __importStar(require("yup"));
/**
 * Komponent formularza wyboru projektu
 * @param repository Repozytorium projektów
 * @param showValidationInfo Czy wyświetlać informacje o walidacji - domyślnie true
 * @param name nazwa pola w formularzu - zostanie wysłane na serwer jako składowa obiektu FormData
 */
function ProjectSelector({ name = '_parent', repository, showValidationInfo = true, disabled = false }) {
    const { formState: { errors } } = (0, FormContext_1.useFormContext)();
    return (react_1.default.createElement(react_1.default.Fragment, null,
        react_1.default.createElement(react_bootstrap_1.Form.Label, null, "Projekt"),
        react_1.default.createElement(MyAsyncTypeahead, { name: name, labelKey: "ourId", repository: repository, 
            //specialSerwerSearchActionRoute={'projects/' + MainSetup.currentUser.systemEmail}
            showValidationInfo: showValidationInfo, multiple: false })));
}
exports.ProjectSelector = ProjectSelector;
function StatusSelectFormElement({ statusNames, showValidationInfo = true, name = 'status' }) {
    const { register, formState: { errors } } = (0, FormContext_1.useFormContext)();
    return (react_1.default.createElement(react_bootstrap_1.Form.Group, { controlId: "status" },
        react_1.default.createElement(react_bootstrap_1.Form.Label, null, "Status"),
        react_1.default.createElement(react_bootstrap_1.Form.Control, { as: "select", isValid: showValidationInfo ? !errors[name] : undefined, isInvalid: showValidationInfo ? !!errors[name] : undefined, ...register(name) },
            react_1.default.createElement("option", { value: "" }, "-- Wybierz opcj\u0119 --"),
            statusNames.map((statusName, index) => (react_1.default.createElement("option", { key: index, value: statusName }, statusName)))),
        react_1.default.createElement(ErrorMessage, { errors: errors, name: name })));
}
exports.StatusSelectFormElement = StatusSelectFormElement;
;
function ProjectStatusSelectFormElement({ showValidationInfo = true, name }) {
    const statuses = Object.entries(MainSetupReact_1.default.ProjectStatuses).map(([key, value]) => value);
    return react_1.default.createElement(StatusSelectFormElement, { statusNames: statuses, showValidationInfo: showValidationInfo, name: name });
}
exports.ProjectStatusSelectFormElement = ProjectStatusSelectFormElement;
;
function ContractStatusSelectFormElement({ showValidationInfo = true, name }) {
    const statuses = Object.entries(MainSetupReact_1.default.ContractStatuses).map(([key, value]) => value);
    return react_1.default.createElement(StatusSelectFormElement, { statusNames: statuses, showValidationInfo: showValidationInfo, name: name });
}
exports.ContractStatusSelectFormElement = ContractStatusSelectFormElement;
;
function TaksStatusSelectFormElement({ showValidationInfo = true, name }) {
    let statuses = Object.entries(MainSetupReact_1.default.TaskStatuses).map(([key, value]) => value);
    return react_1.default.createElement(StatusSelectFormElement, { statusNames: statuses, showValidationInfo: showValidationInfo, name: name });
}
exports.TaksStatusSelectFormElement = TaksStatusSelectFormElement;
;
function InvoiceStatusSelectFormElement({ showValidationInfo = true, name }) {
    const statuses = Object.entries(MainSetupReact_1.default.InvoiceStatuses).map(([key, value]) => value);
    return react_1.default.createElement(StatusSelectFormElement, { statusNames: statuses, showValidationInfo: showValidationInfo, name: name });
}
exports.InvoiceStatusSelectFormElement = InvoiceStatusSelectFormElement;
;
function ContractSelectFormElement({ name = '_contract', showValidationInfo = true, multiple = false, repository, typesToInclude = 'all', _project, readOnly = false, }) {
    const { formState: { errors } } = (0, FormContext_1.useFormContext)();
    function makeContextSearchParams() {
        const params = [];
        params.push({ key: 'typesToInclude', value: typesToInclude });
        if (_project)
            params.push({ key: 'projectId', value: _project.ourId });
        return params;
    }
    return (react_1.default.createElement(react_1.default.Fragment, null,
        react_1.default.createElement(MyAsyncTypeahead, { name: name, labelKey: '_ourIdOrNumber_Name', searchKey: 'searchText', contextSearchParams: makeContextSearchParams(), repository: repository, renderMenuItemChildren: (option) => (react_1.default.createElement("div", null, option._ourIdOrNumber_Name)), multiple: multiple, showValidationInfo: showValidationInfo, readOnly: readOnly })));
}
exports.ContractSelectFormElement = ContractSelectFormElement;
/**
 * Komponent formularza wyboru typu kontraktu
 * @param name nazwa pola w formularzu - zostanie wysłane na serwer jako składowa obiektu FormData (domyślnie '_type')
 * @param typesToInclude 'our' | 'other' | 'all' - jakie typy kontraktów mają być wyświetlane (domyślnie 'all')
 * @param showValidationInfo czy pokazywać informacje o walidacji (domyślnie true)
 * @param required czy pole jest wymagane (walidacja) - domyślnie false
 */
function ContractTypeSelectFormElement({ typesToInclude = 'all', required = false, showValidationInfo = true, multiple = false, name = '_type', }) {
    const { control, watch, setValue, formState: { errors } } = (0, FormContext_1.useFormContext)();
    const label = 'Typ Kontraktu';
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
        const valueToBeSent = multiple ? selectedOptions : selectedOptions[0];
        setValue(name, valueToBeSent);
        field.onChange(valueToBeSent);
    }
    return (react_1.default.createElement(react_bootstrap_1.Form.Group, { controlId: label },
        react_1.default.createElement(react_bootstrap_1.Form.Label, null, label),
        react_1.default.createElement(react_1.default.Fragment, null,
            react_1.default.createElement(react_hook_form_1.Controller, { name: name, control: control, rules: { required: { value: required, message: 'Wybierz typ kontraktu' } }, render: ({ field }) => (react_1.default.createElement(react_bootstrap_typeahead_1.Typeahead, { id: `${label}-controlled`, labelKey: "name", multiple: multiple, options: makeoptions(repository.items), onChange: (items) => handleOnChange(items, field), selected: field.value ? multiple ? field.value : [field.value] : [], placeholder: "-- Wybierz typ --", isValid: showValidationInfo ? !(errors?.[name]) : undefined, isInvalid: showValidationInfo ? !!(errors?.[name]) : undefined, renderMenuItemChildren: (option, props, index) => {
                        const myOption = option;
                        return (react_1.default.createElement("div", null,
                            react_1.default.createElement("span", null, myOption.name),
                            react_1.default.createElement("div", { className: "text-muted small" }, myOption.description)));
                    } })) }),
            react_1.default.createElement(ErrorMessage, { errors: errors, name: name }))));
}
exports.ContractTypeSelectFormElement = ContractTypeSelectFormElement;
/**
 * Komponent formularza wyboru typu kontraktu
 * @param name nazwa pola w formularzu - zostanie wysłane na serwer jako składowa obiektu FormData (domyślnie '_type')
 * @param typesToInclude 'our' | 'other' | 'all' - jakie typy kontraktów mają być wyświetlane (domyślnie 'all')
 * @param showValidationInfo czy pokazywać informacje o walidacji (domyślnie true)
 * @param required czy pole jest wymagane (walidacja) - domyślnie false
 */
function OurLetterTemplateSelectFormElement({ showValidationInfo = true, _cases = [], }) {
    const { control, watch, setValue, formState: { errors } } = (0, FormContext_1.useFormContext)();
    const name = '_template';
    const label = 'Szablon pisma';
    const repository = MainSetupReact_1.default.documentTemplatesRepository;
    function makeoptions(templates) {
        const filteredTemplates = templates.filter((template) => {
            return !template._contents.caseTypeId || _cases.some((caseItem) => caseItem._type._id === template._contents.caseTypeId);
        });
        return filteredTemplates;
    }
    function handleOnChange(selectedOptions, field) {
        const valueToBeSent = selectedOptions[0];
        setValue(name, valueToBeSent);
        field.onChange(valueToBeSent);
    }
    return (react_1.default.createElement(react_bootstrap_1.Form.Group, { controlId: label },
        react_1.default.createElement(react_bootstrap_1.Form.Label, null, label),
        react_1.default.createElement(react_1.default.Fragment, null,
            react_1.default.createElement(react_hook_form_1.Controller, { name: name, control: control, render: ({ field }) => (react_1.default.createElement(react_bootstrap_typeahead_1.Typeahead, { id: `${label}-controlled`, labelKey: "name", multiple: false, options: makeoptions(repository.items), onChange: (items) => handleOnChange(items, field), selected: field.value ? [field.value] : [], placeholder: "-- Wybierz szablon --", isValid: showValidationInfo ? !(errors?.[name]) : undefined, isInvalid: showValidationInfo ? !!(errors?.[name]) : undefined, renderMenuItemChildren: (option, props, index) => {
                        const myOption = option;
                        return (react_1.default.createElement("div", null,
                            react_1.default.createElement("span", null, myOption._nameContentsAlias),
                            react_1.default.createElement("div", { className: "text-muted small" }, myOption.description)));
                    } })) }),
            react_1.default.createElement(ErrorMessage, { errors: errors, name: name }))));
}
exports.OurLetterTemplateSelectFormElement = OurLetterTemplateSelectFormElement;
/**
 * Komponent formularza wyboru osoby
 * @param label oznaczenie pola formularza
 * @param name nazwa pola w formularzu - zostanie wysłane na serwer jako składowa obiektu FormData
 */
function PersonSelectFormElement({ label, name, repository, multiple = false, showValidationInfo = true, }) {
    const { control, setValue, watch, formState: { errors } } = (0, FormContext_1.useFormContext)();
    function makeoptions(repositoryDataItems) {
        repositoryDataItems.map(item => item._nameSurname = `${item.name} ${item.surname}`);
        return repositoryDataItems;
    }
    function handleOnChange(selectedOptions, field) {
        const valueToBeSent = multiple ? selectedOptions : selectedOptions[0];
        setValue(name, valueToBeSent);
        field.onChange(valueToBeSent);
    }
    function handleSelected(field) {
        const currentValue = (field.value ? multiple ? field.value : [field.value] : []);
        return makeoptions(currentValue);
    }
    return (react_1.default.createElement(react_1.default.Fragment, null,
        react_1.default.createElement(react_bootstrap_1.Form.Label, null, label),
        react_1.default.createElement(react_hook_form_1.Controller, { name: name, control: control, render: ({ field }) => (react_1.default.createElement(react_bootstrap_typeahead_1.Typeahead, { id: `${label}-controlled`, labelKey: "_nameSurname", options: makeoptions(repository.items), onChange: (items) => handleOnChange(items, field), selected: handleSelected(field), placeholder: "-- Wybierz osob\u0119 --", multiple: multiple, isValid: showValidationInfo ? !(errors?.[name]) : undefined, isInvalid: showValidationInfo ? !!(errors?.[name]) : undefined })) }),
        react_1.default.createElement(ErrorMessage, { errors: errors, name: name })));
}
exports.PersonSelectFormElement = PersonSelectFormElement;
function ErrorMessage({ errors, name }) {
    return (react_1.default.createElement(react_1.default.Fragment, null, errors[name] && (react_1.default.createElement(react_bootstrap_1.Form.Text, { className: "text-danger" }, errors[name]?.message))));
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
function MyAsyncTypeahead({ name, repository, labelKey, searchKey = labelKey, contextSearchParams = [], specialSerwerSearchActionRoute, renderMenuItemChildren = (option) => react_1.default.createElement(react_1.default.Fragment, null, option[labelKey]), renderMenu, multiple = false, showValidationInfo = true, readOnly = false }) {
    const { register, control, setValue, formState: { errors } } = (0, FormContext_1.useFormContext)();
    const [isLoading, setIsLoading] = (0, react_1.useState)(false);
    const [options, setOptions] = (0, react_1.useState)([]);
    function handleSearch(query) {
        setIsLoading(true);
        const formData = new FormData();
        formData.append(searchKey, query);
        contextSearchParams.forEach(param => formData.append(param.key, param.value));
        repository.loadItemsFromServer(formData, specialSerwerSearchActionRoute)
            .then((items) => {
            setOptions(items);
            setIsLoading(false);
        });
    }
    // Bypass client-side filtering by returning `true`. Results are already
    // filtered by the search endpoint, so no need to do it again.
    const filterBy = () => true;
    function handleOnChange(selectedOptions, field) {
        const valueToBeSent = multiple ? selectedOptions : selectedOptions[0];
        setValue(name, valueToBeSent);
        field.onChange(valueToBeSent);
        if (readOnly)
            setValue(name, valueToBeSent);
    }
    return (react_1.default.createElement(react_1.default.Fragment, null,
        react_1.default.createElement(react_hook_form_1.Controller, { name: name, control: control, render: ({ field }) => (react_1.default.createElement(react_bootstrap_typeahead_1.AsyncTypeahead, { renderMenu: renderMenu ? renderMenu : undefined, filterBy: filterBy, id: "async-example", isLoading: isLoading, labelKey: labelKey, minLength: 2, onSearch: handleSearch, options: options, onChange: (items) => handleOnChange(items, field), onBlur: field.onBlur, selected: field.value ? multiple ? field.value : [field.value] : [], multiple: multiple, newSelectionPrefix: "Dodaj nowy: ", placeholder: "-- Wybierz opcj\u0119 --", renderMenuItemChildren: renderMenuItemChildren, isValid: showValidationInfo ? !(errors?.[name]) : undefined, isInvalid: showValidationInfo ? !!(errors?.[name]) : undefined })) }),
        react_1.default.createElement(ErrorMessage, { errors: errors, name: name }),
        readOnly && (react_1.default.createElement("input", { type: "hidden", ...register(name) }))));
}
exports.MyAsyncTypeahead = MyAsyncTypeahead;
;
function groupByMilestone(cases) {
    return cases.reduce((groups, item) => {
        if (!groups[item._parent._FolderNumber_TypeName_Name]) {
            groups[item._parent._FolderNumber_TypeName_Name] = [];
        }
        groups[item._parent._FolderNumber_TypeName_Name].push(item);
        return groups;
    }, {});
}
function renderCaseMenu(results, menuProps, state, groupedResults, milestoneNames) {
    let index = 0;
    const items = milestoneNames.map((milestoneName) => (react_1.default.createElement(react_1.Fragment, { key: milestoneName },
        index !== 0 && react_1.default.createElement(react_bootstrap_typeahead_1.Menu.Divider, null),
        react_1.default.createElement(react_bootstrap_typeahead_1.Menu.Header, null, milestoneName),
        groupedResults[milestoneName].map((item) => {
            const menuItem = (react_1.default.createElement(react_bootstrap_typeahead_1.MenuItem, { key: index, option: item, position: index },
                item._type.folderNumber,
                " ",
                item._type.name,
                " ",
                item._folderName));
            index += 1;
            return menuItem;
        }))));
    return react_1.default.createElement(react_bootstrap_typeahead_1.Menu, { ...menuProps }, items);
}
/**
 * Pole wyboru sprawy z repozytorium pogrupowane po Milestonach
 * @param name nazwa pola formularza (musi być zgodna z nazwą pola w obiekcie)
 * @param repository repozytorium z którego pobierane są dane
 * @param labelKey nazwa pola w obiekcie które ma być wyświetlane w polu wyboru
 * @param searchKey nazwa pola w obiekcie które ma być wyszukiwane (domyślnie labelKey)
 * @param contextSearchParams parametry wyszukiwania które mają być wysyłane do serwera (np. parametry kontekstowe)
 * @param specialSerwerSearchActionRoute nazwa akcji wyszukiwania na serwerze (domyślnie search)
 * @param renderMenuItemChildren funkcja renderująca elementy menu
 * @param renderMenu funkcja renderująca menu
 * @param multiple czy można wybrać wiele opcji
 * @param required czy pole jest wymagane
 * @param showValidationInfo czy wyświetlać informacje o błędzie walidacji
 * @param readOnly czy pole jest tylko do odczytu
 */
function CaseSelectMenuElement({ name = '_case', readonly = false, _project, _contract, _milestone, repository, showValidationInfo = true }) {
    function makeContextSearchParams() {
        const contextSearchParams = [];
        if (_project)
            contextSearchParams.push({ key: 'projectId', value: _project?.ourId });
        if (_contract)
            contextSearchParams.push({ key: 'contractId', value: _contract.id.toString() });
        if (_milestone)
            contextSearchParams.push({ key: 'milestoneId', value: _milestone?.ourId });
        return contextSearchParams;
    }
    return react_1.default.createElement(MyAsyncTypeahead, { contextSearchParams: makeContextSearchParams(), name: name, repository: repository, labelKey: '_typeFolderNumber_TypeName_Number_Name', searchKey: 'searchText', renderMenu: (results, menuProps, state) => {
            const groupedResults = groupByMilestone(results);
            const milestoneNames = Object.keys(groupedResults).sort();
            return renderCaseMenu(results, menuProps, state, groupedResults, milestoneNames);
        }, multiple: true, readOnly: readonly, showValidationInfo: showValidationInfo });
}
exports.CaseSelectMenuElement = CaseSelectMenuElement;
/**
 * Wyświetla pole do wprowadzania wartości w PLN
 * @param showValidationInfo czy wyświetlać informacje o błędzie walidacji (domyślnie true)
 * @param keyLabel nazwa pola w formularzu - zostanie wysłane na serwer jako składowa obiektu FormData (domyślnie 'value')
 */
function ValueInPLNInput({ showValidationInfo = true, keyLabel = 'value', }) {
    const { control, setValue, watch, formState: { errors } } = (0, FormContext_1.useFormContext)();
    const watchedValue = watch(keyLabel);
    (0, react_1.useEffect)(() => {
        if (watchedValue !== undefined) {
            setValue(keyLabel, watchedValue, { shouldValidate: true });
        }
        else {
            setValue(keyLabel, '', { shouldValidate: true });
        }
    }, [watchedValue, setValue]);
    const classNames = ['form-control'];
    if (showValidationInfo) {
        classNames.push(errors.value ? 'is-invalid' : 'is-valid');
    }
    return (react_1.default.createElement(react_1.default.Fragment, null,
        react_1.default.createElement(react_bootstrap_1.InputGroup, { className: "mb-3" },
            react_1.default.createElement(react_hook_form_1.Controller, { control: control, name: keyLabel, render: ({ field }) => (react_1.default.createElement(react_number_format_1.NumericFormat, { ...field, value: watchedValue, thousandSeparator: " ", decimalSeparator: ".", decimalScale: 2, allowLeadingZeros: false, fixedDecimalScale: true, displayType: "input", allowNegative: false, onValueChange: (values) => {
                        console.log('values: ', values);
                        setValue(keyLabel, values.floatValue);
                        //field.onChange(values.floatValue);
                    }, className: classNames.join(" "), valueIsNumericString: false })) }),
            react_1.default.createElement(react_bootstrap_1.InputGroup.Text, { id: "basic-addon1" }, "PLN")),
        react_1.default.createElement(ErrorMessage, { name: keyLabel, errors: errors })));
}
exports.ValueInPLNInput = ValueInPLNInput;
exports.valueValidation = Yup.string()
    .typeError('Wartość jest wymagana')
    .required('Wartość jest wymagana')
    .test('valueValidation', 'Wartość musi być mniejsza od 9 999 999 999', function (value) {
    if (value === undefined)
        return false;
    const parsedValue = parseFloat(value.replace(/[^0-9.]/g, '').replace(',', '.'));
    return parsedValue < 9999999999;
});
/**Pole dodawania plików
 * @param name nazwa pola w formularzu
 * @param required czy pole jest wymagane
 * @param acceptedFileTypes typy plików dozwolone do dodania np. "image/*" lub
 * "image/png, image/jpeg, application/msword, application/vnd.ms-excel, application/pdf"
 */
function FileInput1({ name, required = false, acceptedFileTypes = '', multiple = true }) {
    const { register, watch, setValue, formState: { errors } } = (0, FormContext_1.useFormContext)();
    return (react_1.default.createElement(react_1.default.Fragment, null,
        react_1.default.createElement(react_bootstrap_1.Form.Control, { ...register(name), type: "file", required: required, accept: acceptedFileTypes, isInvalid: !!errors[name], isValid: !errors[name], multiple: multiple }),
        react_1.default.createElement(ErrorMessage, { name: name, errors: errors })));
}
exports.FileInput1 = FileInput1;
function FileInput({ name, required = false, acceptedFileTypes = '', multiple = true }) {
    const { control, formState: { errors } } = (0, FormContext_1.useFormContext)();
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
