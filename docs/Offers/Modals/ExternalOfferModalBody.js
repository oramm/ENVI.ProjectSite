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
const CommonFormComponents_1 = require("../../View/Modals/CommonFormComponents");
const OfferModalBody_1 = require("./OfferModalBody");
const FormContext_1 = require("../../View/Modals/FormContext");
const OffersController_1 = require("../OffersController");
/**Wywoływana w ProjectsSelector jako props  */
function ExternalOfferModalBody(props) {
    const initialData = props.initialData;
    const { register, setValue, watch, formState: { errors }, control, } = (0, FormContext_1.useFormContext)();
    (0, react_1.useEffect)(() => {
        setValue("_entitiesMain", initialData?._entitiesMain, {
            shouldDirty: false,
            shouldValidate: true,
        });
        setValue("number", initialData?.number || "", {
            shouldDirty: false,
            shouldValidate: true,
        });
    }, [initialData, setValue]);
    return (react_1.default.createElement(react_1.default.Fragment, null,
        react_1.default.createElement(react_bootstrap_1.Form.Group, { controlId: "number" },
            react_1.default.createElement(react_bootstrap_1.Form.Label, null, "Numer pisma"),
            react_1.default.createElement(react_bootstrap_1.Form.Control, { type: "text", placeholder: "Podaj numer", isInvalid: !!errors?.number, isValid: !errors?.number, ...register("number") }),
            react_1.default.createElement(CommonFormComponents_1.ErrorMessage, { errors: errors, name: "number" })),
        react_1.default.createElement(OfferModalBody_1.OfferModalBody, { ...props }),
        react_1.default.createElement(react_bootstrap_1.Form.Group, null,
            react_1.default.createElement(react_bootstrap_1.Form.Label, null, "Nadawca"),
            react_1.default.createElement(CommonFormComponents_1.MyAsyncTypeahead, { name: "_entitiesMain", labelKey: "name", repository: OffersController_1.entitiesRepository, multiple: true }),
            react_1.default.createElement(CommonFormComponents_1.ErrorMessage, { errors: errors, name: "_entitiesMain" }))));
}
exports.ExternalOfferModalBody = ExternalOfferModalBody;
