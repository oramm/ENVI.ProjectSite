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
exports.SendOfferModalBody = void 0;
const react_1 = __importStar(require("react"));
const FormContext_1 = require("../../../../View/Modals/FormContext");
const react_bootstrap_1 = require("react-bootstrap");
const GenericComponents_1 = require("../../../../View/Modals/CommonFormComponents/GenericComponents");
const OtherAttributesSelectors_1 = require("../../../../View/Modals/CommonFormComponents/OtherAttributesSelectors");
const BussinesObjectSelectors_1 = require("../../../../View/Modals/CommonFormComponents/BussinesObjectSelectors");
const OffersController_1 = require("../../OffersController");
const MainSetupReact_1 = __importDefault(require("../../../../React/MainSetupReact"));
const CommonComponentsController_1 = require("../../../../View/Resultsets/CommonComponentsController");
function SendOfferModalBody({ initialData }) {
    const { register, reset, formState: { errors }, trigger, } = (0, FormContext_1.useFormContext)();
    const isAnotherOffer = initialData?._lastEvent?.eventType === MainSetupReact_1.default.OfferEventType.SEND;
    (0, react_1.useEffect)(() => {
        const resetData = {
            _newEvent: {
                comment: initialData?._lastEvent?.comment || "",
                additionalMessage: initialData?._lastEvent?.additionalMessage || "",
                _recipients: initialData?._lastEvent?.eventType === MainSetupReact_1.default.OfferEventType.SEND
                    ? initialData?._lastEvent?._recipients
                    : undefined,
                _gdFilesBasicData: undefined,
            },
        };
        reset(resetData);
        trigger();
    }, [initialData, reset]);
    if (!initialData?.gdFolderId) {
        throw new Error("Brak przypisanego folderu oferty");
    }
    function renderAnotherOfferFileInstrutions() {
        return (react_1.default.createElement(react_bootstrap_1.Form.Text, { className: "text-muted" },
            react_1.default.createElement("div", null, "Wybierz z folderu oferty na Dysku Google pliki, kt\u00F3re chcesz przes\u0142a\u0107 wraz z ofert\u0105. Mo\u017Cesz wybra\u0107 wi\u0119cej ni\u017C jeden.")));
    }
    return (react_1.default.createElement(react_1.default.Fragment, null,
        react_1.default.createElement(react_bootstrap_1.Form.Group, { controlId: "_recipients", className: "mb-4" },
            react_1.default.createElement(react_bootstrap_1.Form.Label, null, "Adresaci maila"),
            react_1.default.createElement(BussinesObjectSelectors_1.PersonSelector, { name: "_newEvent._recipients", multiple: true, repository: OffersController_1.personsRepository, allowNew: false }),
            react_1.default.createElement(react_bootstrap_1.Form.Text, { muted: true },
                react_1.default.createElement("div", null, "Mo\u017Cesz wybra\u0107 osoby z listy, albo wpisa\u0107 adresy mailowe r\u0119cznie (jako osobne niebieskie bloczki)"))),
        react_1.default.createElement(react_bootstrap_1.Form.Group, { controlId: "additionalMessage", className: "mb-4" },
            react_1.default.createElement(react_bootstrap_1.Form.Label, null, "Dodatkowa informacja do szablonu maila"),
            react_1.default.createElement(react_bootstrap_1.Form.Control, { as: "textarea", rows: 3, placeholder: "Pole opcjonalne", isValid: !(0, CommonComponentsController_1.hasError)(errors, "_newEvent.additionalMessage"), isInvalid: (0, CommonComponentsController_1.hasError)(errors, "_newEvent.additionalMessage"), ...register("_newEvent.additionalMessage") }),
            react_1.default.createElement(GenericComponents_1.ErrorMessage, { name: "_newEvent.additionalMessage", errors: errors }),
            react_1.default.createElement(react_bootstrap_1.Form.Text, { className: "text-muted" },
                react_1.default.createElement("div", null, "Wype\u0142nij to pole tylko je\u015Bli musisz doda\u0107 jak\u0105\u015B nietypow\u0105 informacj\u0119, kt\u00F3rej nie ma w za\u0142\u0105czonej ofercie. Ta informacja zostanie umieszczona w tre\u015Bci maila."))),
        react_1.default.createElement(react_bootstrap_1.Form.Group, { controlId: "comment", className: "mb-4" },
            react_1.default.createElement(react_bootstrap_1.Form.Label, null, "Komentarz prywatny"),
            react_1.default.createElement(react_bootstrap_1.Form.Control, { as: "textarea", rows: 3, placeholder: "Pole opcjonalne", isValid: !(0, CommonComponentsController_1.hasError)(errors, "_newEvent.comment"), isInvalid: (0, CommonComponentsController_1.hasError)(errors, "_newEvent.comment"), ...register("_newEvent.comment") }),
            react_1.default.createElement(GenericComponents_1.ErrorMessage, { name: "_newEvent.comment", errors: errors }),
            react_1.default.createElement(react_bootstrap_1.Form.Text, { className: "text-muted" },
                react_1.default.createElement("div", null, isAnotherOffer ? (react_1.default.createElement(react_1.default.Fragment, null,
                    "UWAGA oferta by\u0142a juz wys\u0142ana $",
                    initialData._lastEvent.versionNumber,
                    " razy. Podaj wyj\u0105\u015Bnienie wewn\u0119trzne dla ENVI ",
                    react_1.default.createElement("br", null))) : ("Wypełnij to pole tylko jeśli masz komentarz wewnętrzy na potrzeby ENVI - nie będzie on wysłany do Klienta.")))),
        react_1.default.createElement(OtherAttributesSelectors_1.GdFilesSelector, { showValidationInfo: true, name: "_newEvent._gdFilesBasicData", contextData: initialData, attentionRequiredFileNames: initialData?._lastEvent?._gdFilesBasicData?.map((file) => file.name), multiple: true }),
        react_1.default.createElement(react_bootstrap_1.Form.Text, { className: "text-muted" }, isAnotherOffer ? (renderAnotherOfferFileInstrutions()) : (react_1.default.createElement("div", null, "Wybierz z folderu oferty na Dysku Google pliki, kt\u00F3re chcesz przes\u0142a\u0107 wraz z ofert\u0105. Mo\u017Cesz wybra\u0107 wi\u0119cej ni\u017C jeden.")))));
}
exports.SendOfferModalBody = SendOfferModalBody;
