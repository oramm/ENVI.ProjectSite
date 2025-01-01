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
const FilterableTable_1 = __importDefault(require("../../View/Resultsets/FilterableTable/FilterableTable"));
const OffersController_1 = require("./OffersController");
const OfferFilterBody_1 = require("./OfferFilterBody");
const OfferModalButtons_1 = require("./Modals/OfferModalButtons");
const react_fontawesome_1 = require("@fortawesome/react-fontawesome");
const free_solid_svg_icons_1 = require("@fortawesome/free-solid-svg-icons");
const CommonComponents_1 = require("../../View/Resultsets/CommonComponents");
const react_bootstrap_1 = require("react-bootstrap");
const OfferBondModalButtons_1 = require("./OfferBonds/Modals/OfferBondModalButtons");
const Tools_1 = __importDefault(require("../../React/Tools"));
const GeneralModalButtons_1 = require("../../View/Modals/GeneralModalButtons");
const OfferModalBodiesPartial_1 = require("./Modals/OfferModalBodiesPartial");
const OfferValidationSchema_1 = require("./Modals/OfferValidationSchema");
const FilterableTableContext_1 = require("../../View/Resultsets/FilterableTable/FilterableTableContext");
const ToolsDate_1 = __importDefault(require("../../React/ToolsDate"));
const MainSetupReact_1 = __importDefault(require("../../React/MainSetupReact"));
const SendOfferModalButtons_1 = require("./Modals/SendOffer/SendOfferModalButtons");
function OffersSearch({ title }) {
    function renderEntityData(offer) {
        return (react_1.default.createElement(react_1.default.Fragment, null,
            react_1.default.createElement("div", null, offer.employerName)));
    }
    function hasInvitationMailId(offer) {
        return offer.invitationMailId ? true : false;
    }
    function renderIcons(offer) {
        const offerTypeIcon = offer.isOur ? free_solid_svg_icons_1.faHome : free_solid_svg_icons_1.faFileLines;
        return (react_1.default.createElement(react_1.default.Fragment, null,
            react_1.default.createElement(react_fontawesome_1.FontAwesomeIcon, { icon: offerTypeIcon, size: "sm" }),
            hasInvitationMailId(offer) && react_1.default.createElement(react_fontawesome_1.FontAwesomeIcon, { icon: free_solid_svg_icons_1.faReply, size: "sm" })));
    }
    function renderRowContent(offer, isActive = false) {
        if (!offer.submissionDeadline)
            throw new Error("Brak terminu składania oferty");
        return (react_1.default.createElement(react_1.default.Fragment, null,
            react_1.default.createElement("div", { className: "d-flex align-items-center gap-1 mb-2" },
                renderIcons(offer),
                react_1.default.createElement("h5", { className: "mb-0" },
                    offer._type.name,
                    " ",
                    offer._city.name,
                    " | ",
                    renderTenderLink(offer) ?? offer.alias,
                    " ",
                    react_1.default.createElement("small", null, renderStatus(offer)))),
            renderEntityData(offer),
            react_1.default.createElement("div", { className: "mb-2" }),
            react_1.default.createElement("div", { className: "mb-2" },
                react_1.default.createElement("span", { className: "text-muted" }, "Termin sk\u0142adania:"),
                " ",
                react_1.default.createElement("span", { className: "fw-bold" }, offer.submissionDeadline),
                react_1.default.createElement("span", null,
                    " ",
                    renderDaysLeft(offer)),
                react_1.default.createElement("span", { className: "ml-3" }, " Forma wysy\u0142ki:"),
                " ",
                react_1.default.createElement("span", { className: "fw-bold" }, offer.form)),
            react_1.default.createElement("div", { className: "text-muted", style: { whiteSpace: "pre-line" } },
                react_1.default.createElement("p", null, offer.description),
                react_1.default.createElement("p", null, offer.comment)),
            renderSendOfferModalButton(offer, isActive),
            " ",
            react_1.default.createElement(ExportToPDFButtonWithError, { offer: offer, isActive: isActive }),
            renderOfferBond(offer, isActive),
            renderLastEvent(offer)));
    }
    function renderSendOfferModalButton(offer, isActive) {
        if (!offer.isOur || !isActive)
            return null;
        if (offer.form !== "Email")
            return null;
        if (offer._lastEvent?.versionNumber)
            return react_1.default.createElement(SendOfferModalButtons_1.SendAnotherOfferModalButton, { modalProps: { onEdit: () => { }, initialData: offer } });
        return react_1.default.createElement(SendOfferModalButtons_1.SendOfferModalButton, { modalProps: { onEdit: () => { }, initialData: offer } });
    }
    function ExportToPDFButtonWithError({ offer, isActive }) {
        const [error, setError] = (0, react_1.useState)(null);
        (0, react_1.useEffect)(() => {
            if (error) {
                console.log("Error zaktualizowany:", error.message);
            }
        }, [error]);
        if (!offer.isOur || !isActive)
            return null;
        return (react_1.default.createElement(react_1.default.Fragment, null,
            react_1.default.createElement(OfferModalButtons_1.ExportOurOfferToPDFButton, { onError: (error) => setError(error), ourOffer: offer }),
            error && (react_1.default.createElement(react_bootstrap_1.Alert, { dismissible: true, variant: "danger", className: "mt-2", onClose: () => setError(null) }, error.message))));
    }
    function renderLastEvent(offer) {
        if (!offer._lastEvent)
            return null;
        const _recipients = offer._lastEvent._recipients?.map((r) => r._nameSurnameEmail).join(", ") || "";
        const fileNames = offer._lastEvent._gdFilesBasicData?.map((f) => f.name).join(", ") || "";
        const offerVersion = offer._lastEvent.versionNumber ? ` | wersja: ${offer._lastEvent.versionNumber}` : "";
        return (react_1.default.createElement("div", { className: "text-muted" },
            react_1.default.createElement("span", { className: "fw-bold" }, offer._lastEvent.eventType),
            " ",
            ToolsDate_1.default.formatTime(offer._lastEvent._lastUpdated),
            " przez ",
            offer._lastEvent._editor.name,
            " ",
            offer._lastEvent._editor.surname,
            " ",
            _recipients ? `do: ${_recipients}` : "",
            " ",
            fileNames ? ` | wysłane pliki: ${fileNames}` : "",
            " ",
            offerVersion,
            offer.isOur && !offer.invitationMailId && (react_1.default.createElement(react_1.default.Fragment, null,
                react_1.default.createElement("span", null, " | "),
                react_1.default.createElement("span", { className: "text-info" }, " Utworzono na podstawie maila")))));
    }
    function renderDaysLeft(offer) {
        if (!offer.submissionDeadline)
            return null;
        if (!offer.status)
            return null;
        if (![MainSetupReact_1.default.OfferStatus.DECISION_PENDING, MainSetupReact_1.default.OfferStatus.TO_DO].includes(offer.status))
            return null;
        const daysLeft = ToolsDate_1.default.countDaysLeftTo(offer.submissionDeadline);
        return react_1.default.createElement(CommonComponents_1.DaysLeftBadge, { daysLeft: daysLeft });
    }
    function renderTenderLink(offer) {
        if (!("tenderUrl" in offer) || !offer.tenderUrl)
            return null;
        return (react_1.default.createElement("a", { href: offer.tenderUrl, target: "_blank", rel: "noreferrer", className: "text-primary text-decoration-none" }, offer.alias));
    }
    function renderStatus(offer) {
        if (!offer.status)
            return react_1.default.createElement(react_bootstrap_1.Alert, { variant: "danger" }, "Brak statusu");
        const { handleEditObject } = (0, FilterableTableContext_1.useFilterableTableContext)();
        return (react_1.default.createElement(GeneralModalButtons_1.PartialEditTrigger, { modalProps: {
                initialData: offer,
                modalTitle: "Edycja statusu",
                repository: OffersController_1.offersRepository,
                ModalBodyComponent: OfferModalBodiesPartial_1.OfferModalBodyStatus,
                onEdit: handleEditObject,
                fieldsToUpdate: ["status"],
                makeValidationSchema: OfferValidationSchema_1.makeOfferStatusValidationSchema,
            } },
            react_1.default.createElement(CommonComponents_1.OfferStatusBadge, { status: offer.status })));
    }
    function renderOfferBond(offer, isActive) {
        if (offer.isOur)
            return null;
        if (!offer._offerBond)
            return (isActive && (react_1.default.createElement(OfferBondModalButtons_1.OfferBondAddNewModalButton, { modalProps: { onEdit: () => { }, initialData: offer, contextData: offer } })));
        return (react_1.default.createElement(react_bootstrap_1.Card, { className: "mt-2 mb-2", style: { whiteSpace: "pre-line" } },
            react_1.default.createElement(react_bootstrap_1.Card.Body, null,
                react_1.default.createElement("div", { className: "card-title h6" },
                    "Wadium ",
                    Tools_1.default.formatNumber(offer._offerBond.value),
                    " ",
                    offer._city.name,
                    react_1.default.createElement("small", null,
                        react_1.default.createElement(CommonComponents_1.OfferBondStatusBadge, { status: offer._offerBond.status }))),
                react_1.default.createElement(react_bootstrap_1.Card.Text, null,
                    offer._offerBond.form,
                    " ",
                    offer._offerBond.form === "Gwarancja" && react_1.default.createElement(react_1.default.Fragment, null,
                        "wa\u017Cna do: ",
                        offer._offerBond.expiryDate),
                    react_1.default.createElement("div", null, offer._offerBond.paymentData),
                    react_1.default.createElement("div", null, offer._offerBond.comment)),
                isActive && renderOfferBondMenu(offer))));
    }
    function renderOfferBondMenu(offer) {
        return (react_1.default.createElement("div", null,
            react_1.default.createElement(OfferBondModalButtons_1.OfferBondEditModalButton, { modalProps: { onEdit: () => { }, initialData: offer, contextData: offer }, buttonProps: { layout: "horizontal" } }),
            " ",
            react_1.default.createElement(OfferBondModalButtons_1.OfferBondDeleteModalButton, { modalProps: { onEdit: () => { }, initialData: offer, contextData: offer }, buttonProps: { layout: "horizontal" } })));
    }
    return (react_1.default.createElement(FilterableTable_1.default, { id: "Offers", title: title, FilterBodyComponent: OfferFilterBody_1.OffersFilterBody, tableStructure: [
            //{ renderThBody: () => <i className="fa fa-inbox fa-lg"></i>, renderTdBody: renderIcons },
            { header: undefined, renderTdBody: renderRowContent },
        ], AddNewButtonComponents: [OfferModalButtons_1.OurOfferAddNewModalButton, OfferModalButtons_1.ExternalOfferAddNewModalButton], EditButtonComponent: OfferModalButtons_1.OfferEditModalButton, isDeletable: true, repository: OffersController_1.offersRepository, selectedObjectRoute: "/offer/" }));
}
exports.default = OffersSearch;
