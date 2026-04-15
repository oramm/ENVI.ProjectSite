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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProjectSelector = ProjectSelector;
exports.CitySelector = CitySelector;
exports.EntitySelector = EntitySelector;
exports.OfferSelector = OfferSelector;
exports.FinancialAidProgrammeSelector = FinancialAidProgrammeSelector;
exports.FocusAreaSelector = FocusAreaSelector;
exports.FocusAreaSelectorPreloaded = FocusAreaSelectorPreloaded;
exports.ApplicationCallSelector = ApplicationCallSelector;
exports.ClientNeedSelector = ClientNeedSelector;
exports.ContractSelector = ContractSelector;
exports.ContractRangeSelector = ContractRangeSelector;
exports.ContractTypeSelector = ContractTypeSelector;
exports.CaseTypeSelector = CaseTypeSelector;
exports.MilestoneTypeSelector = MilestoneTypeSelector;
exports.OurLetterTemplateSelector = OurLetterTemplateSelector;
exports.PersonSelector = PersonSelector;
exports.PersonSelectorPreloaded = PersonSelectorPreloaded;
exports.CaseSelectMenuElement = CaseSelectMenuElement;
exports.SystemRoleSelector = SystemRoleSelector;
exports.LetterSelector = LetterSelector;
exports.SkillSelector = SkillSelector;
const react_1 = __importStar(require("react"));
const react_bootstrap_1 = require("react-bootstrap");
const react_bootstrap_typeahead_1 = require("react-bootstrap-typeahead");
require("react-bootstrap-typeahead/css/Typeahead.css");
require("../../../Css/styles.css");
const MainSetupReact_1 = __importDefault(require("../../../React/MainSetupReact"));
const RepositoryReact_1 = __importDefault(require("../../../React/RepositoryReact"));
const FormContext_1 = require("../FormContext");
const react_hook_form_1 = require("react-hook-form");
const ContractsController_1 = require("../../../Contracts/ContractsList/ContractsController");
const GenericComponents_1 = require("./GenericComponents");
const ToolsForms_1 = require("../../../React/Tools/ToolsForms");
/**
 * Komponent formularza wyboru projektu
 * @param showValidationInfo Czy wyświetlać informacje o walidacji - domyślnie true
 * @param name nazwa pola w formularzu - zostanie wysłane na serwer jako składowa obiektu FormData
 */
