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
exports.ConfirmModal = exports.SpinnerBootstrap = exports.ProgressBar = exports.ValueInPLNInput = exports.handleEditMyAsyncTypeaheadElement = exports.MyAsyncTypeahead = exports.PersonSelectFormElement = exports.ContractTypeSelectFormElement = void 0;
const react_1 = __importStar(require("react"));
const react_bootstrap_1 = require("react-bootstrap");
const react_bootstrap_typeahead_1 = require("react-bootstrap-typeahead");
require("react-bootstrap-typeahead/css/Typeahead.css");
const MainSetupReact_1 = __importDefault(require("../../React/MainSetupReact"));
/** Pole wyboru typu kontraktu */
function ContractTypeSelectFormElement({ onChange, value }) {
    return (react_1.default.createElement(react_bootstrap_1.Form.Group, { controlId: "typeId" },
        react_1.default.createElement(react_bootstrap_1.Form.Label, null, "Typ Kontraktu"),
        react_1.default.createElement(react_bootstrap_1.Form.Control, { as: "select", name: "typeId", onChange: onChange, value: value },
            react_1.default.createElement("option", { value: "" }, "-- Wybierz opcj\u0119 --"),
            MainSetupReact_1.default.contractTypesRepository.items.map((contractType) => (react_1.default.createElement("option", { key: contractType.id, value: contractType.id }, contractType.name))))));
}
exports.ContractTypeSelectFormElement = ContractTypeSelectFormElement;
function PersonSelectFormElement({ label, onChange, selectedRepositoryItems, repository, multiple }) {
    function makeoptions(repositoryDataItems) {
        console.log('makeoptions:: ', repositoryDataItems);
        return repositoryDataItems.map((item) => ({ label: `${item.name} ${item.surname}`, value: item.id }));
    }
    function handleOnChange(selectedItems) {
        const selectedRepositoryItems = selectedItems
            .map((item) => {
            const foundItem = repository.items.find((repoItem) => repoItem.id === item.value);
            return foundItem;
        })
            .filter((item) => item !== undefined);
        console.log('onChange(selectedRepositoryItems):: ', selectedItems);
        onChange(selectedRepositoryItems);
    }
    return (react_1.default.createElement(react_bootstrap_1.Form.Group, { controlId: label },
        react_1.default.createElement(react_bootstrap_1.Form.Label, null, label),
        react_1.default.createElement(react_bootstrap_typeahead_1.Typeahead, { id: label, options: makeoptions(repository.items), onChange: handleOnChange, selected: makeoptions(selectedRepositoryItems), placeholder: "-- Wybierz osob\u0119 --", multiple: multiple })));
}
exports.PersonSelectFormElement = PersonSelectFormElement;
/**
 * @param repository repozytorium z którego pobierane są dane
 * @param onChange zaktualizuj setstate projects komponentu nadrzędnego
 * @param selectedRepositoryItems aktualnie wybrane elementy
 * @param labelKey nazwa pola w repozytorium które ma być wyświetlane w polu wyboru
 * @param searchKey nazwa pola w repozytorium które ma być wyszukiwane po stronie serwera (sprawdź odpowiedni controller) domyślnie jest równe labelKey
 * @param additionalFieldsKeysValues dodatkowe pola które mają być wyszukiwane na serwerze
 * @param specialSerwerSearchActionRoute nazwa nietypowego route na serwerze która ma być wywołana zamiast standardowego z RepositoryReact
 * @param multiple czy pole wyboru ma być wielokrotnego wyboru
 * @param menuItemChildren dodatkowe elementy wyświetlane w liście wyboru
*/
function MyAsyncTypeahead({ repository, onChange, selectedRepositoryItems, labelKey, searchKey = labelKey, additionalFieldsKeysValues = [], specialSerwerSearchActionRoute, renderMenuItemChildren = (option) => react_1.default.createElement(react_1.default.Fragment, null, option[labelKey]), multiple = false }) {
    const [isLoading, setIsLoading] = (0, react_1.useState)(false);
    const [options, setOptions] = (0, react_1.useState)([]);
    function handleSearch(query) {
        setIsLoading(true);
        const formData = new FormData();
        formData.append(searchKey, query);
        additionalFieldsKeysValues.forEach((field) => {
            formData.append(field.key, field.value);
        });
        repository.loadItemsfromServer(formData, specialSerwerSearchActionRoute)
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
    return (react_1.default.createElement(react_bootstrap_typeahead_1.AsyncTypeahead, { filterBy: filterBy, id: "async-example", isLoading: isLoading, labelKey: labelKey, minLength: 3, onSearch: handleSearch, options: options, onChange: onChange, selected: selectedRepositoryItems, multiple: multiple, newSelectionPrefix: "Dodaj nowy: ", placeholder: "-- Wybierz opcj\u0119 --", renderMenuItemChildren: renderMenuItemChildren }));
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
function ValueInPLNInput({ value, onChange }) {
    const inputRef = (0, react_1.useRef)(null);
    function formatValue(value) {
        return new Intl.NumberFormat('pl-PL', {
            style: 'decimal',
            minimumFractionDigits: 2,
        }).format(parseFloat(value) || 0);
    }
    ;
    function handleInputChange(e) {
        const newValue = e.target.value.replace(/\s/g, '');
        const cursorPosition = e.target.selectionStart;
        onChange(newValue);
        if (inputRef.current && cursorPosition) {
            inputRef.current.setSelectionRange(cursorPosition, cursorPosition);
        }
    }
    ;
    function handleInputBlur() {
        onChange(formatValue(value));
    }
    ;
    return (react_1.default.createElement(react_bootstrap_1.Form.Group, { controlId: "valueInPLN" },
        react_1.default.createElement(react_bootstrap_1.Form.Label, null, "Warto\u015B\u0107 w PLN"),
        react_1.default.createElement(react_bootstrap_1.Form.Control, { type: "text", name: "value", value: value, onChange: handleInputChange, onBlur: handleInputBlur, ref: inputRef })));
}
exports.ValueInPLNInput = ValueInPLNInput;
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
