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
exports.InvoiceItemModalBody = void 0;
const react_1 = __importStar(require("react"));
const CommonFormComponents_1 = require("../../../View/Modals/CommonFormComponents");
const react_bootstrap_1 = require("react-bootstrap");
const FormContext_1 = require("../../../View/Modals/FormContext");
const InvoiceDetails_1 = require("../InvoiceDetails/InvoiceDetails");
const MainSetupReact_1 = __importDefault(require("../../../React/MainSetupReact"));
function InvoiceItemModalBody({ initialData }) {
    const { register, reset, formState: { errors }, trigger } = (0, FormContext_1.useFormContext)();
    const { invoice } = (0, InvoiceDetails_1.useInvoice)();
    (0, react_1.useEffect)(() => {
        console.log('InvoiceModalBody useEffect', initialData);
        const resetData = {
            _parent: initialData?._parent || invoice,
            description: initialData?.description || '',
            quantity: initialData?.quantity || 1,
            unitPrice: initialData?.unitPrice,
            vatTax: initialData?.vatTax || 23,
            _editor: MainSetupReact_1.default.getCurrentUserAsPerson(),
        };
        reset(resetData);
        trigger();
    }, [initialData, reset]);
    return (react_1.default.createElement(react_1.default.Fragment, null,
        react_1.default.createElement(react_bootstrap_1.Form.Group, { controlId: "description" },
            react_1.default.createElement(react_bootstrap_1.Form.Label, null, "Opis"),
            react_1.default.createElement(react_bootstrap_1.Form.Control, { as: "textarea", rows: 4, placeholder: "Dodaj komentarz", isValid: !errors?.description, isInvalid: !!errors?.description, ...register('description') }),
            react_1.default.createElement(CommonFormComponents_1.ErrorMessage, { name: 'description', errors: errors })),
        react_1.default.createElement(react_bootstrap_1.Row, null,
            react_1.default.createElement(react_bootstrap_1.Form.Group, { as: react_bootstrap_1.Col, controlId: "quantity" },
                react_1.default.createElement(react_bootstrap_1.Form.Label, null, "Ilo\u015B\u0107"),
                react_1.default.createElement(react_bootstrap_1.Form.Control, { type: "number", min: "1", isValid: !errors?.quantity, isInvalid: !!errors?.quantity, ...register('quantity') }),
                react_1.default.createElement(CommonFormComponents_1.ErrorMessage, { name: 'quantity', errors: errors })),
            react_1.default.createElement(react_bootstrap_1.Form.Group, { as: react_bootstrap_1.Col, controlId: "unitPrice" },
                react_1.default.createElement(react_bootstrap_1.Form.Label, null, "Cena jedn."),
                react_1.default.createElement(CommonFormComponents_1.ValueInPLNInput, { keyLabel: 'unitPrice' })),
            react_1.default.createElement(react_bootstrap_1.Form.Group, { as: react_bootstrap_1.Col, controlId: "vatTax" },
                react_1.default.createElement(react_bootstrap_1.Form.Label, null, "Stawka VAT"),
                react_1.default.createElement(react_bootstrap_1.Form.Control, { type: "number", min: "1", isValid: !errors?.vatTax, isInvalid: !!errors?.vatTax, ...register('vatTax') }),
                react_1.default.createElement(CommonFormComponents_1.ErrorMessage, { name: 'vatTax', errors: errors })))));
}
exports.InvoiceItemModalBody = InvoiceItemModalBody;