function ProjectSelector({ name = "_project", showValidationInfo = true, disabled = false, }) {
    const { formState: { errors }, } = (0, FormContext_1.useFormContext)();
    // ✅ Lokalna instancja repository tylko dla tego selectora
    const localRepository = (0, react_1.useMemo)(() => new RepositoryReact_1.default({
        actionRoutes: {
            getRoute: "projects",
            addNewRoute: "",
            editRoute: "",
            deleteRoute: "",
        },
        name: "projectSelector_temp",
    }), []);
    function renderOption(option) {
        const optionTyped = option;
        // ourId jest labelKey - zagwarantowane przez MyAsyncTypeahead
        const alias = (0, ToolsForms_1.safeGetFirstField)(optionTyped, ["alias"], "[Brak aliasu]");
        return (react_1.default.createElement("div", null,
            react_1.default.createElement("span", null, optionTyped.ourId),
            react_1.default.createElement("div", { className: "text-muted small text-wrap" }, alias)));
    }
    return (react_1.default.createElement(react_1.default.Fragment, null,
        react_1.default.createElement(react_bootstrap_1.Form.Label, null, "Projekt"),
        react_1.default.createElement(GenericComponents_1.MyAsyncTypeahead, { name: name, labelKey: "ourId", repository: localRepository, 
            //specialSerwerSearchActionRoute={'projects/' + MainSetup.currentUser.systemEmail}
            showValidationInfo: showValidationInfo, renderMenuItemChildren: renderOption, multiple: false })));
}
function CitySelector({ name = "_city", showValidationInfo = true, multiple = false, allowNew = false, }) {
    // ✅ Lokalna instancja repository tylko dla tego selectora
    const localRepository = (0, react_1.useMemo)(() => new RepositoryReact_1.default({
        actionRoutes: {
            getRoute: "cities",
            addNewRoute: "",
            editRoute: "",
            deleteRoute: "",
        },
        name: "citySelector_temp",
    }), []);
    function renderOption(option) {
        const typedOption = option;
        // name jest labelKey - zagwarantowane przez MyAsyncTypeahead
        const code = (0, ToolsForms_1.safeGetFirstField)(typedOption, ["code"], "");
        return (react_1.default.createElement("div", null,
            react_1.default.createElement("span", null, typedOption.name),
            react_1.default.createElement("span", { className: "text-muted small" },
                " ",
                code)));
    }
    return (react_1.default.createElement(react_1.default.Fragment, null,
        react_1.default.createElement(GenericComponents_1.MyAsyncTypeahead, { name: name, labelKey: "name", searchKey: "searchText", repository: localRepository, renderMenuItemChildren: renderOption, multiple: multiple, allowNew: allowNew, showValidationInfo: showValidationInfo })));
}
function EntitySelector({ name, showValidationInfo = true, multiple = false, allowNew = false, repository, }) {
    const { formState: { errors }, } = (0, FormContext_1.useFormContext)();
    // ✅ Lokalna instancja repository tylko dla tego selectora (lub użyj przekazanego)
    const localRepository = (0, react_1.useMemo)(() => {
        if (repository)
            return repository;
        return new RepositoryReact_1.default({
            actionRoutes: {
                getRoute: "entities",
                addNewRoute: "",
                editRoute: "",
                deleteRoute: "",
            },
            name: "entitySelector_temp",
        });
    }, [repository]);
    function renderOption(option, props) {
        const typedOption = option;
        // name jest labelKey - zagwarantowane przez MyAsyncTypeahead
        const address = (0, ToolsForms_1.safeGetFirstField)(typedOption, ["address"], "[Brak adresu]");
        return (react_1.default.createElement("div", null,
            react_1.default.createElement("span", null, typedOption.name),
            react_1.default.createElement("div", { className: "text-muted small text-wrap" }, address)));
    }
    return (react_1.default.createElement(react_1.default.Fragment, null,
        react_1.default.createElement(GenericComponents_1.MyAsyncTypeahead, { name: name, labelKey: "name", searchKey: "searchText", repository: localRepository, renderMenuItemChildren: renderOption, multiple: multiple, allowNew: allowNew, showValidationInfo: showValidationInfo })));
}
function OfferSelector({ name = "_offer", showValidationInfo = true, multiple = false, readOnly = false, }) {
    const { formState: { errors }, } = (0, FormContext_1.useFormContext)();
    // ✅ Lokalna instancja repository tylko dla tego selectora
    const localRepository = (0, react_1.useMemo)(() => new RepositoryReact_1.default({
        actionRoutes: {
            getRoute: "offers",
            addNewRoute: "",
            editRoute: "",
            deleteRoute: "",
        },
        name: "offerSelector_temp",
    }), []);
    function renderOption(option) {
        const typedOption = option;
        // alias jest labelKey - zagwarantowane przez MyAsyncTypeahead
        const typeName = (0, ToolsForms_1.safeGetFirstField)(typedOption, ["_type.name"], "[Brak typu]");
        const cityName = (0, ToolsForms_1.safeGetFirstField)(typedOption, ["_city.name"], "");
        const deadline = (0, ToolsForms_1.safeGetFirstField)(typedOption, ["submissionDeadline"], "");
        const employerName = (0, ToolsForms_1.safeGetFirstField)(typedOption, ["employerName"], "[Brak pracodawcy]");
        return (react_1.default.createElement("div", null,
            react_1.default.createElement("span", null,
                typeName,
                " ",
                ` `,
                cityName,
                " ",
                ` | `,
                typedOption.alias,
                " ",
                ` | `,
                deadline),
            react_1.default.createElement("div", { className: "text-muted small text-wrap" }, employerName)));
    }
    return (react_1.default.createElement(react_1.default.Fragment, null,
        react_1.default.createElement(GenericComponents_1.MyAsyncTypeahead, { name: name, labelKey: "alias", searchKey: "searchText", repository: localRepository, renderMenuItemChildren: renderOption, multiple: multiple, showValidationInfo: showValidationInfo, readOnly: readOnly })));
}
function FinancialAidProgrammeSelector({ name = "_financialAidProgramme", showValidationInfo = true, multiple = false, allowNew = false, repository, }) {
    const { formState: { errors }, } = (0, FormContext_1.useFormContext)();
    // ✅ Lokalna instancja repository tylko dla tego selectora (lub użyj przekazanego)
    const localRepository = (0, react_1.useMemo)(() => {
        if (repository)
            return repository;
        return new RepositoryReact_1.default({
            actionRoutes: {
                getRoute: "financialAidProgrammes",
                addNewRoute: "",
                editRoute: "",
                deleteRoute: "",
            },
            name: "financialAidProgrammeSelector_temp",
        });
    }, [repository]);
    function renderOption(option) {
        const optionTyped = option;
        return (react_1.default.createElement("div", null,
            react_1.default.createElement("span", null, optionTyped.name)));
    }
    return (react_1.default.createElement(react_1.default.Fragment, null,
        react_1.default.createElement(GenericComponents_1.MyAsyncTypeahead, { name: name, labelKey: "name", searchKey: "searchText", repository: localRepository, renderMenuItemChildren: renderOption, multiple: multiple, allowNew: allowNew, showValidationInfo: showValidationInfo })));
}
function FocusAreaSelector({ name = "_focusArea", showValidationInfo = true, multiple = false, allowNew = false, _financialAidProgramme, }) {
    const { formState: { errors }, } = (0, FormContext_1.useFormContext)();
    // ✅ Lokalna instancja repository tylko dla tego selectora
    const localRepository = (0, react_1.useMemo)(() => new RepositoryReact_1.default({
        actionRoutes: {
            getRoute: "focusAreas",
            addNewRoute: "",
            editRoute: "",
            deleteRoute: "",
        },
        name: "focusAreaSelector_temp",
    }), []);
    function renderOption(option) {
        const optionTyped = option;
        return (react_1.default.createElement("div", null,
            react_1.default.createElement("span", null, optionTyped.name)));
    }
    return (react_1.default.createElement(react_1.default.Fragment, null,
        react_1.default.createElement(GenericComponents_1.MyAsyncTypeahead, { name: name, labelKey: "name", searchKey: "searchText", contextSearchParams: {
                _financialAidProgramme,
            }, repository: localRepository, renderMenuItemChildren: renderOption, multiple: multiple, allowNew: allowNew, showValidationInfo: showValidationInfo })));
}
/**
 * Komponent formularza wyboru typu kontraktu
 * @param name nazwa pola w formularzu - zostanie wysłane na serwer jako składowa obiektu FormData (domyślnie '_type')
 * @param showValidationInfo czy pokazywać informacje o walidacji (domyślnie true)
 * @param required czy pole jest wymagane (walidacja) - domyślnie false
 */
