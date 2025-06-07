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
const react_1 = __importStar(require("react"));
const react_bootstrap_1 = require("react-bootstrap");
const OffersSearch_1 = __importDefault(require("./OffersSearch"));
const MailsModalButtons_1 = require("./MailInvitations/Modals/MailsModalButtons");
const MailInvitationsList_1 = __importDefault(require("./MailInvitations/MailInvitationsList"));
function OffersMainView({ title }) {
    const [mails, setMails] = (0, react_1.useState)([]);
    const [activeKeys, setActiveKeys] = (0, react_1.useState)([]);
    (0, react_1.useEffect)(() => {
        document.title = title;
    }, [title]);
    (0, react_1.useEffect)(() => {
        setActiveKeys(mails.length > 0 ? ["0", "1"] : ["1"]);
    }, [mails]);
    function handleSelect(eventKey) {
        if (typeof eventKey !== "string")
            return;
        setActiveKeys((prevActiveKeys) => prevActiveKeys.includes(eventKey)
            ? prevActiveKeys.filter((key) => key !== eventKey)
            : [...prevActiveKeys, eventKey]);
    }
    return (react_1.default.createElement(react_1.default.Fragment, null,
        react_1.default.createElement(react_bootstrap_1.Container, null,
            react_1.default.createElement(react_bootstrap_1.Accordion, { className: "mt-3 mb-3", activeKey: activeKeys, onSelect: handleSelect },
                react_1.default.createElement(react_bootstrap_1.Accordion.Item, { eventKey: "0" },
                    react_1.default.createElement(react_bootstrap_1.Accordion.Header, null,
                        react_1.default.createElement("h3", null, "Oczekuj\u0105ce maile z zaproszeniami")),
                    react_1.default.createElement(react_bootstrap_1.Accordion.Body, null,
                        react_1.default.createElement("div", { className: "d-flex justify-content-end" },
                            react_1.default.createElement(MailsModalButtons_1.ShowMailsToCheckButton, null)),
                        react_1.default.createElement(MailInvitationsList_1.default, null))))),
        react_1.default.createElement(OffersSearch_1.default, { title: "Oferty" })));
}
exports.default = OffersMainView;
