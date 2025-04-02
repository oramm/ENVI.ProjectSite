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
exports.ContractMilestoneModalBody = void 0;
const react_1 = __importStar(require("react"));
const react_bootstrap_1 = require("react-bootstrap");
const BussinesObjectSelectors_1 = require("../../../View/Modals/CommonFormComponents/BussinesObjectSelectors");
const FormContext_1 = require("../../../View/Modals/FormContext");
const GenericComponents_1 = require("../../../View/Modals/CommonFormComponents/GenericComponents");
const StatusSelectors_1 = require("../../../View/Modals/CommonFormComponents/StatusSelectors");
function ContractMilestoneModalBody({ isEditing, initialData, contextData }) {
    const { register, reset, watch, formState: { errors }, trigger, } = (0, FormContext_1.useFormContext)();
    const _type = watch("_type");
    const _contract = (initialData?._contract || contextData);
    (0, react_1.useEffect)(() => {
        const resetData = {
            _contract,
            _type: initialData?._type,
            name: initialData?.name,
            description: initialData?.description || "",
            startDate: initialData?.startDate,
            endDate: initialData?.endDate,
            status: initialData?.status,
        };
        reset(resetData);
        trigger();
    }, [initialData, reset, trigger, _contract]);
    function shouldShowNameField() {
        if (initialData?._type?.isUniquePerContract)
            return false;
        if (_type?.isUniquePerContract)
            return false;
        return true;
    }
    return (react_1.default.createElement(react_1.default.Fragment, null,
        !isEditing && react_1.default.createElement(BussinesObjectSelectors_1.MilestoneTypeSelector, { contractType: _contract._type }),
        shouldShowNameField() && (react_1.default.createElement(react_bootstrap_1.Form.Group, { controlId: "name", className: "mb-2" },
            react_1.default.createElement(react_bootstrap_1.Form.Label, null, "Nazwa"),
            react_1.default.createElement(react_bootstrap_1.Form.Control, { as: "textarea", rows: 2, placeholder: "Podaj nazw\u0119", isInvalid: !!errors?.name, isValid: !errors?.name, ...register("name") }),
            react_1.default.createElement(GenericComponents_1.ErrorMessage, { name: "name", errors: errors }))),
        react_1.default.createElement(react_bootstrap_1.Row, { className: "mb-2" },
            react_1.default.createElement(react_bootstrap_1.Form.Group, { controlId: "startDate", as: react_bootstrap_1.Col },
                react_1.default.createElement(react_bootstrap_1.Form.Label, null, "Data rozpocz\u0119cia"),
                react_1.default.createElement(react_bootstrap_1.Form.Control, { type: "date", isInvalid: !!errors?.startDate, isValid: !errors?.startDate, ...register("startDate") }),
                react_1.default.createElement(GenericComponents_1.ErrorMessage, { name: "startDate", errors: errors })),
            react_1.default.createElement(react_bootstrap_1.Form.Group, { controlId: "endDate" },
                react_1.default.createElement(react_bootstrap_1.Form.Label, null, "Data zako\u0144czenia"),
                react_1.default.createElement(react_bootstrap_1.Form.Control, { type: "date", isInvalid: !!errors?.endDate, isValid: !errors?.endDate, ...register("endDate") }),
                react_1.default.createElement(GenericComponents_1.ErrorMessage, { name: "endDate", errors: errors }))),
        react_1.default.createElement(StatusSelectors_1.MilestoneStatusSelector, { showValidationInfo: true }),
        react_1.default.createElement(react_bootstrap_1.Form.Group, { controlId: "description" },
            react_1.default.createElement(react_bootstrap_1.Form.Label, null, "Uwagi"),
            react_1.default.createElement(react_bootstrap_1.Form.Control, { as: "textarea", rows: 3, placeholder: "Dodaj komentarz", isInvalid: !!errors?.description, isValid: !errors?.description, ...register("description") }),
            react_1.default.createElement(GenericComponents_1.ErrorMessage, { name: "description", errors: errors }))));
}
exports.ContractMilestoneModalBody = ContractMilestoneModalBody;