function FocusAreaSelectorPreloaded({ repository, _financialAidProgramme, required = false, showValidationInfo = true, multiple = false, name = "_focusArea", }) {
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
                            react_1.default.createElement("div", { className: "text-muted small text-wrap" }, optionTyped.name)));
                    } })) }),
            react_1.default.createElement(GenericComponents_1.ErrorMessage, { errors: errors, name: name }))));
}
function ApplicationCallSelector({ name = "_applicationCall", showValidationInfo = true, multiple = false, allowNew = false, _financialAidProgramme, _focusArea, }) {
    const { formState: { errors }, } = (0, FormContext_1.useFormContext)();
    // ✅ Lokalna instancja repository tylko dla tego selectora
    const localRepository = (0, react_1.useMemo)(() => new RepositoryReact_1.default({
        actionRoutes: {
            getRoute: "applicationCalls",
            addNewRoute: "",
            editRoute: "",
            deleteRoute: "",
        },
        name: "applicationCallSelector_temp",
    }), []);
    function renderOption(option) {
        const optionTyped = option;
        // description jest labelKey - zagwarantowane przez MyAsyncTypeahead
        const endDate = (0, ToolsForms_1.safeGetFirstField)(optionTyped, ["endDate"], "");
        const status = (0, ToolsForms_1.safeGetFirstField)(optionTyped, ["status"], "");
        return (react_1.default.createElement("div", null,
            react_1.default.createElement("span", null, optionTyped.description),
            react_1.default.createElement("div", { className: "text-muted small text-wrap" },
                endDate,
                " ",
                status)));
    }
    return (react_1.default.createElement(react_1.default.Fragment, null,
        react_1.default.createElement(GenericComponents_1.MyAsyncTypeahead, { name: name, labelKey: "description", searchKey: "searchText", contextSearchParams: {
                _financialAidProgramme,
                _focusArea,
            }, repository: localRepository, renderMenuItemChildren: renderOption, multiple: multiple, allowNew: allowNew, showValidationInfo: showValidationInfo })));
}
function ClientNeedSelector({ name = "_need", showValidationInfo = true, multiple = false, allowNew = false, }) {
    const { formState: { errors }, } = (0, FormContext_1.useFormContext)();
    // ✅ Lokalna instancja repository tylko dla tego selectora
    const localRepository = (0, react_1.useMemo)(() => new RepositoryReact_1.default({
        actionRoutes: {
            getRoute: "needs",
            addNewRoute: "",
            editRoute: "",
            deleteRoute: "",
        },
        name: "clientNeedSelector_temp",
    }), []);
    function renderOption(option) {
        const optionTyped = option;
        // name jest labelKey - zagwarantowane przez MyAsyncTypeahead
        const clientName = (0, ToolsForms_1.safeGetFirstField)(optionTyped, ["_client.name"], "[Brak klienta]");
        const status = (0, ToolsForms_1.safeGetFirstField)(optionTyped, ["status"], "");
        return (react_1.default.createElement("div", null,
            react_1.default.createElement("span", null, optionTyped.name),
            react_1.default.createElement("div", { className: "text-muted small text-wrap" },
                clientName,
                " | ",
                status)));
    }
    return (react_1.default.createElement(react_1.default.Fragment, null,
        react_1.default.createElement(GenericComponents_1.MyAsyncTypeahead, { name: name, labelKey: "name", searchKey: "searchText", repository: localRepository, renderMenuItemChildren: renderOption, multiple: multiple, allowNew: allowNew, showValidationInfo: showValidationInfo })));
}
/**
 * Komponent formularza wyboru kontraktu z wyszukiwaniem asynchronicznym
 * Używa lokalnego repository aby nie kolidować z innymi komponentami
 */
