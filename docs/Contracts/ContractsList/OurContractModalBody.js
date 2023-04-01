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
exports.OurContractEditModalButton = exports.OurContractModalBody = void 0;
const react_1 = __importStar(require("react"));
const react_bootstrap_1 = require("react-bootstrap");
const MainSetupReact_1 = __importDefault(require("../../React/MainSetupReact"));
const CommonComponents_1 = require("../../View/Resultsets/CommonComponents");
const ContractModalBody_1 = require("./ContractModalBody");
const GeneralModal_1 = require("../../View/GeneralModal");
const ContractsSearch_1 = require("./ContractsSearch");
function OurContractModalBody(props) {
    const initialData = props.initialData;
    const [selectedAdmins, setSelectedAdmins] = (0, react_1.useState)(initialData?._admin ? [initialData._admin] : []);
    const [selectedManagers, setSelectedManagers] = (0, react_1.useState)(initialData?._manager ? [initialData._manager] : []);
    (0, react_1.useEffect)(() => {
        const additionalFieldsKeysValues = [
            { name: '_manager', value: JSON.stringify(selectedManagers[0]) },
            { name: '_admin', value: JSON.stringify(selectedAdmins[0]) }
        ];
        if (!props.onAdditionalFieldsKeysValuesChange)
            throw new Error('onAdditionalFieldsKeysValuesChange is not defined');
        props.onAdditionalFieldsKeysValuesChange(additionalFieldsKeysValues);
    }, [selectedAdmins, selectedManagers, props]);
    return (react_1.default.createElement(react_1.default.Fragment, null,
        react_1.default.createElement(ContractModalBody_1.ContractModalBody, { ...props }),
        react_1.default.createElement(react_bootstrap_1.Form.Group, { controlId: "manager" },
            react_1.default.createElement(CommonComponents_1.PersonSelectFormElement, { label: 'Koordynator', selectedRepositoryItems: selectedManagers, onChange: (currentSelectedItems) => {
                    setSelectedManagers(currentSelectedItems);
                }, repository: MainSetupReact_1.default.personsEnviRepository })),
        react_1.default.createElement(react_bootstrap_1.Form.Group, { controlId: "admin" },
            react_1.default.createElement(CommonComponents_1.PersonSelectFormElement, { label: 'Administrator', selectedRepositoryItems: selectedAdmins, onChange: setSelectedAdmins, repository: MainSetupReact_1.default.personsEnviRepository }))));
}
exports.OurContractModalBody = OurContractModalBody;
function OurContractEditModalButton({ onEdit, onIsReadyChange, initialData }) {
    return (react_1.default.createElement(GeneralModal_1.EditModalButton, { onEdit: onEdit, ModalBodyComponent: OurContractModalBody, onIsReadyChange: onIsReadyChange, title: "Edycja umowy", repository: ContractsSearch_1.contractsRepository, initialData: initialData }));
}
exports.OurContractEditModalButton = OurContractEditModalButton;
