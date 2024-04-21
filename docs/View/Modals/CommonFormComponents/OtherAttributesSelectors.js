"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OfferFormSelectFormElement = exports.OfferBidProcedureSelectFormElement = void 0;
const react_1 = __importDefault(require("react"));
require("react-bootstrap-typeahead/css/Typeahead.css");
require("../../../Css/styles.css");
const MainSetupReact_1 = __importDefault(require("../../../React/MainSetupReact"));
const GenericComponents_1 = require("./GenericComponents");
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