function ContractSelector({ name = "_contract", showValidationInfo = true, multiple = false, typesToInclude = "all", _project, readOnly = false, }) {
    const { formState: { errors }, } = (0, FormContext_1.useFormContext)();
    // ✅ Lokalna instancja repository tylko dla tego selectora
    const localRepository = (0, react_1.useMemo)(() => new RepositoryReact_1.default({
        actionRoutes: {
            getRoute: "contracts",
            addNewRoute: "",
            editRoute: "",
            deleteRoute: "",
        },
        name: "contractSelector_temp",
    }), []);
    function renderOption(option) {
        const optionTyped = option;
        // _ourIdOrNumber_Name powinno być zwrócone przez backend
        const mainLabel = (0, ToolsForms_1.safeGetFirstField)(optionTyped, ["ourId", "number"], "[Brak numeru]");
        const subLabel = (0, ToolsForms_1.safeGetFirstField)(optionTyped, ["alias", "name"], "[Brak nazwy]");
        return (react_1.default.createElement("div", null,
            react_1.default.createElement("span", null, mainLabel),
            react_1.default.createElement("div", { className: "text-muted small text-wrap" }, subLabel)));
    }
    return (react_1.default.createElement(react_1.default.Fragment, null,
        react_1.default.createElement(GenericComponents_1.MyAsyncTypeahead, { name: name, labelKey: "_ourIdOrNumber_Name", searchKey: "searchText", contextSearchParams: {
                typesToInclude: typesToInclude,
                _project: _project,
            }, repository: localRepository, renderMenuItemChildren: renderOption, multiple: multiple, showValidationInfo: showValidationInfo, readOnly: readOnly })));
}
function ContractRangeSelector({ repository, showValidationInfo = true, multiple = true, name = "_contractRanges", }) {
    const { control, setValue, getValues, formState: { errors }, } = (0, FormContext_1.useFormContext)();
    const [options, setOptions] = (0, react_1.useState)([]);
    const label = "Zakresy";
    (0, react_1.useEffect)(() => {
        const fetchData = async () => {
            await repository.loadItemsFromServerPOST();
            setOptions(repository.items);
            const currentValue = getValues(name);
            if (multiple) {
                if (!Array.isArray(currentValue) || currentValue.length === 0) {
                    setValue(name, []);
                }
            }
            else {
                if (!currentValue) {
                    setValue(name, null);
                }
            }
        };
        fetchData();
    }, [repository, setValue, multiple, name]);
    return (react_1.default.createElement(react_bootstrap_1.Form.Group, { controlId: name },
        react_1.default.createElement(react_bootstrap_1.Form.Label, null, label),
        react_1.default.createElement(react_hook_form_1.Controller, { name: name, control: control, render: ({ field }) => {
                const formValue = (field.value || []);
                const currentSelection = options.filter((option) => formValue.some((item) => (item?._contractRange?.id || item?.id) === option.id));
                return (react_1.default.createElement(react_bootstrap_typeahead_1.Typeahead, { id: `${name}-controlled`, labelKey: "name", multiple: multiple, options: options, onChange: field.onChange, selected: currentSelection, placeholder: "-- Wybierz zakresy kontraktu --", isValid: showValidationInfo ? !errors?.[name] : undefined, isInvalid: showValidationInfo ? !!errors?.[name] : undefined, renderMenuItemChildren: (option, props, index) => {
                        const optionTyped = option;
                        return (react_1.default.createElement("div", null,
                            react_1.default.createElement("span", null, optionTyped.name),
                            react_1.default.createElement("div", { className: "text-muted small text-wrap" }, optionTyped.description)));
                    } }));
            } }),
        react_1.default.createElement(GenericComponents_1.ErrorMessage, { errors: errors, name: name })));
}
/**
 * Komponent formularza wyboru typu kontraktu
 * @param name nazwa pola w formularzu - zostanie wysłane na serwer jako składowa obiektu FormData (domyślnie '_type')
 * @param typesToInclude 'our' | 'other' | 'all' - jakie typy kontraktów mają być wyświetlane (domyślnie 'all')
 * @param showValidationInfo czy pokazywać informacje o walidacji (domyślnie true)
 * @param required czy pole jest wymagane (walidacja) - domyślnie false
 */
