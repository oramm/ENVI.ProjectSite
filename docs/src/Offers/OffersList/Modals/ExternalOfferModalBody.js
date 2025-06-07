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
exports.ExternalOfferModalBody = void 0;
const react_1 = __importStar(require("react"));
const react_bootstrap_1 = require("react-bootstrap");
const OfferModalBody_1 = require("./OfferModalBody");
const FormContext_1 = require("../../../View/Modals/FormContext");
const GenericComponents_1 = require("../../../View/Modals/CommonFormComponents/GenericComponents");
/**Wywoływana w ProjectsSelector jako props  */
function ExternalOfferModalBody(props) {
    const { initialData, isEditing } = props;
    const { register, setValue, watch, formState: { errors }, control, } = (0, FormContext_1.useFormContext)();
    (0, react_1.useEffect)(() => {
        setValue("isOur", false);
        setValue("tenderUrl", initialData?.tenderUrl || null, { shouldValidate: true });
    }, [initialData, setValue]);
    return (react_1.default.createElement(react_1.default.Fragment, null,
        react_1.default.createElement(OfferModalBody_1.OfferModalBody, { ...props }),
        react_1.default.createElement(react_bootstrap_1.Form.Group, null,
            react_1.default.createElement(react_bootstrap_1.Form.Label, null, "Link do og\u0142oszenia"),
            react_1.default.createElement(react_bootstrap_1.Form.Control, { type: "text", placeholder: "Wklej link", isInvalid: !!errors?.tenderUrl, isValid: !errors?.tenderUrl, ...register("tenderUrl") }),
            react_1.default.createElement(GenericComponents_1.ErrorMessage, { errors: errors, name: "tenderUrl" }))));
}
exports.ExternalOfferModalBody = ExternalOfferModalBody;
