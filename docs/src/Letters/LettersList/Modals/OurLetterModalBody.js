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
exports.OurLetterModalBody = OurLetterModalBody;
const react_1 = __importStar(require("react"));
const BussinesObjectSelectors_1 = require("../../../View/Modals/CommonFormComponents/BussinesObjectSelectors");
const LetterModalBody_1 = require("./LetterModalBody");
const FormContext_1 = require("../../../View/Modals/FormContext");
const react_bootstrap_1 = require("react-bootstrap");
const StatusSelectors_1 = require("../../../View/Modals/CommonFormComponents/StatusSelectors");
const MainSetupReact_1 = __importDefault(require("../../../React/MainSetupReact"));
function OurLetterModalBody(props) {
    const { initialData, isEditing } = props;
    const { setValue, watch, register, formState: { errors }, } = (0, FormContext_1.useFormContext)();
    const _cases = watch("_cases");
    (0, react_1.useEffect)(() => {
        const initialStatus = isEditing ? MainSetupReact_1.default.OurLetterStatus.CHANGED : MainSetupReact_1.default.IncomingLetterStatus.REGISTERED;
        setValue("_entitiesMain", initialData?._entitiesMain, { shouldDirty: false, shouldValidate: true });
        setValue("_entitiesCc", initialData?._entitiesCc, { shouldDirty: false, shouldValidate: true });
        setValue("status", initialData?.status || initialStatus, { shouldDirty: false, shouldValidate: true });
    }, [initialData, setValue]);
    return (react_1.default.createElement(react_1.default.Fragment, null,
        react_1.default.createElement(LetterModalBody_1.LetterModalBody, { ...props }),
        react_1.default.createElement(StatusSelectors_1.OurLetterStatusSelector, null),
        !isEditing && react_1.default.createElement(BussinesObjectSelectors_1.OurLetterTemplateSelector, { _cases: _cases || [] }),
        react_1.default.createElement(react_bootstrap_1.Form.Group, null,
            react_1.default.createElement(react_bootstrap_1.Form.Label, null, "Odbiorcy"),
            react_1.default.createElement(BussinesObjectSelectors_1.EntitySelector, { name: "_entitiesMain", multiple: true })),
        react_1.default.createElement(react_bootstrap_1.Form.Group, null,
            react_1.default.createElement(react_bootstrap_1.Form.Label, null, "Do wiadomo\u015Bci"),
            react_1.default.createElement(BussinesObjectSelectors_1.EntitySelector, { name: "_entitiesCc", multiple: true })),
        react_1.default.createElement("input", { type: "hidden", ...register("isOur"), value: "true" })));
}
