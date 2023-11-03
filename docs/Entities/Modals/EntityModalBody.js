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
exports.EntityModalBody = void 0;
const react_1 = __importStar(require("react"));
const CommonFormComponents_1 = require("../../View/Modals/CommonFormComponents");
const react_bootstrap_1 = require("react-bootstrap");
const FormContext_1 = require("../../View/Modals/FormContext");
function EntityModalBody({ isEditing, initialData }) {
    const { register, reset, formState: { dirtyFields, errors, isValid }, trigger } = (0, FormContext_1.useFormContext)();
    (0, react_1.useEffect)(() => {
        const resetData = {
            name: initialData?.name,
            address: initialData?.address,
            taxNumber: initialData?.taxNumber,
            www: initialData?.www,
            email: initialData?.email,
            phone: initialData?.phone,
            fax: initialData?.fax,
        };
        reset(resetData);
        trigger();
    }, [initialData, reset]);
    return (react_1.default.createElement(react_1.default.Fragment, null,
        react_1.default.createElement(react_bootstrap_1.Form.Group, { controlId: "name" },
            react_1.default.createElement(react_bootstrap_1.Form.Label, null, "Nazwa"),
            react_1.default.createElement(react_bootstrap_1.Form.Control, { as: "textarea", rows: 2, placeholder: "Podaj nazw\u0119", isInvalid: !!errors?.name, isValid: !errors?.name, ...register('name') }),
            react_1.default.createElement(CommonFormComponents_1.ErrorMessage, { name: 'name', errors: errors })),
        react_1.default.createElement(react_bootstrap_1.Form.Group, { controlId: "address" },
            react_1.default.createElement(react_bootstrap_1.Form.Label, null, "Adres"),
            react_1.default.createElement(react_bootstrap_1.Form.Control, { placeholder: "Podaj adres", isInvalid: !!errors?.address, isValid: !errors?.address, ...register('address') }),
            react_1.default.createElement(CommonFormComponents_1.ErrorMessage, { name: 'address', errors: errors })),
        react_1.default.createElement(react_bootstrap_1.Form.Group, { controlId: "taxNumber" },
            react_1.default.createElement(react_bootstrap_1.Form.Label, null, "NIP"),
            react_1.default.createElement(react_bootstrap_1.Form.Control, { placeholder: "Podaj numer podatkowy", isInvalid: !!errors?.taxNumber, isValid: !errors?.taxNumber, ...register('taxNumber') }),
            react_1.default.createElement(CommonFormComponents_1.ErrorMessage, { name: 'taxNumber', errors: errors })),
        react_1.default.createElement(react_bootstrap_1.Form.Group, { controlId: "www" },
            react_1.default.createElement(react_bootstrap_1.Form.Label, null, "WWW"),
            react_1.default.createElement(react_bootstrap_1.Form.Control, { placeholder: "Podaj adres strony www", isInvalid: !!errors?.www, isValid: !errors?.www, ...register('www') }),
            react_1.default.createElement(CommonFormComponents_1.ErrorMessage, { name: 'www', errors: errors })),
        react_1.default.createElement(react_bootstrap_1.Form.Group, { controlId: "email" },
            react_1.default.createElement(react_bootstrap_1.Form.Label, null, "Email"),
            react_1.default.createElement(react_bootstrap_1.Form.Control, { type: "email", placeholder: "Podaj adres email", isInvalid: !!errors?.email, isValid: !errors?.email, ...register('email') }),
            react_1.default.createElement(CommonFormComponents_1.ErrorMessage, { name: 'email', errors: errors })),
        react_1.default.createElement(react_bootstrap_1.Form.Group, { controlId: "phone" },
            react_1.default.createElement(react_bootstrap_1.Form.Label, null, "Telefon"),
            react_1.default.createElement(react_bootstrap_1.Form.Control, { placeholder: "Podaj numer telefonu", isInvalid: !!errors?.phone, isValid: !errors?.phone, ...register('phone') }),
            react_1.default.createElement(CommonFormComponents_1.ErrorMessage, { name: 'phone', errors: errors }))));
}
exports.EntityModalBody = EntityModalBody;
