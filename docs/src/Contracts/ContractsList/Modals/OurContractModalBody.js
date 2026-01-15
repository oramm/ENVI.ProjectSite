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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OurContractModalBody = OurContractModalBody;
const react_1 = __importStar(require("react"));
const MainSetupReact_1 = __importDefault(require("../../../React/MainSetupReact"));
const BussinesObjectSelectors_1 = require("../../../View/Modals/CommonFormComponents/BussinesObjectSelectors");
const ContractModalBody_1 = require("./ContractModalBody");
const FormContext_1 = require("../../../View/Modals/FormContext");
const react_bootstrap_1 = require("react-bootstrap");
function OurContractModalBody(props) {
    const { initialData, isEditing } = props;
    const { register, trigger, setValue, watch, formState: { errors }, control, } = (0, FormContext_1.useFormContext)();
    const _type = watch("_type");
    (0, react_1.useEffect)(() => {
        setValue("_type", initialData?._type, { shouldValidate: true });
        setValue("ourId", initialData?.ourId || "", { shouldValidate: true });
        setValue("_city", initialData?._city, { shouldValidate: true });
        setValue("_admin", initialData?._admin, { shouldValidate: true });
        setValue("_manager", initialData?._manager, { shouldValidate: true });
        setValue("_employers", initialData?._employers, { shouldValidate: true });
    }, [initialData, setValue]);
    return (react_1.default.createElement(react_1.default.Fragment, null,
        react_1.default.createElement(react_bootstrap_1.Row, null,
            react_1.default.createElement(react_bootstrap_1.Form.Group, { as: react_bootstrap_1.Col, controlId: "_city" },
                react_1.default.createElement(react_bootstrap_1.Form.Label, null, "Miasto"),
                react_1.default.createElement(BussinesObjectSelectors_1.CitySelector, { showValidationInfo: true })),
            !isEditing && (react_1.default.createElement(react_bootstrap_1.Form.Group, { as: react_bootstrap_1.Col, controlId: "_type" },
                react_1.default.createElement(BussinesObjectSelectors_1.ContractTypeSelector, { typesToInclude: "our" })))),
        react_1.default.createElement(ContractModalBody_1.ContractModalBody, { ...props }),
        react_1.default.createElement(react_bootstrap_1.Row, null,
            react_1.default.createElement(react_bootstrap_1.Form.Group, { as: react_bootstrap_1.Col, controlId: "_manager" },
                react_1.default.createElement(BussinesObjectSelectors_1.PersonSelectorPreloaded, { label: "Koordynator", name: "_manager", repository: MainSetupReact_1.default.personsEnviRepository })),
            react_1.default.createElement(react_bootstrap_1.Form.Group, { as: react_bootstrap_1.Col, controlId: "_admin" },
                react_1.default.createElement(BussinesObjectSelectors_1.PersonSelectorPreloaded, { label: "Administrator", name: "_admin", repository: MainSetupReact_1.default.personsEnviRepository })),
            react_1.default.createElement(react_bootstrap_1.Form.Group, null,
                react_1.default.createElement(react_bootstrap_1.Form.Label, null, "Zamawiaj\u0105cy"),
                react_1.default.createElement(BussinesObjectSelectors_1.EntitySelector, { name: "_employers", multiple: true })))));
}
