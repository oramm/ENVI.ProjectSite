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
exports.CaseSelectMenuElement = exports.PersonSelectFormElement = exports.OurLetterTemplateSelectFormElement = exports.CaseTypeSelectFormElement = exports.ContractTypeSelectFormElement = exports.ContractSelectFormElement = exports.ClientNeedSelector = exports.ApplicationCallSelector = exports.FocusAreaSelectorPrefilled = exports.FocusAreaSelector = exports.FinancialAidProgrammeSelector = exports.OfferSelectFormElement = exports.CitySelectFormElement = exports.ProjectSelector = void 0;
const react_1 = __importStar(require("react"));
const react_bootstrap_1 = require("react-bootstrap");
const react_bootstrap_typeahead_1 = require("react-bootstrap-typeahead");
require("react-bootstrap-typeahead/css/Typeahead.css");
require("../../../Css/styles.css");
const MainSetupReact_1 = __importDefault(require("../../../React/MainSetupReact"));
const FormContext_1 = require("../FormContext");
const react_hook_form_1 = require("react-hook-form");
const ContractsController_1 = require("../../../Contracts/ContractsList/ContractsController");
const GenericComponents_1 = require("./GenericComponents");
/**
 * Komponent formularza wyboru projektu
 * @param repository Repozytorium projektów
 * @param showValidationInfo Czy wyświetlać informacje o walidacji - domyślnie true
 * @param name nazwa pola w formularzu - zostanie wysłane na serwer jako składowa obiektu FormData
 */
function ProjectSelector({ name = "_project", repository, showValidationInfo = true, disabled = false, }) {
    const { formState: { errors }, } = (0, FormContext_1.useFormContext)();
    function renderOption(option) {
        const optionTyped = option;
        return (react_1.default.createElement("div", null,
            react_1.default.createElement("span", null, optionTyped.ourId),
            react_1.default.createElement("div", { className: "text-muted small" }, optionTyped.alias)));
    }
    return (react_1.default.createElement(react_1.default.Fragment, null,
        react_1.default.createElement(react_bootstrap_1.Form.Label, null, "Projekt"),
        react_1.default.createElement(GenericComponents_1.MyAsyncTypeahead, { name: name, labelKey: "ourId", repository: repository, 
            //specialSerwerSearchActionRoute={'projects/' + MainSetup.currentUser.systemEmail}
            showValidationInfo: showValidationInfo, renderMenuItemChildren: renderOption, multiple: false })));
}
exports.ProjectSelector = ProjectSelector;
function CitySelectFormElement({ name = "_city", showValidationInfo = true, multiple = false, repository, allowNew = false, }) {
    const { formState: { errors }, } = (0, FormContext_1.useFormContext)();
    function renderOption(option) {
        //console.log("renderOption - Option: ", option); // Log the option being rendered
        return (react_1.default.createElement("div", null,
            react_1.default.createElement("span", null, option.name),
            react_1.default.createElement("div", { className: "text-muted small" }, option.code)));
    }
    return (react_1.default.createElement(react_1.default.Fragment, null,
        react_1.default.createElement(GenericComponents_1.MyAsyncTypeahead, { name: name, labelKey: "name", searchKey: "searchText", repository: repository, renderMenuItemChildren: renderOption, multiple: multiple, allowNew: allowNew, showValidationInfo: showValidationInfo })));
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
        react_1.default.createElement(GenericComponents_1.MyAsyncTypeahead, { name: name, labelKey: "alias", searchKey: "searchText", repository: repository, renderMenuItemChildren: renderOption, multiple: multiple, showValidationInfo: showValidationInfo, readOnly: readOnly })));
}
exports.OfferSelectFormElement = OfferSelectFormElement;
function FinancialAidProgrammeSelector({ name = "_financialAidProgramme", showValidationInfo = true, multiple = false, repository, allowNew = false, }) {
    const { formState: { errors }, } = (0, FormContext_1.useFormContext)();
    function renderOption(option) {
        const optionTyped = option;
        return (react_1.default.createElement("div", null,
            react_1.default.createElement("span", null, optionTyped.name)));
    }
    return (react_1.default.createElement(react_1.default.Fragment, null,
        react_1.default.createElement(GenericComponents_1.MyAsyncTypeahead, { name: name, labelKey: "name", searchKey: "searchText", repository: repository, renderMenuItemChildren: renderOption, multiple: multiple, allowNew: allowNew, showValidationInfo: showValidationInfo })));
}
exports.FinancialAidProgrammeSelector = FinancialAidProgrammeSelector;
function FocusAreaSelector({ name = "_focusArea", showValidationInfo = true, multiple = false, repository, allowNew = false, _financialAidProgramme, }) {
    const { formState: { errors }, } = (0, FormContext_1.useFormContext)();
    function renderOption(option) {
        const optionTyped = option;
        return (react_1.default.createElement("div", null,
            react_1.default.createElement("span", null, optionTyped.name)));
    }
    return (react_1.default.createElement(react_1.default.Fragment, null,
        react_1.default.createElement(GenericComponents_1.MyAsyncTypeahead, { name: name, labelKey: "name", searchKey: "searchText", contextSearchParams: {
                _financialAidProgramme,
            }, repository: repository, renderMenuItemChildren: renderOption, multiple: multiple, allowNew: allowNew, showValidationInfo: showValidationInfo })));
}
exports.FocusAreaSelector = FocusAreaSelector;
/**
 * Komponent formularza wyboru typu kontraktu
 * @param name nazwa pola w formularzu - zostanie wysłane na serwer jako składowa obiektu FormData (domyślnie '_type')
 * @param showValidationInfo czy pokazywać informacje o walidacji (domyślnie true)
 * @param required czy pole jest wymagane (walidacja) - domyślnie false
 */