function ContractTypeSelector({ typesToInclude = "all", required = false, showValidationInfo = true, multiple = false, name = "_type", }) {
    const { control, watch, setValue, formState: { errors }, } = (0, FormContext_1.useFormContext)();
    const label = "Typ Kontraktu";
    const repository = MainSetupReact_1.default.contractTypesRepository;
    //tymczasowe, ale działa
    if (!repository) {
        return (react_1.default.createElement(react_bootstrap_1.Form.Group, { controlId: label },
            react_1.default.createElement(react_bootstrap_1.Form.Label, null, label),
            react_1.default.createElement(react_bootstrap_1.Form.Control, { placeholder: "Od\u015Bwie\u017C aby za\u0142adowa\u0107 typy", disabled: true })));
    }
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
                            react_1.default.createElement("div", { className: "text-muted small text-wrap" }, optionTyped.description)));
                    } })) }),
            react_1.default.createElement(GenericComponents_1.ErrorMessage, { errors: errors, name: name }))));
}
/**
 * Komponent formularza wyboru typu kontraktu
 * @param name nazwa pola w formularzu - zostanie wysłane na serwer jako składowa obiektu FormData (domyślnie '_type')
 * @param typesToInclude 'our' | 'other' | 'all' - jakie typy kontraktów mają być wyświetlane (domyślnie 'all')
 * @param showValidationInfo czy pokazywać informacje o walidacji (domyślnie true)
 * @param required czy pole jest wymagane (walidacja) - domyślnie false
 */
