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
exports.MeetingArrangementModalBody = MeetingArrangementModalBody;
const react_1 = __importStar(require("react"));
const react_bootstrap_1 = require("react-bootstrap");
const FormContext_1 = require("../../../../../View/Modals/FormContext");
const GenericComponents_1 = require("../../../../../View/Modals/CommonFormComponents/GenericComponents");
const BussinesObjectSelectors_1 = require("../../../../../View/Modals/CommonFormComponents/BussinesObjectSelectors");
const RepositoryReact_1 = __importDefault(require("../../../../../React/RepositoryReact"));
const ContractDetailsContext_1 = require("../../ContractDetailsContext");
const caseSelectorRepository = new RepositoryReact_1.default({
    actionRoutes: {
        getRoute: 'cases',
        addNewRoute: 'case',
        editRoute: 'case',
        deleteRoute: 'case',
    },
    name: 'cases_meetingArrangement_temp',
});
function MeetingArrangementModalBody({ isEditing, initialData, contextData, }) {
    const { contract } = (0, ContractDetailsContext_1.useContractDetails)();
    const { register, reset, formState: { errors }, trigger } = (0, FormContext_1.useFormContext)();
    (0, react_1.useEffect)(() => {
        const resetData = {
            meetingId: contextData,
            _case: initialData?._case || undefined,
            description: initialData?.description || '',
        };
        reset(resetData);
        trigger();
    }, [initialData, reset]);
    return (react_1.default.createElement(react_1.default.Fragment, null,
        react_1.default.createElement(react_bootstrap_1.Form.Group, { controlId: "_case" },
            react_1.default.createElement(react_bootstrap_1.Form.Label, null, "Sprawa"),
            react_1.default.createElement(BussinesObjectSelectors_1.CaseSelectMenuElement, { repository: caseSelectorRepository, _contract: contract, multiple: false, name: "_case" }),
            react_1.default.createElement(GenericComponents_1.ErrorMessage, { name: "_case", errors: errors })),
        react_1.default.createElement(react_bootstrap_1.Form.Group, { controlId: "description" },
            react_1.default.createElement(react_bootstrap_1.Form.Label, null, "Opis (opcjonalny)"),
            react_1.default.createElement(react_bootstrap_1.Form.Control, { as: "textarea", rows: 2, placeholder: "Dodatkowy opis punktu agendy", isValid: !errors?.description, isInvalid: !!errors?.description, ...register('description') }),
            react_1.default.createElement(GenericComponents_1.ErrorMessage, { name: "description", errors: errors }))));
}
