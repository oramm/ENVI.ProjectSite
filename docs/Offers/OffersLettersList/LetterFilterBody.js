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
exports.LettersFilterBody = void 0;
const react_1 = __importStar(require("react"));
const CommonFormComponents_1 = require("../../View/Modals/CommonFormComponents");
const react_bootstrap_1 = require("react-bootstrap");
const FormContext_1 = require("../../View/Modals/FormContext");
const MainSetupReact_1 = __importDefault(require("../../React/MainSetupReact"));
const LettersController_1 = require("./LettersController");
function LettersFilterBody() {
    const { register, watch, setValue } = (0, FormContext_1.useFormContext)();
    const _offer = watch("_offer");
    const _case = watch("_case");
    (0, react_1.useEffect)(() => {
        setValue("_case", undefined);
    }, [_offer]);
    return (react_1.default.createElement(react_1.default.Fragment, null,
        react_1.default.createElement(react_bootstrap_1.Row, { xl: 12, md: 6, xs: 12 },
            react_1.default.createElement(react_bootstrap_1.Form.Group, { as: react_bootstrap_1.Col, md: 2 },
                react_1.default.createElement(react_bootstrap_1.Form.Label, null, "Szukana fraza"),
                react_1.default.createElement(react_bootstrap_1.Form.Control, { type: "text", placeholder: "Wpisz tekst", ...register("searchText") })),
            react_1.default.createElement(react_bootstrap_1.Form.Group, { as: react_bootstrap_1.Col, md: 2 },
                react_1.default.createElement(react_bootstrap_1.Form.Label, null, "Utworzono od"),
                react_1.default.createElement(react_bootstrap_1.Form.Control, { type: "date", defaultValue: MainSetupReact_1.default.LettersFilterInitState.CREATION_DATE_FROM, ...register("creationDateFrom") })),
            react_1.default.createElement(react_bootstrap_1.Form.Group, { as: react_bootstrap_1.Col, md: 2 },
                react_1.default.createElement(react_bootstrap_1.Form.Label, null, "Utworzono do"),
                react_1.default.createElement(react_bootstrap_1.Form.Control, { type: "date", defaultValue: MainSetupReact_1.default.LettersFilterInitState.CREATION_DATE_TO, ...register("creationDateTo") }))),
        react_1.default.createElement(react_bootstrap_1.Row, null,
            react_1.default.createElement(react_bootstrap_1.Form.Group, { as: react_bootstrap_1.Col, md: 12 },
                react_1.default.createElement(react_bootstrap_1.Form.Label, null, "Oferta"),
                react_1.default.createElement(CommonFormComponents_1.OfferSelectFormElement, { repository: LettersController_1.offersRepository, name: "_offer", showValidationInfo: false }))),
        _offer && (react_1.default.createElement(react_bootstrap_1.Row, null,
            react_1.default.createElement(react_bootstrap_1.Form.Group, { as: react_bootstrap_1.Col, md: 12 },
                react_1.default.createElement(react_bootstrap_1.Form.Label, null, "Sprawa"),
                react_1.default.createElement(CommonFormComponents_1.CaseSelectMenuElement, { name: "_case", repository: LettersController_1.casesRepository, showValidationInfo: false, _offer: _offer, multiple: false }))))));
}
exports.LettersFilterBody = LettersFilterBody;
