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
exports.GdFilesSelector = exports.OfferFormSelectFormElement = exports.OfferBidProcedureSelectFormElement = void 0;
const react_1 = __importStar(require("react"));
require("react-bootstrap-typeahead/css/Typeahead.css");
require("../../../Css/styles.css");
const MainSetupReact_1 = __importDefault(require("../../../React/MainSetupReact"));
const GenericComponents_1 = require("./GenericComponents");
const react_bootstrap_1 = require("react-bootstrap");
const react_hook_form_1 = require("react-hook-form");
const react_bootstrap_typeahead_1 = require("react-bootstrap-typeahead");
const FormContext_1 = require("../FormContext");
const ToolsDate_1 = __importDefault(require("../../../React/ToolsDate"));
const CommonComponentsController_1 = require("../../Resultsets/CommonComponentsController");
const react_fontawesome_1 = require("@fortawesome/react-fontawesome");
const free_solid_svg_icons_1 = require("@fortawesome/free-solid-svg-icons");
function OfferBidProcedureSelectFormElement({ showValidationInfo = true, name = "bidProcedure", as, }) {
    const options = Object.entries(MainSetupReact_1.default.OfferBidProcedure).map(([key, value]) => value);
    return (react_1.default.createElement(GenericComponents_1.SelectTextOptionFormElement, { options: options, showValidationInfo: showValidationInfo, name: name, as: as, label: "Procedura" }));
}
exports.OfferBidProcedureSelectFormElement = OfferBidProcedureSelectFormElement;
function OfferFormSelectFormElement({ showValidationInfo = true, name = "form", as }) {
    const options = Object.entries(MainSetupReact_1.default.OfferForm).map(([key, value]) => value);
    return (react_1.default.createElement(GenericComponents_1.SelectTextOptionFormElement, { options: options, showValidationInfo: showValidationInfo, name: name, as: as, label: "Forma wysy\u0142ki" }));
}
exports.OfferFormSelectFormElement = OfferFormSelectFormElement;
function GdFilesSelector({ contextData, attentionRequiredFileNames = [], showValidationInfo = true, multiple = true, name = "_gdFilesBasicData", }) {
    const { control, setValue, getValues, formState: { errors }, } = (0, FormContext_1.useFormContext)();
    const [options, setOptions] = (0, react_1.useState)([]); // Inicjalizujemy z pustą tablicą
    const label = "Pliki z Dysku Google";
    // Jednorazowe pobieranie danych z serwera
    (0, react_1.useEffect)(() => {
        const fetchData = async () => {
            try {
                const response = await fetch(`${MainSetupReact_1.default.serverUrl}getFilesDataFromGdFolder`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    credentials: "include",
                    body: JSON.stringify(contextData),
                });
                const data = await response.json();
                if (!Array.isArray(data)) {
                    throw new Error("Dane z serwera nie są tablicą");
                }
                setOptions(data || []);
            }
            catch (error) {
                console.error("Błąd podczas pobierania danych:", error);
            }
        };
        fetchData();
    }, [contextData, setValue, multiple, name, getValues]);
    function handleOnChange(selectedOptions, field) {
        const valueToBeSent = multiple ? selectedOptions : selectedOptions[0];
        setValue(name, valueToBeSent);
        field.onChange(valueToBeSent);
    }
    function renderOption(option) {
        const formattedDate = ToolsDate_1.default.formatTime(option.modifiedTime);
        const isAttentionRequired = attentionRequiredFileNames.some((fileName) => option.name.toLowerCase() === fileName.toLowerCase());
        return isAttentionRequired
            ? renderAttentionRequiredOption(option.name, formattedDate, option.lastModifyingUser.displayName)
            : renderNormalOption(option.name, formattedDate, option.lastModifyingUser.displayName);
    }
    function renderAttentionRequiredOption(name, formattedDate, displayName) {
        return (react_1.default.createElement("div", null,
            react_1.default.createElement("span", { className: "text-warning" }, name),
            react_1.default.createElement("div", { className: "text-warning small" },
                "Zmienione ostatnio ",
                formattedDate,
                " przez ",
                displayName),
            react_1.default.createElement(react_fontawesome_1.FontAwesomeIcon, { icon: free_solid_svg_icons_1.faExclamationTriangle }),
            " ",
            react_1.default.createElement("span", null, "Plik by\u0142 ostatnio wys\u0142any")));
    }
    function renderNormalOption(name, formattedDate, displayName) {
        return (react_1.default.createElement("div", null,
            react_1.default.createElement("span", null, name),
            react_1.default.createElement("div", { className: "text-muted small" },
                "Zmienione ostatnio ",
                formattedDate,
                " przez ",
                displayName)));
    }
    return (react_1.default.createElement(react_bootstrap_1.Form.Group, { controlId: name },
        react_1.default.createElement(react_bootstrap_1.Form.Label, null, label),
        react_1.default.createElement(react_1.default.Fragment, null,
            react_1.default.createElement(react_hook_form_1.Controller, { name: name, control: control, render: ({ field }) => (react_1.default.createElement(react_bootstrap_typeahead_1.Typeahead, { id: `${name}-controlled`, labelKey: "name" // Klucz do wyświetlania nazw plików
                    , multiple: multiple, options: options, onChange: (items) => handleOnChange(items, field), selected: field.value ? (multiple ? field.value : [field.value]) : [], placeholder: "-- Wybierz plik --", isValid: showValidationInfo ? !(0, CommonComponentsController_1.hasError)(errors, name) : undefined, isInvalid: showValidationInfo ? (0, CommonComponentsController_1.hasError)(errors, name) : undefined, renderMenuItemChildren: (option, props, index) => {
                        const optionTyped = option;
                        return renderOption(optionTyped);
                    } })) }),
            react_1.default.createElement(GenericComponents_1.ErrorMessage, { errors: errors, name: name }))));
}
exports.GdFilesSelector = GdFilesSelector;
