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
exports.ContractModalBody = void 0;
const react_1 = __importStar(require("react"));
const CommonComponents_1 = require("../../View/Resultsets/CommonComponents");
const react_bootstrap_1 = require("react-bootstrap");
const ContractsController_1 = __importDefault(require("./ContractsController"));
const OurContractModalBody_1 = require("./OurContractModalBody");
const OtherContractModalBody_1 = require("./OtherContractModalBody");
const ContractsSearch_1 = require("./ContractsSearch");
function ContractModalBody({ isEditing, initialData }) {
    const [typeId, setTypeId] = (0, react_1.useState)(initialData?.typeId || 0);
    const [name, setName] = (0, react_1.useState)(initialData?.name || '');
    const [alias, setAlias] = (0, react_1.useState)(initialData?.alias || '');
    const [comment, setComment] = (0, react_1.useState)(initialData?.comment || '');
    const [valueInPLN, setValueInPLN] = (0, react_1.useState)(initialData?.value || '');
    const [status, setStatus] = (0, react_1.useState)(initialData?.status || '');
    const [startDate, setStartDate] = (0, react_1.useState)(initialData?.startDate || new Date().toISOString().slice(0, 10));
    const [endDate, setEndDate] = (0, react_1.useState)(initialData?.endDate || new Date().toISOString().slice(0, 10));
    if (!isEditing && !initialData)
        initialData = {
            id: 0,
            _parent: ContractsSearch_1.contractsRepository.currentItems[0]._parent,
            startDate: new Date().toISOString().slice(0, 10),
            endDate: new Date().toISOString().slice(0, 10)
        };
    return (react_1.default.createElement(react_1.default.Fragment, null,
        (isEditing) ?
            react_1.default.createElement(CommonComponents_1.ContractTypeSelectFormElement, { value: typeId, onChange: (e) => {
                    setTypeId(parseInt(e.target.value));
                    console.log(e.target.value);
                } })
            : null,
        react_1.default.createElement(react_bootstrap_1.Form.Group, { controlId: "name" },
            react_1.default.createElement(react_bootstrap_1.Form.Label, null, "Nazwa kontraktu"),
            react_1.default.createElement(react_bootstrap_1.Form.Control, { type: "text", name: "name", placeholder: "Podaj nazw\u0119", value: name, onChange: (e) => setName(e.target.value) })),
        react_1.default.createElement(react_bootstrap_1.Form.Group, { controlId: "alias" },
            react_1.default.createElement(react_bootstrap_1.Form.Label, null, "Alias"),
            react_1.default.createElement(react_bootstrap_1.Form.Control, { type: "text", name: 'alias', placeholder: "Podaj alias", value: alias, onChange: (e) => setAlias(e.target.value) })),
        react_1.default.createElement(react_bootstrap_1.Form.Group, { controlId: "comment" },
            react_1.default.createElement(react_bootstrap_1.Form.Label, null, "Opis"),
            react_1.default.createElement(react_bootstrap_1.Form.Control, { as: "textarea", name: "comment", rows: 3, placeholder: "Podaj opis", value: comment, onChange: (e) => setComment(e.target.value) })),
        react_1.default.createElement(react_bootstrap_1.Form.Group, { controlId: "valueInPLN" },
            react_1.default.createElement(react_bootstrap_1.Form.Label, null, "Warto\u015B\u0107 netto w PLN"),
            react_1.default.createElement(CommonComponents_1.ValueInPLNInput, { onChange: setValueInPLN, value: valueInPLN })),
        react_1.default.createElement(react_bootstrap_1.Form.Group, { controlId: "startDate" },
            react_1.default.createElement(react_bootstrap_1.Form.Label, null, "Pocz\u0105tek"),
            react_1.default.createElement(react_bootstrap_1.Form.Control, { type: "date", name: "startDate", value: startDate, onChange: (e) => setStartDate(e.target.value) })),
        react_1.default.createElement(react_bootstrap_1.Form.Group, { controlId: "endDate" },
            react_1.default.createElement(react_bootstrap_1.Form.Label, null, "Zako\u0144czenie"),
            react_1.default.createElement(react_bootstrap_1.Form.Control, { type: "date", name: "endDate", value: endDate, onChange: (e) => setEndDate(e.target.value) })),
        react_1.default.createElement(react_bootstrap_1.Form.Group, { controlId: "status" },
            react_1.default.createElement(react_bootstrap_1.Form.Label, null, "Status"),
            react_1.default.createElement(react_bootstrap_1.Form.Control, { as: "select", name: "status", onChange: (e) => setStatus(e.target.value), value: status },
                react_1.default.createElement("option", { value: "" }, "-- Wybierz opcj\u0119 --"),
                ContractsController_1.default.statusNames.map((statusName, index) => (react_1.default.createElement("option", { key: index, value: statusName }, statusName)))))));
}
exports.ContractModalBody = ContractModalBody;
function ContractEditModalButton({ contractType, onEdit, onIsReadyChange, initialData, }) {
    const modalBodyComponent = contractType === "our"
        ? OurContractModalBody_1.OurContractModalBody
        : OtherContractModalBody_1.OtherContractModalBody;
    const editModalButton = contractType === "our"
        ? react_1.default.createElement(OurContractModalBody_1.OurContractEditModalButton, { onEdit: onEdit, ModalBodyComponent: modalBodyComponent, onIsReadyChange: onIsReadyChange, initialData: initialData })
        : react_1.default.createElement(OtherContractModalBody_1.OtherContractEditModalButton, { onEdit: onEdit, ModalBodyComponent: modalBodyComponent, onIsReadyChange: onIsReadyChange, initialData: initialData });
    return editModalButton;
}