function FocusAreaSelectorPrefilled({ repository, _financialAidProgramme, required = false, showValidationInfo = true, multiple = false, name = "_focusArea", }) {
    const { control, watch, setValue, formState: { errors }, } = (0, FormContext_1.useFormContext)();
    const [options, setOptions] = (0, react_1.useState)([]);
    const label = "Działanie";
    (0, react_1.useEffect)(() => {
        const fetchData = async () => {
            if (_financialAidProgramme)
                await repository.loadItemsFromServerPOST([{ _financialAidProgramme }]);
            else
                repository.clearData();
            setOptions(repository.items);
            setValue(name, multiple ? [] : null);
        };
        fetchData();
    }, [_financialAidProgramme]);
    function handleOnChange(selectedOptions, field) {
        const valueToBeSent = multiple ? selectedOptions : selectedOptions[0];
        setValue(name, valueToBeSent);
        field.onChange(valueToBeSent);
    }
    return (react_1.default.createElement(react_bootstrap_1.Form.Group, { controlId: name },
        react_1.default.createElement(react_bootstrap_1.Form.Label, null, label),
        react_1.default.createElement(react_1.default.Fragment, null,
            react_1.default.createElement(react_hook_form_1.Controller, { name: name, control: control, rules: { required: { value: required, message: "Wybierz działanie" } }, render: ({ field }) => (react_1.default.createElement(react_bootstrap_typeahead_1.Typeahead, { id: `${name}-controlled`, labelKey: "name", multiple: multiple, options: options, onChange: (items) => handleOnChange(items, field), selected: field.value ? (multiple ? field.value : [field.value]) : [], placeholder: "-- Wybierz dzia\u0142anie --", isValid: showValidationInfo ? !errors?.[name] : undefined, isInvalid: showValidationInfo ? !!errors?.[name] : undefined, renderMenuItemChildren: (option, props, index) => {
                        const optionTyped = option;
                        return (react_1.default.createElement("div", null,
                            react_1.default.createElement("span", null, optionTyped.alias),
                            react_1.default.createElement("div", { className: "text-muted small" }, optionTyped.name)));
                    } })) }),
            react_1.default.createElement(GenericComponents_1.ErrorMessage, { errors: errors, name: name }))));
}
exports.FocusAreaSelectorPrefilled = FocusAreaSelectorPrefilled;
function ApplicationCallSelector({ name = "_applicationCall", showValidationInfo = true, multiple = false, repository, allowNew = false, _financialAidProgramme, _focusArea, }) {
    const { formState: { errors }, } = (0, FormContext_1.useFormContext)();
    function renderOption(option) {
        const optionTyped = option;
        console.log("renderOption - Option: ", option); // Log the option being rendered
        return (react_1.default.createElement("div", null,
            react_1.default.createElement("span", null, optionTyped.description),
            react_1.default.createElement("div", { className: "text-muted small" },
                optionTyped.endDate,
                " ",
                optionTyped.status)));
    }
    return (react_1.default.createElement(react_1.default.Fragment, null,
        react_1.default.createElement(GenericComponents_1.MyAsyncTypeahead, { name: name, labelKey: "description", searchKey: "searchText", contextSearchParams: {
                _financialAidProgramme,
                _focusArea,
            }, repository: repository, renderMenuItemChildren: renderOption, multiple: multiple, allowNew: allowNew, showValidationInfo: showValidationInfo })));
}
exports.ApplicationCallSelector = ApplicationCallSelector;
function ClientNeedSelector({ name = "_need", showValidationInfo = true, multiple = false, repository, allowNew = false, }) {
    const { formState: { errors }, } = (0, FormContext_1.useFormContext)();
    function renderOption(option) {
        const optionTyped = option;
        return (react_1.default.createElement("div", null,
            react_1.default.createElement("span", null, optionTyped.name),
            react_1.default.createElement("div", { className: "text-muted small" },
                optionTyped._client?.name,
                " | ",
                optionTyped.status)));
    }
    return (react_1.default.createElement(react_1.default.Fragment, null,
        react_1.default.createElement(GenericComponents_1.MyAsyncTypeahead, { name: name, labelKey: "name", searchKey: "searchText", repository: repository, renderMenuItemChildren: renderOption, multiple: multiple, allowNew: allowNew, showValidationInfo: showValidationInfo })));
}
exports.ClientNeedSelector = ClientNeedSelector;
function ContractSelectFormElement({ name = "_contract", showValidationInfo = true, multiple = false, repository, typesToInclude = "all", _project, readOnly = false, }) {
    const { formState: { errors }, } = (0, FormContext_1.useFormContext)();
    function renderOption(option) {
        const optionTyped = option;
        const mainLabel = "ourId" in optionTyped ? optionTyped.ourId : optionTyped.number;
        return (react_1.default.createElement("div", null,
            react_1.default.createElement("span", null, mainLabel),
            react_1.default.createElement("div", { className: "text-muted small" }, optionTyped.alias || optionTyped.name)));
    }
    return (react_1.default.createElement(react_1.default.Fragment, null,
        react_1.default.createElement(GenericComponents_1.MyAsyncTypeahead, { name: name, labelKey: "_ourIdOrNumber_Name", searchKey: "searchText", contextSearchParams: {
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
                        const optionTyped = option;
                        return (react_1.default.createElement("div", null,
                            react_1.default.createElement("span", null, optionTyped.name),
                            react_1.default.createElement("div", { className: "text-muted small" }, optionTyped.description)));
                    } })) }),
            react_1.default.createElement(GenericComponents_1.ErrorMessage, { errors: errors, name: name }))));
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
            react_1.default.createElement(GenericComponents_1.ErrorMessage, { errors: errors, name: name }))));
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
                _cases.some((caseItem) => caseItem._type.id === template._contents.caseTypeId));
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
            react_1.default.createElement(GenericComponents_1.ErrorMessage, { errors: errors, name: name }))));
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
        react_1.default.createElement(GenericComponents_1.ErrorMessage, { errors: errors, name: name })));
}
exports.PersonSelectFormElement = PersonSelectFormElement;
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
