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
exports.OtherContractModalBody = OtherContractModalBody;
const react_1 = __importStar(require("react"));
const react_bootstrap_1 = require("react-bootstrap");
const RepositoryReact_1 = __importDefault(require("../../../React/RepositoryReact"));
const BussinesObjectSelectors_1 = require("../../../View/Modals/CommonFormComponents/BussinesObjectSelectors");
const ContractModalBody_1 = require("./ContractModalBody");
const FormContext_1 = require("../../../View/Modals/FormContext");
const GenericComponents_1 = require("../../../View/Modals/CommonFormComponents/GenericComponents");
/**Wywoływana w ProjectsSelector jako props  */
function OtherContractModalBody(props) {
    const initialData = props.initialData;
    // ✅ Lokalne repository w useMemo - nie będzie kolizji z głównym contractsRepository
    const ourRelatedContractsRepository = (0, react_1.useMemo)(() => new RepositoryReact_1.default({
        name: "ourRelatedContracts_temp",
        actionRoutes: { addNewRoute: "", editRoute: "", deleteRoute: "", getRoute: "contracts" },
    }), []);
    const { setValue, watch } = (0, FormContext_1.useFormContext)();
    const _project = watch("_project");
    (0, react_1.useEffect)(() => {
        setValue("_type", initialData?._type, { shouldValidate: true });
        setValue("_contractors", initialData?._contractors || [], { shouldValidate: true });
        setValue("_ourContract", initialData?._ourContract, { shouldValidate: true });
    }, [initialData, setValue]);
    return (react_1.default.createElement(react_1.default.Fragment, null,
        " ",
        !props.isEditing ? react_1.default.createElement(BussinesObjectSelectors_1.ContractTypeSelector, { typesToInclude: "other" }) : null,
        react_1.default.createElement(ContractModalBody_1.ContractModalBody, { ...props }),
        react_1.default.createElement(react_bootstrap_1.Form.Group, null,
            react_1.default.createElement(react_bootstrap_1.Form.Label, null, "Wykonawcy"),
            react_1.default.createElement(BussinesObjectSelectors_1.EntitySelector, { name: "_contractors", multiple: true })),
        react_1.default.createElement(react_bootstrap_1.Form.Group, null,
            react_1.default.createElement(react_bootstrap_1.Form.Label, null, "Powi\u0105zana us\u0142uga IK lub PT"),
            react_1.default.createElement(GenericComponents_1.MyAsyncTypeahead, { name: "_ourContract", labelKey: "ourId", searchKey: "contractOurId", contextSearchParams: {
                    _project,
                    typesToInclude: "our",
                }, repository: ourRelatedContractsRepository, renderMenuItemChildren: (option) => (react_1.default.createElement("div", null,
                    option.ourId,
                    " ",
                    option.name)) }))));
}