function CaseTypeSelector({ milestoneType, required = false, showValidationInfo = true, multiple = false, name = "_type", }) {
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
                            react_1.default.createElement("div", { className: "text-muted small text-wrap" }, myOption.description)));
                    } })) }),
            react_1.default.createElement(GenericComponents_1.ErrorMessage, { errors: errors, name: name }))));
}
/**
 * Komponent formularza wyboru typu kontraktu
 * @param name nazwa pola w formularzu - zostanie wysłane na serwer jako składowa obiektu FormData (domyślnie '_type')
 * @param typesToInclude 'our' | 'other' | 'all' - jakie typy kontraktów mają być wyświetlane (domyślnie 'all')
 * @param showValidationInfo czy pokazywać informacje o walidacji (domyślnie true)
 * @param required czy pole jest wymagane (walidacja) - domyślnie false
 */
function MilestoneTypeSelector({ contractType, required = false, showValidationInfo = true, multiple = false, name = "_type", }) {
    const { control, watch, setValue, formState: { errors }, } = (0, FormContext_1.useFormContext)();
    const label = "Typ kamienia";
    const repository = ContractsController_1.milestoneTypesRepository;
    function makeOptions(repositoryDataItems) {
        const filteredItems = repositoryDataItems.filter((item) => {
            if (!contractType)
                return true;
            if (contractType.id === item._contractType.id)
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
            react_1.default.createElement(react_hook_form_1.Controller, { name: name, control: control, rules: { required: { value: required, message: "Wybierz typ kamienia" } }, render: ({ field }) => (react_1.default.createElement(react_bootstrap_typeahead_1.Typeahead, { id: `${label}-controlled`, labelKey: "name", multiple: multiple, options: makeOptions(repository.items), onChange: (items) => handleOnChange(items, field), selected: field.value ? (multiple ? field.value : [field.value]) : [], placeholder: "-- Wybierz typ --", isValid: showValidationInfo ? !errors?.[name] : undefined, isInvalid: showValidationInfo ? !!errors?.[name] : undefined, renderMenuItemChildren: (option, props, index) => {
                        const myOption = option;
                        return (react_1.default.createElement("div", null,
                            react_1.default.createElement("span", null, myOption.name),
                            react_1.default.createElement("div", { className: "text-muted small text-wrap" }, myOption.description)));
                    } })) }),
            react_1.default.createElement(GenericComponents_1.ErrorMessage, { errors: errors, name: name }))));
}
/**
 * Komponent formularza wyboru typu kontraktu
 * @param name nazwa pola w formularzu - zostanie wysłane na serwer jako składowa obiektu FormData (domyślnie '_type')
 * @param typesToInclude 'our' | 'other' | 'all' - jakie typy kontraktów mają być wyświetlane (domyślnie 'all')
 * @param showValidationInfo czy pokazywać informacje o walidacji (domyślnie true)
 * @param required czy pole jest wymagane (walidacja) - domyślnie false
 */
function OurLetterTemplateSelector({ showValidationInfo = true, _cases = [], }) {
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
                            react_1.default.createElement("div", { className: "text-muted small text-wrap" }, myOption.description)));
                    } })) }),
            react_1.default.createElement(GenericComponents_1.ErrorMessage, { errors: errors, name: name }))));
}
function PersonSelector({ name = "_person", showValidationInfo = true, multiple = false, allowNew = false, repository, }) {
    // ✅ Lokalna instancja repository tylko dla tego selectora
    const localRepository = (0, react_1.useMemo)(() => repository
        ? repository
        : new RepositoryReact_1.default({
            actionRoutes: {
                getRoute: "persons",
                addNewRoute: "",
                editRoute: "",
                deleteRoute: "",
            },
            name: "personSelector_temp",
        }), [repository]);
    function renderOption(option) {
        const typedOption = option;
        // _nameSurnameEmail jest labelKey - zagwarantowane przez MyAsyncTypeahead
        const entityName = (0, ToolsForms_1.safeGetFirstField)(typedOption, ["_entity.name"], "[Brak encji]");
        return (react_1.default.createElement(react_1.default.Fragment, null,
            react_1.default.createElement("div", null, typedOption._nameSurnameEmail),
            react_1.default.createElement("div", { className: "text-muted small text-wrap" },
                " ",
                entityName)));
    }
    return (react_1.default.createElement(react_1.default.Fragment, null,
        react_1.default.createElement(GenericComponents_1.MyAsyncTypeahead, { name: name, labelKey: "_nameSurnameEmail", searchKey: "searchText", repository: localRepository, renderMenuItemChildren: renderOption, multiple: multiple, allowNew: allowNew, showValidationInfo: showValidationInfo })));
}
/**
 * Komponent formularza wyboru osoby
 * @param label oznaczenie pola formularza
 * @param name nazwa pola w formularzu - zostanie wysłane na serwer jako składowa obiektu FormData
 */
