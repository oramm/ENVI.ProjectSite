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
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.OfferEditModalButton = OfferEditModalButton;
exports.OurOfferEditModalButton = OurOfferEditModalButton;
exports.OurOfferAddNewModalButton = OurOfferAddNewModalButton;
exports.ExternalOfferEditModalButton = ExternalOfferEditModalButton;
exports.ExternalOfferAddNewModalButton = ExternalOfferAddNewModalButton;
exports.ExportOurOfferToPDFButton = ExportOurOfferToPDFButton;
const react_1 = __importStar(require("react"));
const GeneralModalButtons_1 = require("../../../View/Modals/GeneralModalButtons");
const OfferValidationSchema_1 = require("./OfferValidationSchema");
const ExternalOfferModalBody_1 = require("./ExternalOfferModalBody");
const OurOfferModalBody_1 = require("./OurOfferModalBody");
const react_bootstrap_1 = require("react-bootstrap");
const CommonComponents_1 = require("../../../View/Resultsets/CommonComponents");
const OffersController_1 = require("../OffersController"); // tylko dla ExportOurOfferToPDFButton
/** przycisk i modal edycji Offer */
function OfferEditModalButton({ modalProps: { onEdit, initialData, repository }, buttonProps, }) {
    (0, react_1.useEffect)(() => {
        console.log("OfferEditModalButton initialData", initialData);
    }, [initialData]);
    return initialData.isOur ? (react_1.default.createElement(OurOfferEditModalButton, { modalProps: { onEdit, initialData, repository }, buttonProps: buttonProps })) : (react_1.default.createElement(ExternalOfferEditModalButton, { modalProps: { onEdit, initialData, repository }, buttonProps: buttonProps }));
}
function OurOfferEditModalButton({ modalProps: { onEdit, initialData, repository }, buttonProps, }) {
    return (react_1.default.createElement(GeneralModalButtons_1.GeneralEditModalButton, { modalProps: {
            onEdit: onEdit,
            ModalBodyComponent: OurOfferModalBody_1.OurOfferModalBody,
            modalTitle: "Edycja oferty - szablon ENVI",
            repository: repository,
            initialData: initialData,
            makeValidationSchema: OfferValidationSchema_1.makeOurOfferValidationSchema,
        }, buttonProps: {
            buttonVariant: "outline-success",
            ...buttonProps,
        } }));
}
function OurOfferAddNewModalButton({ modalProps: { onAddNew, contextData, modalSubtitle, repository }, buttonProps, }) {
    return (react_1.default.createElement(GeneralModalButtons_1.GeneralAddNewModalButton, { modalProps: {
            onAddNew: onAddNew,
            ModalBodyComponent: OurOfferModalBody_1.OurOfferModalBody,
            modalTitle: "Rejestruj ofertę - szablon ENVI",
            modalSubtitle,
            repository: repository,
            makeValidationSchema: OfferValidationSchema_1.makeOurOfferValidationSchema,
            contextData,
        }, buttonProps: {
            buttonCaption: "Rejestruj ENVI",
            buttonVariant: "outline-success",
            ...buttonProps,
        } }));
}
function ExternalOfferEditModalButton({ modalProps: { onEdit, initialData, repository }, buttonProps, }) {
    return (react_1.default.createElement(GeneralModalButtons_1.GeneralEditModalButton, { modalProps: {
            onEdit: onEdit,
            ModalBodyComponent: ExternalOfferModalBody_1.ExternalOfferModalBody,
            modalTitle: "Edycja oferty - formularz Zamawiającego",
            repository: repository,
            initialData: initialData,
            makeValidationSchema: OfferValidationSchema_1.makeOtherOfferValidationSchema,
        }, buttonProps: {
            ...buttonProps,
        } }));
}
function ExternalOfferAddNewModalButton({ modalProps: { onAddNew, repository }, buttonProps, }) {
    return (react_1.default.createElement(GeneralModalButtons_1.GeneralAddNewModalButton, { modalProps: {
            onAddNew,
            ModalBodyComponent: ExternalOfferModalBody_1.ExternalOfferModalBody,
            modalTitle: "Nowa oferta - formularz Zamawiającego",
            repository: repository,
            makeValidationSchema: OfferValidationSchema_1.makeOtherOfferValidationSchema,
        }, buttonProps: {
            buttonCaption: "Rejestruj ofertę",
            ...buttonProps,
        } }));
}
function ExportOurOfferToPDFButton({ onError, ourOffer, }) {
    const [requestPending, setRequestPending] = (0, react_1.useState)(false);
    const [showSuccessToast, setShowSuccessToast] = (0, react_1.useState)(false);
    async function handleClick() {
        try {
            setRequestPending(true);
            // UWAGA: tu nadal używamy offersRepository z OffersController, bo to nie jest modal edycji
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
