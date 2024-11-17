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
exports.OfferBondModalBody = void 0;
const react_1 = __importStar(require("react"));
const FormContext_1 = require("../../../../View/Modals/FormContext");
const react_bootstrap_1 = require("react-bootstrap");
const GenericComponents_1 = require("../../../../View/Modals/CommonFormComponents/GenericComponents");
const StatusSelectors_1 = require("../../../../View/Modals/CommonFormComponents/StatusSelectors");
const CommonComponentsController_1 = require("../../../../View/Resultsets/CommonComponentsController");
function OfferBondModalBody({ isEditing, initialData }) {
    const { register, reset, formState: { errors }, trigger, } = (0, FormContext_1.useFormContext)();
    const _offerBond = initialData?._offerBond;
    (0, react_1.useEffect)(() => {
        const resetData = {
            _offerBond: {
                id: _offerBond?.id,
                value: _offerBond?.value,
                form: _offerBond?.form,
                paymentData: _offerBond?.paymentData || "",
                comment: _offerBond?.comment || "",
                status: _offerBond?.status,
                expiryDate: _offerBond?.expiryDate || null,
            },
        };
        reset(resetData);
        trigger();
    }, [initialData, reset, trigger]);
    (0, react_1.useEffect)(() => {
        console.log(errors); // This logs only when 'errors' object changes
    }, [errors]);
    return (react_1.default.createElement(react_1.default.Fragment, null,
        react_1.default.createElement(react_bootstrap_1.Row, null,
            react_1.default.createElement(react_bootstrap_1.Form.Group, { as: react_bootstrap_1.Col, controlId: "value" },
                react_1.default.createElement(react_bootstrap_1.Form.Label, null, "Warto\u015B\u0107 netto w PLN"),
                react_1.default.createElement(GenericComponents_1.ValueInPLNInput, { name: "_offerBond.value" })),
            react_1.default.createElement(StatusSelectors_1.OfferBondFormSelector, { as: react_bootstrap_1.Col, name: "_offerBond.form", label: "Forma" })),
        react_1.default.createElement(react_bootstrap_1.Form.Group, { controlId: "paymentData" },
            react_1.default.createElement(react_bootstrap_1.Form.Label, null, "Dane do przelewu"),
            react_1.default.createElement(react_bootstrap_1.Form.Control, { as: "textarea", rows: 3, placeholder: "Wpisz dane do op\u0142acenia wadium", isValid: !(0, CommonComponentsController_1.hasError)(errors, "_offerBond.paymentData"), isInvalid: (0, CommonComponentsController_1.hasError)(errors, "_offerBond.paymentData"), ...register("_offerBond.paymentData") }),
            react_1.default.createElement(GenericComponents_1.ErrorMessage, { name: "_offerBond.paymentData", errors: errors })),
        react_1.default.createElement(react_bootstrap_1.Form.Group, { controlId: "comment" },
            react_1.default.createElement(react_bootstrap_1.Form.Label, null, "Uwagi"),
            react_1.default.createElement(react_bootstrap_1.Form.Control, { as: "textarea", rows: 3, placeholder: "Add a comment", isValid: !(0, CommonComponentsController_1.hasError)(errors, "_offerBond.comment"), isInvalid: (0, CommonComponentsController_1.hasError)(errors, "_offerBond.comment"), ...register("_offerBond.comment") }),
            react_1.default.createElement(GenericComponents_1.ErrorMessage, { name: "_offerBond.comment", errors: errors })),
        react_1.default.createElement(react_bootstrap_1.Form.Group, { as: react_bootstrap_1.Col, controlId: "expiryDate" },
            react_1.default.createElement(react_bootstrap_1.Form.Label, null, "Data wa\u017Cno\u015Bci"),
            react_1.default.createElement(react_bootstrap_1.Form.Control, { type: "date", isValid: !(0, CommonComponentsController_1.hasError)(errors, "_offerBond.expiryDate"), isInvalid: (0, CommonComponentsController_1.hasError)(errors, "_offerBond.expiryDate"), ...register("_offerBond.expiryDate") }),
            react_1.default.createElement(GenericComponents_1.ErrorMessage, { name: "_offerBond.expiryDate", errors: errors })),
        react_1.default.createElement(react_bootstrap_1.Form.Group, { as: react_bootstrap_1.Col, controlId: "_offerBond.status" },
            react_1.default.createElement(react_bootstrap_1.Form.Label, null, "Status"),
            react_1.default.createElement(StatusSelectors_1.OfferBondStatusSelector, { name: "_offerBond.status" }))));
}
exports.OfferBondModalBody = OfferBondModalBody;
