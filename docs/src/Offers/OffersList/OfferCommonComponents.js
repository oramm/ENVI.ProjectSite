"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OfferTenderLink = void 0;
const react_1 = __importDefault(require("react"));
function OfferTenderLink({ offer }) {
    if (!("tenderUrl" in offer) || !offer.tenderUrl)
        return react_1.default.createElement(react_1.default.Fragment, null, offer.alias);
    return (react_1.default.createElement("a", { href: offer.tenderUrl, target: "_blank", rel: "noreferrer", className: "text-primary text-decoration-none" }, offer.alias));
}
exports.OfferTenderLink = OfferTenderLink;