function PersonSelectorPreloaded({ label, name, repository, multiple = false, showValidationInfo = true, }) {
    const { control, setValue, formState: { errors }, } = (0, FormContext_1.useFormContext)();
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
function groupByMilestone(cases) {
    return cases.reduce((groups, item) => {
        const key = item._parent?._FolderNumber_TypeName_Name ?? "Brak danych";
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
            const folderNumber = item._type?.folderNumber ?? "";
            const typeName = item._type?.name ?? "";
            const folderName = item._folderName ?? "";
            const menuItem = (react_1.default.createElement(react_bootstrap_typeahead_1.MenuItem, { key: index, option: item, position: index },
                folderNumber,
                " ",
                typeName,
                " ",
                folderName));
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
                    react_1.default.createElement("div", { className: "text-muted small text-wrap" }, myOption.description)));
            } })) }));
}
function SystemRoleSelector({ name = "systemRoleId", showValidationInfo = true }) {
    const { register, formState: { errors }, } = (0, FormContext_1.useFormContext)();
    const systemRolesOptions = Object.values(MainSetupReact_1.default.SystemRoles);
    return (react_1.default.createElement(react_bootstrap_1.Form.Group, { controlId: name },
        react_1.default.createElement(react_bootstrap_1.Form.Label, null, "Rola w systemie"),
        react_1.default.createElement(react_bootstrap_1.Form.Select, { isInvalid: !!errors?.[name], isValid: showValidationInfo ? !errors?.[name] : undefined, ...register(name) },
            react_1.default.createElement("option", { value: "" }, "-- Wybierz rol\u0119 --"),
            systemRolesOptions.map((role) => (react_1.default.createElement("option", { key: role.id, value: role.id }, role.systemName)))),
        react_1.default.createElement(GenericComponents_1.ErrorMessage, { name: name, errors: errors })));
}
/**
 * Komponent formularza do wyboru istniejącego pisma w ramach danego kontraktu.
 * Po wybraniu pisma, w formularzu ustawiana jest wartość jego numeru.
 * Uwaga: Używa własnej instancji repository, aby nie kolidować z głównym repo w FilterableTable.
 */
