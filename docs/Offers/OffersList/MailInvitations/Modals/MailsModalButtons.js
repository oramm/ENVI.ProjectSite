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
exports.ShowMailsToCheckButton = exports.AddOurOfferFromMailButton = exports.SetAsGoodToOfferButton = void 0;
const react_1 = __importStar(require("react"));
const OffersController_1 = require("../../OffersController");
const react_bootstrap_1 = require("react-bootstrap");
const CommonComponents_1 = require("../../../../View/Resultsets/CommonComponents");
const MailsToCheckList_1 = __importDefault(require("../MailsToCheckList"));
const OfferModalButtons_1 = require("../../Modals/OfferModalButtons");
const ToolsDate_1 = __importDefault(require("../../../../React/ToolsDate"));
function SetAsGoodToOfferButton({ onError }) {
    const [requestPending, setRequestPending] = (0, react_1.useState)(false);
    const [showSuccessToast, setShowSuccessToast] = (0, react_1.useState)(false);
    async function handleClick() {
        try {
            setRequestPending(true);
            const currentItem = { ...OffersController_1.mailsToCheckRepository.currentItems[0] };
            await OffersController_1.mailsToCheckRepository.addNewItem(currentItem);
            setRequestPending(false);
            setShowSuccessToast(true);
        }
        catch (error) {
            if (error instanceof Error) {
                setRequestPending(false);
                onError(error);
            }
        }
    }
    return (react_1.default.createElement(react_1.default.Fragment, null,
        react_1.default.createElement(react_bootstrap_1.Button, { key: "Do ofertowania", variant: "outline-secondary", size: "sm", onClick: handleClick },
            "Do ofertowania",
            " ",
            requestPending && react_1.default.createElement(react_bootstrap_1.Spinner, { as: "span", animation: "border", size: "sm", role: "status", "aria-hidden": "true" })),
        react_1.default.createElement(CommonComponents_1.SuccessToast, { message: "Mail przypisany do ofertowania", show: showSuccessToast, onClose: () => setShowSuccessToast(false) })));
}
exports.SetAsGoodToOfferButton = SetAsGoodToOfferButton;
function AddOurOfferFromMailButton({ onError }) {
    const mailData = OffersController_1.mailInvitationsRepository.currentItems[0];
    if (!mailData) {
        console.log("mailInvitationsRepository.currentItems[0] is null");
        return null;
    }
    const modalSubtitle = `na podstawie maila od <strong>${mailData.from}</strong> z <strong>${ToolsDate_1.default.formatTime(mailData.date)}</strong><br>${mailData.subject}`;
    async function handleClick() {
        try {
            const currentItem = { ...OffersController_1.mailInvitationsRepository.currentItems[0] };
            await OffersController_1.mailsToCheckRepository.editItem(currentItem);
        }
        catch (error) {
            if (error instanceof Error) {
                onError(error);
            }
        }
    }
    return (react_1.default.createElement(OfferModalButtons_1.OurOfferAddNewModalButton, { modalProps: {
            contextData: { mail: { ...OffersController_1.mailInvitationsRepository.currentItems[0] } },
            onAddNew: handleClick,
            modalSubtitle,
        }, buttonProps: { buttonCaption: "Rejestruj ofertę" } }));
}
exports.AddOurOfferFromMailButton = AddOurOfferFromMailButton;
function ShowMailsToCheckButton() {
    const [showForm, setShowForm] = (0, react_1.useState)(false);
    function handleOpen() {
        setShowForm(true);
    }
    function handleClose() {
        setShowForm(false);
    }
    return (react_1.default.createElement(react_1.default.Fragment, null,
        react_1.default.createElement(react_bootstrap_1.Button, { key: "Sprawd\u017A poczt\u0119", variant: "outline-secondary", size: "sm", onClick: handleOpen }, "Sprawd\u017A poczt\u0119"),
        react_1.default.createElement(MailsToCheckList_1.default, { show: showForm, handleClose: handleClose })));
}
exports.ShowMailsToCheckButton = ShowMailsToCheckButton;
