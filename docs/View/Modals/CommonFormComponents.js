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
exports.RadioButtonGroup = exports.FileInput = exports.valueValidation = exports.ValueInPLNInput = exports.CaseSelectMenuElement = exports.MyAsyncTypeahead = exports.ErrorMessage = exports.PersonSelectFormElement = exports.OurLetterTemplateSelectFormElement = exports.CaseTypeSelectFormElement = exports.ContractTypeSelectFormElement = exports.ContractSelectFormElement = exports.FocusAreaSelector = exports.FinancialAidProgrammeSelector = exports.OfferSelectFormElement = exports.CitySelectFormElement = exports.InvoiceStatusSelectFormElement = exports.TaksStatusSelectFormElement = exports.OfferFormSelectFormElement = exports.OfferBidProcedureSelectFormElement = exports.OfferStatusSelectFormElement = exports.SecurityStatusSelectFormElement = exports.ContractStatusSelectFormElement = exports.ProjectStatusSelectFormElement = exports.SelectTextOptionFormElement = exports.ProjectSelector = void 0;
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
const ContractsController_1 = require("../../Contracts/ContractsList/ContractsController");
/**
 * Komponent formularza wyboru projektu
 * @param repository Repozytorium projektów
 * @param showValidationInfo Czy wyświetlać informacje o walidacji - domyślnie true
 * @param name nazwa pola w formularzu - zostanie wysłane na serwer jako składowa obiektu FormData
 */