function LetterSelector({ name, label, _contract, showValidationInfo = true }) {
    const { control, setValue, formState: { errors }, } = (0, FormContext_1.useFormContext)();
    const [options, setOptions] = (0, react_1.useState)([]);
    const [isOpen, setIsOpen] = (0, react_1.useState)(false);
    // ✅ Lokalna instancja repository tylko dla tego selectora
    const localRepository = (0, react_1.useMemo)(() => new RepositoryReact_1.default({
        actionRoutes: {
            getRoute: "contractsLetters",
            addNewRoute: "",
            editRoute: "",
            deleteRoute: "",
        },
        name: "letterSelector_temp",
    }), []);
    (0, react_1.useEffect)(() => {
        const fetchData = async () => {
            if (_contract?.id) {
                await localRepository.loadItemsFromServerPOST([{ contractId: _contract.id }]);
                setOptions(localRepository.items);
            }
            else {
                setOptions([]);
            }
        };
        fetchData();
    }, [_contract, localRepository]);
    function normalizeComparableValue(value) {
        if (value === null || value === undefined)
            return "";
        return String(value).trim();
    }
    function handleOnChange(selectedOptions, field) {
        const selectedLetter = selectedOptions[0];
        const valueToSet = selectedLetter?.number || "";
        setValue(name, valueToSet);
        field.onChange(valueToSet);
    }
    return (react_1.default.createElement(react_bootstrap_1.Form.Group, { controlId: name },
        react_1.default.createElement(react_bootstrap_1.Form.Label, null, label),
        react_1.default.createElement(react_hook_form_1.Controller, { name: name, control: control, render: ({ field }) => {
                const normalizedFieldValue = normalizeComparableValue(field.value);
                const currentSelection = options.find((option) => normalizeComparableValue(option.number) === normalizedFieldValue);
                return (react_1.default.createElement(react_bootstrap_typeahead_1.Typeahead, { id: `${name}-typeahead`, labelKey: (option) => option.number != null ? String(option.number) : "", options: options, onChange: (selected) => {
                        handleOnChange(selected, field);
                        setIsOpen(false);
                    }, selected: currentSelection ? [currentSelection] : [], placeholder: "-- Wybierz pismo z listy --", isValid: showValidationInfo ? !errors?.[name] : undefined, isInvalid: showValidationInfo ? !!errors?.[name] : undefined, open: isOpen, onFocus: () => setIsOpen(true), onBlur: () => setTimeout(() => setIsOpen(false), 150), renderMenuItemChildren: (option) => (react_1.default.createElement("div", null,
                        react_1.default.createElement("span", null, option.number),
                        react_1.default.createElement("div", { className: "text-muted small text-wrap" }, option.description))) }));
            } }),
        react_1.default.createElement(GenericComponents_1.ErrorMessage, { errors: errors, name: name })));
}
function SkillSelector({ name = "_skills", multiple = true, showValidationInfo = false, label = "Specjalizacje", repository, }) {
    const { setValue, control, formState: { errors }, } = (0, FormContext_1.useFormContext)();
    const [options, setOptions] = (0, react_1.useState)([]);
    const localRepository = (0, react_1.useMemo)(() => repository
        ? repository
        : new RepositoryReact_1.default({
            actionRoutes: {
                getRoute: "v2/skills/search",
                addNewRoute: "",
                editRoute: "",
                deleteRoute: "",
            },
            name: "skillSelector_temp",
        }), [repository]);
    (0, react_1.useEffect)(() => {
        const fetchData = async () => {
            await localRepository.loadItemsFromServerPOST([]);
            setOptions(localRepository.items);
        };
        fetchData();
    }, [localRepository]);
    function handleOnChange(selected, field) {
        const valueToBeSent = multiple ? selected : selected[0];
        setValue(name, valueToBeSent);
        setValue("skillIds", selected.map((s) => s.id));
        field.onChange(valueToBeSent);
    }
    function getSelectedValue(fieldValue) {
        if (multiple) {
            return fieldValue || [];
        }
        if (fieldValue && typeof fieldValue === "object") {
            return [fieldValue];
        }
        return [];
    }
    return (react_1.default.createElement(react_1.default.Fragment, null,
        react_1.default.createElement(react_bootstrap_1.Form.Label, null, label),
        react_1.default.createElement(react_hook_form_1.Controller, { name: name, control: control, render: ({ field }) => (react_1.default.createElement(react_bootstrap_typeahead_1.Typeahead, { id: `${name}-typeahead`, labelKey: "name", multiple: multiple, options: options, onChange: (selected) => handleOnChange(selected, field), selected: getSelectedValue(field.value), placeholder: multiple ? "-- Wybierz specjalizacje --" : "-- Wybierz specjalizacje --", isValid: showValidationInfo ? !errors?.[name] : undefined, isInvalid: showValidationInfo ? !!errors?.[name] : undefined, renderMenuItemChildren: (option) => {
                    const skill = option;
                    return (react_1.default.createElement("div", null,
                        react_1.default.createElement("span", null, skill.name),
                        react_1.default.createElement("div", { className: "text-muted small text-wrap" }, skill.description || "Brak opisu")));
                } })) })));
}
