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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OtherContractAddNewModalButton = exports.OtherContractEditModalButton = exports.OtherContractModalBody = void 0;
const react_1 = __importStar(require("react"));
const react_bootstrap_1 = require("react-bootstrap");
const RepositoryReact_1 = __importDefault(require("../../React/RepositoryReact"));
const CommonComponents_1 = require("../../View/Resultsets/CommonComponents");
const ContractModalBody_1 = require("./ContractModalBody");
const GeneralModal_1 = require("../../View/GeneralModal");
const ContractsSearch_1 = require("./ContractsSearch");
const FormContext_1 = require("../../View/FormContext");
/**Wywoływana w ProjectsSelector jako props  */
function OtherContractModalBody(props) {
    const initialData = props.initialData;
    const ourRelatedContractsRepository = new RepositoryReact_1.default({
        name: 'OurRelatedContractsRepository',
        actionRoutes: { addNewRoute: '', editRoute: '', deleteRoute: '', getRoute: 'contracts' },
    });
    const { register, setValue, watch, formState, control } = (0, FormContext_1.useFormContext)();
    (0, react_1.useEffect)(() => {
        setValue('_contractors', initialData?._contractors || [], { shouldValidate: true });
        setValue('_ourContract', initialData?._ourContract ? [initialData._ourContract] : [], { shouldValidate: true });
    }, [initialData, setValue]);
    return (react_1.default.createElement(react_1.default.Fragment, null,
        " ",
        (!props.isEditing) ?
            react_1.default.createElement(CommonComponents_1.ContractTypeSelectFormElement, { typesToInclude: 'other' })
            : null,
        react_1.default.createElement(ContractModalBody_1.ContractModalBody, { ...props }),
        react_1.default.createElement(react_bootstrap_1.Form.Group, null,
            react_1.default.createElement(react_bootstrap_1.Form.Label, null, "Wykonawcy"),
            react_1.default.createElement(CommonComponents_1.MyAsyncTypeahead, { name: '_contractors', labelKey: 'name', repository: ContractsSearch_1.entitiesRepository, multiple: true })),
        react_1.default.createElement(react_bootstrap_1.Form.Group, null,
            react_1.default.createElement(react_bootstrap_1.Form.Label, null, "Powi\u0105zana us\u0142uga IK lub PT"),
            react_1.default.createElement(CommonComponents_1.MyAsyncTypeahead, { name: '_ourContract', labelKey: 'ourId', searchKey: 'contractOurId', repository: ourRelatedContractsRepository, renderMenuItemChildren: (option) => (react_1.default.createElement("div", null,
                    option.ourId,
                    " ",
                    option.name)) }))));
}
exports.OtherContractModalBody = OtherContractModalBody;
function OtherContractEditModalButton({ modalProps: { onEdit, onIsReadyChange, initialData }, }) {
    return (react_1.default.createElement(GeneralModal_1.GeneralEditModalButton, { modalProps: {
            onEdit: onEdit,
            ModalBodyComponent: OtherContractModalBody,
            onIsReadyChange: onIsReadyChange,
            modalTitle: "Edycja umowy",
            repository: ContractsSearch_1.contractsRepository,
            initialData: initialData,
        }, buttonProps: {} }));
}
exports.OtherContractEditModalButton = OtherContractEditModalButton;
function OtherContractAddNewModalButton({ modalProps: { onAddNew, onIsReadyChange }, }) {
    return (react_1.default.createElement(GeneralModal_1.GeneralAddNewModalButton, { modalProps: {
            onAddNew: onAddNew,
            ModalBodyComponent: ContractModalBody_1.ProjectSelectorModalBody,
            additionalModalBodyProps: { SpecificContractModalBody: OtherContractModalBody, },
            onIsReadyChange: onIsReadyChange,
            modalTitle: "Nowa umowa zewnętrzna",
            repository: ContractsSearch_1.contractsRepository
        }, buttonProps: {
            buttonCaption: "Rejestruj umowę zewnętrzną",
        } }));
}
exports.OtherContractAddNewModalButton = OtherContractAddNewModalButton;