function ProjectSelector({ name = "_project", repository, showValidationInfo = true, disabled = false, }) {
    const { formState: { errors }, } = (0, FormContext_1.useFormContext)();
    function renderOption(option) {
        const city = option;
        return (react_1.default.createElement("div", null,
            react_1.default.createElement("span", null, city.ourId),
            react_1.default.createElement("div", { className: "text-muted small" }, city.alias)));
    }
    return (react_1.default.createElement(react_1.default.Fragment, null,
        react_1.default.createElement(react_bootstrap_1.Form.Label, null, "Projekt"),
        react_1.default.createElement(MyAsyncTypeahead, { name: name, labelKey: "ourId", repository: repository, 
            //specialSerwerSearchActionRoute={'projects/' + MainSetup.currentUser.systemEmail}
            showValidationInfo: showValidationInfo, renderMenuItemChildren: renderOption, multiple: false })));
}
exports.ProjectSelector = ProjectSelector;
function SelectTextOptionFormElement({ options, showValidationInfo = true, name, as, label = name, }) {
    const { register, formState: { errors }, } = (0, FormContext_1.useFormContext)();
    function makeLabel() {
        return label.charAt(0).toUpperCase() + label.slice(1);
    }
    return (react_1.default.createElement(react_bootstrap_1.Form.Group, { controlId: name, as: as },
        react_1.default.createElement(react_bootstrap_1.Form.Label, null, makeLabel()),
        react_1.default.createElement(react_bootstrap_1.Form.Control, { as: "select", isValid: showValidationInfo ? !errors[name] : undefined, isInvalid: showValidationInfo ? !!errors[name] : undefined, ...register(name) },
            react_1.default.createElement("option", { value: "" }, "-- Wybierz opcj\u0119 --"),
            options.map((option, index) => (react_1.default.createElement("option", { key: index, value: option }, option)))),
        react_1.default.createElement(ErrorMessage, { errors: errors, name: name })));
}
exports.SelectTextOptionFormElement = SelectTextOptionFormElement;
function ProjectStatusSelectFormElement({ showValidationInfo = true, name = "status", as, }) {
    const statuses = Object.entries(MainSetupReact_1.default.ProjectStatuses).map(([key, value]) => value);
    return (react_1.default.createElement(SelectTextOptionFormElement, { options: statuses, showValidationInfo: showValidationInfo, name: name, as: as }));
}
exports.ProjectStatusSelectFormElement = ProjectStatusSelectFormElement;
function ContractStatusSelectFormElement({ showValidationInfo = true, name = "status", as, }) {
    const statuses = Object.entries(MainSetupReact_1.default.ContractStatuses).map(([key, value]) => value);
    return (react_1.default.createElement(SelectTextOptionFormElement, { options: statuses, showValidationInfo: showValidationInfo, name: name, as: as }));
}
exports.ContractStatusSelectFormElement = ContractStatusSelectFormElement;
function SecurityStatusSelectFormElement({ showValidationInfo = true, name = "status", as, }) {
    const statuses = Object.entries(MainSetupReact_1.default.SecurityStatus).map(([key, value]) => value);
    return (react_1.default.createElement(SelectTextOptionFormElement, { options: statuses, showValidationInfo: showValidationInfo, name: name, as: as }));
}
exports.SecurityStatusSelectFormElement = SecurityStatusSelectFormElement;
function OfferStatusSelectFormElement({ showValidationInfo = true, name = "status", as, }) {
    const statuses = Object.entries(MainSetupReact_1.default.OfferStatus).map(([key, value]) => value);
    return (react_1.default.createElement(SelectTextOptionFormElement, { options: statuses, showValidationInfo: showValidationInfo, name: name, as: as }));
}
exports.OfferStatusSelectFormElement = OfferStatusSelectFormElement;
function OfferBidProcedureSelectFormElement({ showValidationInfo = true, name = "bidProcedure", as, }) {
    const options = Object.entries(MainSetupReact_1.default.OfferBidProcedure).map(([key, value]) => value);
    return (react_1.default.createElement(SelectTextOptionFormElement, { options: options, showValidationInfo: showValidationInfo, name: name, as: as, label: "Procedura" }));
}
exports.OfferBidProcedureSelectFormElement = OfferBidProcedureSelectFormElement;
function OfferFormSelectFormElement({ showValidationInfo = true, name = "form", as }) {
    const options = Object.entries(MainSetupReact_1.default.OfferForm).map(([key, value]) => value);
    return (react_1.default.createElement(SelectTextOptionFormElement, { options: options, showValidationInfo: showValidationInfo, name: name, as: as, label: "Forma wysy\u0142ki" }));
}
exports.OfferFormSelectFormElement = OfferFormSelectFormElement;
function TaksStatusSelectFormElement({ showValidationInfo = true, name = "status", as, }) {
    let statuses = Object.entries(MainSetupReact_1.default.TaskStatus).map(([key, value]) => value);
    return (react_1.default.createElement(SelectTextOptionFormElement, { options: statuses, showValidationInfo: showValidationInfo, name: name, as: as }));
}
exports.TaksStatusSelectFormElement = TaksStatusSelectFormElement;
function InvoiceStatusSelectFormElement({ showValidationInfo = true, name = "status", as, }) {
    const statuses = Object.entries(MainSetupReact_1.default.InvoiceStatuses).map(([key, value]) => value);
    return (react_1.default.createElement(SelectTextOptionFormElement, { options: statuses, showValidationInfo: showValidationInfo, name: name, as: as }));
}
exports.InvoiceStatusSelectFormElement = InvoiceStatusSelectFormElement;
function CitySelectFormElement({ name = "_city", showValidationInfo = true, multiple = false, repository, allowNew = false, }) {
    const { formState: { errors }, } = (0, FormContext_1.useFormContext)();
    function renderOption(option) {
        //console.log("renderOption - Option: ", option); // Log the option being rendered
        return (react_1.default.createElement("div", null,
            react_1.default.createElement("span", null, option.name),
            react_1.default.createElement("div", { className: "text-muted small" }, option.code)));
    }
    return (react_1.default.createElement(react_1.default.Fragment, null,
        react_1.default.createElement(MyAsyncTypeahead, { name: name, labelKey: "name", searchKey: "searchText", repository: repository, renderMenuItemChildren: renderOption, multiple: multiple, allowNew: allowNew, showValidationInfo: showValidationInfo })));
}
exports.CitySelectFormElement = CitySelectFormElement;
function OfferSelectFormElement({ name = "_offer", showValidationInfo = true, multiple = false, repository, readOnly = false, }) {
    const { formState: { errors }, } = (0, FormContext_1.useFormContext)();
    function renderOption(option) {
        const typedOption = option;
        return (react_1.default.createElement("div", null,
            react_1.default.createElement("span", null,
                typedOption._type.name,
                " ",
                ` `,
                typedOption._city.name,
                " ",
                ` | `,
                typedOption.alias,
                " ",
                ` | `,
                typedOption.submissionDeadline),
            react_1.default.createElement("div", { className: "text-muted small" }, typedOption.employerName)));
    }
    return (react_1.default.createElement(react_1.default.Fragment, null,
        react_1.default.createElement(MyAsyncTypeahead, { name: name, labelKey: "alias", searchKey: "searchText", repository: repository, renderMenuItemChildren: renderOption, multiple: multiple, showValidationInfo: showValidationInfo, readOnly: readOnly })));
}
exports.OfferSelectFormElement = OfferSelectFormElement;
function FinancialAidProgrammeSelector({ name = "_programme", showValidationInfo = true, multiple = false, repository, allowNew = false, }) {
    const { formState: { errors }, } = (0, FormContext_1.useFormContext)();
    function renderOption(option) {
        const optionTyped = option;
        return (react_1.default.createElement("div", null,
            react_1.default.createElement("span", null, optionTyped.name)));
    }
    return (react_1.default.createElement(react_1.default.Fragment, null,
        react_1.default.createElement(MyAsyncTypeahead, { name: name, labelKey: "name", searchKey: "searchText", repository: repository, renderMenuItemChildren: renderOption, multiple: multiple, allowNew: allowNew, showValidationInfo: showValidationInfo })));
}
exports.FinancialAidProgrammeSelector = FinancialAidProgrammeSelector;
function FocusAreaSelector({ name = "_focusArea", showValidationInfo = true, multiple = false, repository, allowNew = false, }) {
    const { formState: { errors }, } = (0, FormContext_1.useFormContext)();
    function renderOption(option) {
        const optionTyped = option;
        return (react_1.default.createElement("div", null,
            react_1.default.createElement("span", null, optionTyped.name)));
    }
    return (react_1.default.createElement(react_1.default.Fragment, null,
        react_1.default.createElement(MyAsyncTypeahead, { name: name, labelKey: "name", searchKey: "searchText", repository: repository, renderMenuItemChildren: renderOption, multiple: multiple, allowNew: allowNew, showValidationInfo: showValidationInfo })));
}
exports.FocusAreaSelector = FocusAreaSelector;
function ContractSelectFormElement({ name = "_contract", showValidationInfo = true, multiple = false, repository, typesToInclude = "all", _project, readOnly = false, }) {
    const { formState: { errors }, } = (0, FormContext_1.useFormContext)();
    function renderOption(option) {
        return (react_1.default.createElement("div", null,
            react_1.default.createElement("span", null, option.ourId || option.number),
            react_1.default.createElement("div", { className: "text-muted small" }, option.alias || option.name)));
    }
    return (react_1.default.createElement(react_1.default.Fragment, null,
        react_1.default.createElement(MyAsyncTypeahead, { name: name, labelKey: "_ourIdOrNumber_Name", searchKey: "searchText", contextSearchParams: {
                typesToInclude: typesToInclude,
                _project: _project,
            }, repository: repository, renderMenuItemChildren: renderOption, multiple: multiple, showValidationInfo: showValidationInfo, readOnly: readOnly })));
}
exports.ContractSelectFormElement = ContractSelectFormElement;
/**
 * Komponent formularza wyboru typu kontraktu
 * @param name nazwa pola w formularzu - zostanie wysłane na serwer jako składowa obiektu FormData (domyślnie '_type')
 * @param typesToInclude 'our' | 'other' | 'all' - jakie typy kontraktów mają być wyświetlane (domyślnie 'all')
 * @param showValidationInfo czy pokazywać informacje o walidacji (domyślnie true)
 * @param required czy pole jest wymagane (walidacja) - domyślnie false
 */
