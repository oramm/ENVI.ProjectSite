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
exports.SpinnerBootstrap = exports.ProgressBar = exports.handleEditMyAsyncTypeaheadElement = exports.MyAsyncTypeahead = exports.PersonSelectFormElement = exports.ContractTypeSelectFormElement = void 0;
const react_1 = __importStar(require("react"));
const react_bootstrap_1 = require("react-bootstrap");
const react_bootstrap_typeahead_1 = require("react-bootstrap-typeahead");
require("react-bootstrap-typeahead/css/Typeahead.css");
const MainSetupReact_1 = __importDefault(require("../../React/MainSetupReact"));
function ContractTypeSelectFormElement({ onChange, value }) {
    return (react_1.default.createElement(react_bootstrap_1.Form.Group, { controlId: "typeId" },
        react_1.default.createElement(react_bootstrap_1.Form.Label, null, "Typ Kontraktu"),
        react_1.default.createElement(react_bootstrap_1.Form.Control, { as: "select", name: "typeId", onChange: onChange, value: value },
            react_1.default.createElement("option", { value: "" }, "-- Wybierz opcj\u0119 --"),
            MainSetupReact_1.default.contractTypesRepository.items.map((contractType) => (react_1.default.createElement("option", { key: contractType.id, value: contractType.id }, contractType.name))))));
}
exports.ContractTypeSelectFormElement = ContractTypeSelectFormElement;
function PersonSelectFormElement({ label, onChange, value, repository }) {
    const options = repository.items.map((item) => ({ label: `${item.name} ${item.surname}`, value: item.id }));
    return (react_1.default.createElement(react_bootstrap_1.Form.Group, { controlId: label },
        react_1.default.createElement(react_bootstrap_1.Form.Label, null, label),
        react_1.default.createElement(react_bootstrap_typeahead_1.Typeahead, { id: label, options: options, onChange: onChange, 
            //selected={options.filter(option => { return value ? value.id == option.value : false })}
            placeholder: "-- Wybierz opcj\u0119 --" })));
}
exports.PersonSelectFormElement = PersonSelectFormElement;
function MyAsyncTypeahead({ repository, onChange, selectedRepositoryItems, labelKey }) {
    const [isLoading, setIsLoading] = (0, react_1.useState)(false);
    const [options, setOptions] = (0, react_1.useState)([]);
    function handleSearch(query) {
        setIsLoading(true);
        const formData = new FormData();
        formData.append(labelKey, query);
        repository.loadItemsfromServer(formData)
            .then((items) => {
            // Filter out object that are present in selectedRepositoryItems 
            const filteredItems = items.filter(item => {
                return selectedRepositoryItems ? !selectedRepositoryItems.some((selectedItem) => selectedItem.id == item.id) : true;
            });
            setOptions(filteredItems);
            setIsLoading(false);
        });
    }
    // Bypass client-side filtering by returning `true`. Results are already
    // filtered by the search endpoint, so no need to do it again.
    const filterBy = () => true;
    return (react_1.default.createElement(react_bootstrap_typeahead_1.AsyncTypeahead, { filterBy: filterBy, id: "async-example", isLoading: isLoading, labelKey: labelKey, minLength: 3, onSearch: handleSearch, options: options, onChange: onChange, selected: selectedRepositoryItems, multiple: true, newSelectionPrefix: "Dodaj nowy: ", placeholder: "-- Wybierz opcj\u0119 --", renderMenuItemChildren: (option) => (react_1.default.createElement(react_1.default.Fragment, null,
            react_1.default.createElement("div", null, option[labelKey]))) }));
}
exports.MyAsyncTypeahead = MyAsyncTypeahead;
;
function handleEditMyAsyncTypeaheadElement(currentSelectedDataItems, previousSelectedItems, setState) {
    const currentAndPreviousSelections = previousSelectedItems.concat(currentSelectedDataItems);
    const allUniqueDataItems = currentAndPreviousSelections.reduce((uniqueItems, dataItem) => {
        const isDuplicate = uniqueItems.some(item => item.id === dataItem.id);
        if (!isDuplicate) {
            uniqueItems.push(dataItem);
        }
        return uniqueItems;
    }, []);
    const finalItemsSelected = (currentSelectedDataItems.length < allUniqueDataItems.length) ? currentSelectedDataItems : allUniqueDataItems;
    setState(finalItemsSelected);
}
exports.handleEditMyAsyncTypeaheadElement = handleEditMyAsyncTypeaheadElement;
function ProgressBar() {
    return (react_1.default.createElement("progress", { style: { height: "5px" } }));
}
exports.ProgressBar = ProgressBar;
function SpinnerBootstrap() {
    return (react_1.default.createElement(react_bootstrap_1.Spinner, { animation: "border", variant: "success" }));
}
exports.SpinnerBootstrap = SpinnerBootstrap;
