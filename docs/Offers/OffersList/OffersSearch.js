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
function OffersSearch({ title }) {
    (0, react_1.useEffect)(() => {
        document.title = title;
    }, [title]);
    function renderEntityData(offer) {
        return (react_1.default.createElement(react_1.default.Fragment, null,
            react_1.default.createElement("div", null, offer.employerName),
            react_1.default.createElement("div", { className: "muted" }, offer._city.name)));
    }
    function renderIcon(offer) {
        offer = offer;
        const icon = offer.isOur ? free_solid_svg_icons_1.faHome : free_solid_svg_icons_1.faFileLines;
        return react_1.default.createElement(react_fontawesome_1.FontAwesomeIcon, { icon: icon, size: "lg" });
    }
    function renderNameDescription(offer, isActive = false) {
        return (react_1.default.createElement(react_1.default.Fragment, null,
            react_1.default.createElement("div", null,
                offer._type.name,
                " | ",
                renderTenderLink(offer) ?? offer.alias,
                " ",
                renderStatus(offer)),
            react_1.default.createElement("div", { className: "text-muted", style: { whiteSpace: "pre-line" } }, offer.description),
            renderOfferBond(offer, isActive)));
    }
    function renderOfferBond(offer, isActive) {
        if (offer.isOur)
            return null;
        if (!offer._offerBond)
            return (isActive && (react_1.default.createElement(OfferBondModalButtons_1.OfferBondAddNewModalButton, { modalProps: { onEdit: () => { }, initialData: offer, contextData: offer } })));
        return (react_1.default.createElement("div", { className: "mt-4 mb-4", style: { whiteSpace: "pre-line" } },
            react_1.default.createElement("h6", null,
                "Wadium ",
                Tools_1.default.formatNumber(offer._offerBond.value),
                " ",
                react_1.default.createElement(CommonComponents_1.OfferBondStatusBadge, { status: offer._offerBond.status })),
            offer._offerBond.form,
            " ",
            offer._offerBond.form === "Gwarancja" && react_1.default.createElement(react_1.default.Fragment, null,
                "wa\u017Cna do: ",
                offer._offerBond.expiryDate),
            react_1.default.createElement("div", null, offer._offerBond.paymentData),
            react_1.default.createElement("div", null, offer._offerBond.comment),
            isActive && renderOfferBondMenu(offer)));
    }
    function renderOfferBondMenu(offer) {
        return (react_1.default.createElement("div", null,
            react_1.default.createElement(OfferBondModalButtons_1.OfferBondEditModalButton, { modalProps: { onEdit: () => { }, initialData: offer, contextData: offer }, buttonProps: { layout: "horizontal" } }),
            " ",
            react_1.default.createElement(OfferBondModalButtons_1.OfferBondDeleteModalButton, { modalProps: { onEdit: () => { }, initialData: offer, contextData: offer }, buttonProps: { layout: "horizontal" } })));
    }
    function renderTenderLink(offer) {
        if (!("tenderUrl" in offer) || !offer.tenderUrl)
            return null;
        return (react_1.default.createElement("a", { href: offer.tenderUrl, target: "_blank", rel: "noreferrer", className: "text-primary text-decoration-none" }, offer.alias));
    }
    function renderStatus(offer) {
        if (!offer.status)
            return react_1.default.createElement(react_bootstrap_1.Alert, { variant: "danger" }, "Brak statusu");
        return react_1.default.createElement(CommonComponents_1.OfferStatusBadge, { status: offer.status });
    }
    return (react_1.default.createElement(FilterableTable_1.default, { id: "Offers", title: title, FilterBodyComponent: OfferFilterBody_1.OffersFilterBody, tableStructure: [
            { renderThBody: () => react_1.default.createElement("i", { className: "fa fa-inbox fa-lg" }), renderTdBody: renderIcon },
            { header: "Nazwa", renderTdBody: renderNameDescription },
            { header: "Zamawiający", renderTdBody: renderEntityData },
            { header: "Termin", objectAttributeToShow: "submissionDeadline" },
            { header: "Wysyłka", objectAttributeToShow: "form" },
        ], AddNewButtonComponents: [OfferModalButtons_1.OurOfferAddNewModalButton, OfferModalButtons_1.ExternalOfferAddNewModalButton], EditButtonComponent: OfferModalButtons_1.OfferEditModalButton, isDeletable: true, repository: OffersController_1.OffersRepository, selectedObjectRoute: "/offer/" }));
}
exports.default = OffersSearch;