function ContractTypeSelectFormElement({ typesToInclude = "all", required = false, showValidationInfo = true, multiple = false, name = "_type", }) {
    const { control, watch, setValue, formState: { errors }, } = (0, FormContext_1.useFormContext)();
    const label = "Typ Kontraktu";
    const repository = MainSetupReact_1.default.contractTypesRepository;
    function makeoptions(repositoryDataItems) {
        const filteredItems = repositoryDataItems.filter((item) => {
            if (typesToInclude === "all")
                return true;
            if (typesToInclude === "our" && item.isOur)
                return true;
            if (typesToInclude === "other" && !item.isOur)
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
            react_1.default.createElement(react_hook_form_1.Controller, { name: name, control: control, rules: { required: { value: required, message: "Wybierz typ kontraktu" } }, render: ({ field }) => (react_1.default.createElement(react_bootstrap_typeahead_1.Typeahead, { id: `${label}-controlled`, labelKey: "name", multiple: multiple, options: makeoptions(repository.items), onChange: (items) => handleOnChange(items, field), selected: field.value ? (multiple ? field.value : [field.value]) : [], placeholder: "-- Wybierz typ --", isValid: showValidationInfo ? !errors?.[name] : undefined, isInvalid: showValidationInfo ? !!errors?.[name] : undefined, renderMenuItemChildren: (option, props, index) => {
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
function CaseTypeSelectFormElement({ milestoneType, required = false, showValidationInfo = true, multiple = false, name = "_type", }) {
    const { control, watch, setValue, formState: { errors }, } = (0, FormContext_1.useFormContext)();
    const label = "Typ Sprawy";
    const repository = ContractsController_1.caseTypesRepository;
    function makeoptions(repositoryDataItems) {
        const filteredItems = repositoryDataItems.filter((item) => {
            if (!milestoneType)
                return true;
            if (milestoneType.id === item._milestoneType.id)
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
            react_1.default.createElement(react_hook_form_1.Controller, { name: name, control: control, rules: { required: { value: required, message: "Wybierz typ sprawy" } }, render: ({ field }) => (react_1.default.createElement(react_bootstrap_typeahead_1.Typeahead, { id: `${label}-controlled`, labelKey: "name", multiple: multiple, options: makeoptions(repository.items), onChange: (items) => handleOnChange(items, field), selected: field.value ? (multiple ? field.value : [field.value]) : [], placeholder: "-- Wybierz typ --", isValid: showValidationInfo ? !errors?.[name] : undefined, isInvalid: showValidationInfo ? !!errors?.[name] : undefined, renderMenuItemChildren: (option, props, index) => {
                        const myOption = option;
                        return (react_1.default.createElement("div", null,
                            react_1.default.createElement("span", null, myOption.name),
                            react_1.default.createElement("div", { className: "text-muted small" }, myOption.description)));
                    } })) }),
            react_1.default.createElement(ErrorMessage, { errors: errors, name: name }))));
}
exports.CaseTypeSelectFormElement = CaseTypeSelectFormElement;
/**
 * Komponent formularza wyboru typu kontraktu
 * @param name nazwa pola w formularzu - zostanie wysłane na serwer jako składowa obiektu FormData (domyślnie '_type')
 * @param typesToInclude 'our' | 'other' | 'all' - jakie typy kontraktów mają być wyświetlane (domyślnie 'all')
 * @param showValidationInfo czy pokazywać informacje o walidacji (domyślnie true)
 * @param required czy pole jest wymagane (walidacja) - domyślnie false
 */
function OurLetterTemplateSelectFormElement({ showValidationInfo = true, _cases = [], }) {
    const { control, watch, setValue, formState: { errors }, } = (0, FormContext_1.useFormContext)();
    const name = "_template";
    const label = "Szablon pisma";
    const repository = MainSetupReact_1.default.documentTemplatesRepository;
    function makeoptions(templates) {
        const filteredTemplates = templates.filter((template) => {
            return (!template._contents.caseTypeId ||
                _cases.some((caseItem) => caseItem._type._id === template._contents.caseTypeId));
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
            react_1.default.createElement(react_hook_form_1.Controller, { name: name, control: control, render: ({ field }) => (react_1.default.createElement(react_bootstrap_typeahead_1.Typeahead, { id: `${label}-controlled`, labelKey: "name", multiple: false, options: makeoptions(repository.items), onChange: (items) => handleOnChange(items, field), selected: field.value ? [field.value] : [], placeholder: "-- Wybierz szablon --", isValid: showValidationInfo ? !errors?.[name] : undefined, isInvalid: showValidationInfo ? !!errors?.[name] : undefined, renderMenuItemChildren: (option, props, index) => {
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
    const { control, setValue, watch, formState: { errors }, } = (0, FormContext_1.useFormContext)();
    function makeoptions(repositoryDataItems) {
        repositoryDataItems.map((item) => (item._nameSurname = `${item.name} ${item.surname}`));
        return repositoryDataItems;
    }
    function handleOnChange(selectedOptions, field) {
        const valueToBeSent = selectedOptions.length > 0 ? (multiple ? selectedOptions : selectedOptions[0]) : null;
        setValue(name, valueToBeSent);
        field.onChange(valueToBeSent);
    }
    function handleSelected(field) {
        const currentValue = (field.value ? (multiple ? field.value : [field.value]) : []);
        return makeoptions(currentValue);
    }
    return (react_1.default.createElement(react_1.default.Fragment, null,
        react_1.default.createElement(react_bootstrap_1.Form.Label, null, label),
        react_1.default.createElement(react_hook_form_1.Controller, { name: name, control: control, render: ({ field }) => (react_1.default.createElement(react_bootstrap_typeahead_1.Typeahead, { id: `${label}-controlled`, labelKey: "_nameSurname", options: makeoptions(repository.items), onChange: (items) => handleOnChange(items, field), selected: handleSelected(field), placeholder: "-- Wybierz osob\u0119 --", multiple: multiple, isValid: showValidationInfo ? !errors?.[name] : undefined, isInvalid: showValidationInfo ? !!errors?.[name] : undefined })) }),
        react_1.default.createElement(ErrorMessage, { errors: errors, name: name })));
}
exports.PersonSelectFormElement = PersonSelectFormElement;
function ErrorMessage({ errors, name }) {
    return react_1.default.createElement(react_1.default.Fragment, null, errors[name] && react_1.default.createElement(react_bootstrap_1.Form.Text, { className: "text-danger" }, errors[name]?.message));
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
function groupByMilestone(cases) {
    return cases.reduce((groups, item) => {
        const key = item._parent._FolderNumber_TypeName_Name ?? "Brak danych";
        if (!groups[key]) {
            groups[key] = [];
        }
        groups[key].push(item);
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
 * @param multiple czy można wybrać wiele opcji
 * @param showValidationInfo czy wyświetlać informacje o błędzie walidacji (domyślnie true)
 * @param readOnly czy pole jest tylko do odczytu (domyślnie false)
 * @param _contract kontrakt do którego należy wybrana sprawa
 */
function CaseSelectMenuElement({ name = "_case", readonly = false, _contract, _offer, repository, showValidationInfo = true, multiple = true, }) {
    const [options, setOptions] = (0, react_1.useState)([]);
    const { control, setValue, formState: { errors }, } = (0, FormContext_1.useFormContext)();
    (0, react_1.useEffect)(() => {
        const fetchData = async () => {
            if (_contract) {
                await repository.loadItemsFromServerPOST([
                    { contractId: _contract.id, milestoneParentType: "CONTRACT" },
                ]);
                setOptions(repository.items);
            }
            else if (_offer) {
                await repository.loadItemsFromServerPOST([{ offerId: _offer.id, milestoneParentType: "OFFER" }]);
                setOptions(repository.items);
            }
            else {
                repository.clearData();
            }
        };
        fetchData();
    }, [_contract, _offer]);
    function handleOnChange(selectedOptions, field) {
        const valueToBeSent = multiple ? selectedOptions : selectedOptions[0];
        setValue(name, valueToBeSent);
        field.onChange(valueToBeSent);
    }
    return (react_1.default.createElement(react_hook_form_1.Controller, { name: name, control: control, render: ({ field }) => (react_1.default.createElement(react_bootstrap_typeahead_1.Typeahead, { id: `${name}-typeahead`, labelKey: "_typeFolderNumber_TypeName_Number_Name", multiple: multiple, options: options, onChange: (items) => handleOnChange(items, field), renderMenu: (results, menuProps, state) => {
                const groupedResults = groupByMilestone(results);
                const milestoneNames = Object.keys(groupedResults).sort();
                return renderCaseMenu(results, menuProps, state, groupedResults, milestoneNames);
            }, selected: field.value ? (multiple ? field.value : [field.value]) : [], placeholder: "-- Wybierz spraw\u0119 --", isValid: showValidationInfo ? !errors?.[name] : undefined, isInvalid: showValidationInfo ? !!errors?.[name] : undefined, renderMenuItemChildren: (option, props, index) => {
                const myOption = option;
                return (react_1.default.createElement("div", null,
                    react_1.default.createElement("span", null, myOption._typeFolderNumber_TypeName_Number_Name),
                    react_1.default.createElement("div", { className: "text-muted small" }, myOption.description)));
            } })) }));
}
exports.CaseSelectMenuElement = CaseSelectMenuElement;
/**
 * Wyświetla pole do wprowadzania wartości w PLN
 * @param showValidationInfo czy wyświetlać informacje o błędzie walidacji (domyślnie true)
 * @param keyLabel nazwa pola w formularzu - zostanie wysłane na serwer jako składowa obiektu FormData (domyślnie 'value')
 */
function ValueInPLNInput({ showValidationInfo = true, keyLabel = "value" }) {
    const { control, setValue, watch, formState: { errors }, } = (0, FormContext_1.useFormContext)();
    const watchedValue = watch(keyLabel);
    (0, react_1.useEffect)(() => {
        if (watchedValue !== undefined) {
            setValue(keyLabel, watchedValue, { shouldValidate: true });
        }
        else {
            setValue(keyLabel, "", { shouldValidate: true });
        }
    }, [watchedValue, setValue]);
    const classNames = ["form-control"];
    if (showValidationInfo) {
        classNames.push(errors[keyLabel] ? "is-invalid" : "is-valid");
    }
    return (react_1.default.createElement(react_1.default.Fragment, null,
        react_1.default.createElement(react_bootstrap_1.InputGroup, { className: "mb-3" },
            react_1.default.createElement(react_hook_form_1.Controller, { control: control, name: keyLabel, render: ({ field }) => (react_1.default.createElement(react_number_format_1.NumericFormat, { ...field, value: watchedValue, thousandSeparator: " ", decimalSeparator: ".", decimalScale: 2, allowLeadingZeros: false, fixedDecimalScale: true, displayType: "input", allowNegative: false, onValueChange: (values) => {
                        setValue(keyLabel, values.floatValue);
                        //field.onChange(values.floatValue);
                    }, className: classNames.join(" "), valueIsNumericString: false })) }),
            react_1.default.createElement(react_bootstrap_1.InputGroup.Text, { id: "basic-addon1" }, "PLN")),
        react_1.default.createElement(ErrorMessage, { name: keyLabel, errors: errors })));
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
