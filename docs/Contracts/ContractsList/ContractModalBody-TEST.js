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
exports.ContractDeleteModalButton = exports.ContractEditModalButton = exports.ProjectSelectorModalBody = exports.ContractModalBody = void 0;
const react_1 = __importStar(require("react"));
const GeneralModal_1 = require("../../View/GeneralModal");
const CommonComponents_1 = require("../../View/Resultsets/CommonComponents");
const react_bootstrap_1 = require("react-bootstrap");
const OurContractModalBody_1 = require("./OurContractModalBody");
const OtherContractModalBody_1 = require("./OtherContractModalBody");
const ContractsSearch_1 = require("./ContractsSearch");
const FormContext_1 = require("../../View/FormContext");
function ContractModalBody({ isEditing, initialData, onValidationChange }) {
    const { register, setValue, watch, formState, control } = (0, FormContext_1.useFormContext)();
    (0, react_1.useEffect)(() => {
        setValue('_contractors', initialData?._contractors || [], { shouldValidate: true });
        setValue('_manager', initialData?.status || '', { shouldValidate: true });
        setValue('_contractType', initialData?.type || [], { shouldValidate: true });
        // Ustaw inne wartości domyślne dla pozostałych pól formularza
    }, [initialData, setValue]);
    return (react_1.default.createElement(react_bootstrap_1.Form.Group, null,
        react_1.default.createElement(react_bootstrap_1.Form.Label, null, "Wykonawcy"),
        react_1.default.createElement(CommonComponents_1.MyAsyncTypeahead, { name: '_contractors', labelKey: 'name', repository: ContractsSearch_1.entitiesRepository, multiple: false, isRequired: true })));
}
exports.ContractModalBody = ContractModalBody;
/** przełęcza widok pomiędzy wyborem projektu a formularzem kontraktu
 * SpecificContractModalBody - komponent formularza kontraktu (OurContractModalBody lub OtherContractModalBody)
 * @param additionalProps - dodatkowe propsy przekazywane do SpecificContractModalBody - ustawiane w Otjer lub OurContractModalBody
 * w tym przypadku jest additionalProps zawiera tylko parametr SpecificContractModalBody - komponent formularza kontraktu (OurContractModalBody lub OtherContractModalBody)
 *
 */
function ProjectSelectorModalBody({ isEditing, onAdditionalFieldsKeysValuesChange, additionalProps, onValidationChange }) {
    return (react_1.default.createElement(ContractModalBody, { isEditing: isEditing, additionalProps: additionalProps, onAdditionalFieldsKeysValuesChange: onAdditionalFieldsKeysValuesChange, onValidationChange: onValidationChange }));
}
exports.ProjectSelectorModalBody = ProjectSelectorModalBody;
;
/** przycisk i modal edycji OurCOntract lub OtherContract */
function ContractEditModalButton({ modalProps: { onEdit, onIsReadyChange, initialData }, buttonProps, isOurContract, }) {
    return (isOurContract
        ? react_1.default.createElement(OurContractModalBody_1.OurContractEditModalButton, { modalProps: { onEdit, onIsReadyChange, initialData }, buttonProps: buttonProps })
        : react_1.default.createElement(OtherContractModalBody_1.OtherContractEditModalButton, { modalProps: { onEdit, onIsReadyChange, initialData }, buttonProps: buttonProps }));
}
exports.ContractEditModalButton = ContractEditModalButton;
function ContractDeleteModalButton({ modalProps: { onDelete } }) {
    const currentContract = ContractsSearch_1.contractsRepository.currentItems[0];
    const modalTitle = 'Usuwanie kontraktu ' + (currentContract?.ourId || currentContract?._number || '');
    return (react_1.default.createElement(GeneralModal_1.GeneralDeleteModalButton, { modalProps: {
            onDelete,
            modalTitle,
            repository: ContractsSearch_1.contractsRepository,
            initialData: ContractsSearch_1.contractsRepository.currentItems[0],
        } }));
}
exports.ContractDeleteModalButton = ContractDeleteModalButton;
