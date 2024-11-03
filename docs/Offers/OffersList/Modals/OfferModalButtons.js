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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExportOurOfferToPDFButton = exports.ExternalOfferAddNewModalButton = exports.ExternalOfferEditModalButton = exports.OurOfferAddNewModalButton = exports.OurOfferEditModalButton = exports.OfferEditModalButton = void 0;
const react_1 = __importStar(require("react"));
const GeneralModalButtons_1 = require("../../../View/Modals/GeneralModalButtons");
const OfferValidationSchema_1 = require("./OfferValidationSchema");
const ExternalOfferModalBody_1 = require("./ExternalOfferModalBody");
const OurOfferModalBody_1 = require("./OurOfferModalBody");
const OffersController_1 = require("../OffersController");
const react_bootstrap_1 = require("react-bootstrap");
const CommonComponents_1 = require("../../../View/Resultsets/CommonComponents");
/** przycisk i modal edycji Offer */
function OfferEditModalButton({ modalProps: { onEdit, initialData }, buttonProps, }) {
    (0, react_1.useEffect)(() => {
        console.log("OfferEditModalButton initialData", initialData);
    }, [initialData]);
    return initialData.isOur ? (react_1.default.createElement(OurOfferEditModalButton, { modalProps: { onEdit, initialData }, buttonProps: buttonProps })) : (react_1.default.createElement(ExternalOfferEditModalButton, { modalProps: { onEdit, initialData }, buttonProps: buttonProps }));
}
exports.OfferEditModalButton = OfferEditModalButton;
function OurOfferEditModalButton({ modalProps: { onEdit, initialData }, }) {
    return (react_1.default.createElement(GeneralModalButtons_1.GeneralEditModalButton, { modalProps: {
            onEdit: onEdit,
            ModalBodyComponent: OurOfferModalBody_1.OurOfferModalBody,
            modalTitle: "Edycja oferty - szablon ENVI",
            repository: OffersController_1.offersRepository,
            initialData: initialData,
            makeValidationSchema: OfferValidationSchema_1.makeOurOfferValidationSchema,
        }, buttonProps: {
            buttonVariant: "outline-success",
        } }));
}
exports.OurOfferEditModalButton = OurOfferEditModalButton;
function OurOfferAddNewModalButton({ modalProps: { onAddNew } }) {
    return (react_1.default.createElement(GeneralModalButtons_1.GeneralAddNewModalButton, { modalProps: {
            onAddNew: onAddNew,
            ModalBodyComponent: OurOfferModalBody_1.OurOfferModalBody,
            modalTitle: "Rejestruj ofertę - szablon ENVI",
            repository: OffersController_1.offersRepository,
            makeValidationSchema: OfferValidationSchema_1.makeOurOfferValidationSchema,
        }, buttonProps: {
            buttonCaption: "Rejestruj ENVI",
            buttonVariant: "outline-success",
        } }));
}
exports.OurOfferAddNewModalButton = OurOfferAddNewModalButton;
function ExternalOfferEditModalButton({ modalProps: { onEdit, initialData }, }) {
    return (react_1.default.createElement(GeneralModalButtons_1.GeneralEditModalButton, { modalProps: {
            onEdit: onEdit,
            ModalBodyComponent: ExternalOfferModalBody_1.ExternalOfferModalBody,
            modalTitle: "Edycja oferty - formularz Zamawiającego",
            repository: OffersController_1.offersRepository,
            initialData: initialData,
            makeValidationSchema: OfferValidationSchema_1.makeOtherOfferValidationSchema,
        }, buttonProps: {} }));
}
exports.ExternalOfferEditModalButton = ExternalOfferEditModalButton;
function ExternalOfferAddNewModalButton({ modalProps: { onAddNew }, }) {
    return (react_1.default.createElement(GeneralModalButtons_1.GeneralAddNewModalButton, { modalProps: {
            onAddNew: onAddNew,
            ModalBodyComponent: ExternalOfferModalBody_1.ExternalOfferModalBody,
            modalTitle: "Nowa oferta - formularz Zamawiającego",
            repository: OffersController_1.offersRepository,
            makeValidationSchema: OfferValidationSchema_1.makeOtherOfferValidationSchema,
        }, buttonProps: {
            buttonCaption: "Rejestruj ofertę",
        } }));
}
exports.ExternalOfferAddNewModalButton = ExternalOfferAddNewModalButton;
function ExportOurOfferToPDFButton({ onError, ourOffer, }) {
    const [requestPending, setRequestPending] = (0, react_1.useState)(false);
    const [showSuccessToast, setShowSuccessToast] = (0, react_1.useState)(false);
    async function handleClick() {
        try {
            setRequestPending(true);
            await OffersController_1.offersRepository.fetch("exportOurOfferToPDF", ourOffer);
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
        react_1.default.createElement(react_bootstrap_1.Button, { key: "Exportuj do PDF", variant: "outline-secondary", size: "sm", onClick: handleClick },
            "Exportuj do PDF",
            " ",
            requestPending && react_1.default.createElement(react_bootstrap_1.Spinner, { as: "span", animation: "border", size: "sm", role: "status", "aria-hidden": "true" })),
        react_1.default.createElement(CommonComponents_1.SuccessToast, { message: "Eksport do PDF zako\u0144czy\u0142 si\u0119 powodzeniem!", show: showSuccessToast, onClose: () => setShowSuccessToast(false) })));
}
exports.ExportOurOfferToPDFButton = ExportOurOfferToPDFButton;
