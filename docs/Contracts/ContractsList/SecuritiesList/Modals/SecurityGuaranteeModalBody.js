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
exports.SecurityGuaranteeModalBody = void 0;
const react_1 = __importStar(require("react"));
const react_bootstrap_1 = require("react-bootstrap");
const SecurityModalBody_1 = require("./SecurityModalBody");
const FormContext_1 = require("../../../../View/Modals/FormContext");
const GenericComponents_1 = require("../../../../View/Modals/CommonFormComponents/GenericComponents");
/**Wywoływana w ProjectsSelector jako props  */
function SecurityGuaranteeModalBody(props) {
    const { initialData, isEditing, additionalProps, contextData } = props;
    const { register, setValue, watch, formState: { errors }, control, } = (0, FormContext_1.useFormContext)();
    (0, react_1.useEffect)(() => {
        setValue("isCash", false);
        if (isEditing) {
            setValue("firstPartExpiryDate", initialData?.firstPartExpiryDate || initialData?._contract.endDate || undefined, { shouldValidate: true });
            setValue("secondPartExpiryDate", initialData?.secondPartExpiryDate || undefined, { shouldValidate: true });
        }
    }, [initialData, setValue]);
    return (react_1.default.createElement(react_1.default.Fragment, null,
        react_1.default.createElement(SecurityModalBody_1.SecurityModalBody, { ...props }),
        react_1.default.createElement(react_bootstrap_1.Row, null,
            react_1.default.createElement(react_bootstrap_1.Form.Group, { as: react_bootstrap_1.Col, controlId: "firstPartExpiryDate" },
                react_1.default.createElement(react_bootstrap_1.Form.Label, null, "Termin wyga\u015Bni\u0119cia 70%"),
                react_1.default.createElement(react_bootstrap_1.Form.Control, { type: "date", isValid: !errors.firstPartExpiryDate, isInvalid: !!errors.firstPartExpiryDate, ...register("firstPartExpiryDate") }),
                react_1.default.createElement(GenericComponents_1.ErrorMessage, { errors: errors, name: "firstPartExpiryDate" })),
            react_1.default.createElement(react_bootstrap_1.Form.Group, { as: react_bootstrap_1.Col, controlId: "secondPartExpiryDate" },
                react_1.default.createElement(react_bootstrap_1.Form.Label, null, "Termin wyga\u015Bni\u0119cia 30%"),
                react_1.default.createElement(react_bootstrap_1.Form.Control, { type: "date", isValid: !errors.secondPartExpiryDate, isInvalid: !!errors.secondPartExpiryDate, ...register("secondPartExpiryDate") }),
                react_1.default.createElement(GenericComponents_1.ErrorMessage, { errors: errors, name: "secondPartExpiryDate" })))));
}
exports.SecurityGuaranteeModalBody = SecurityGuaranteeModalBody;
