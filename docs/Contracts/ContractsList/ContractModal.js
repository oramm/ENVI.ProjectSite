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
exports.EditContractButton = exports.AddNewContractButton = exports.ContractModal = void 0;
const react_1 = __importStar(require("react"));
const react_bootstrap_1 = require("react-bootstrap");
const MainSetupReact_1 = __importDefault(require("../../React/MainSetupReact"));
const CommonComponents_1 = require("../../View/Resultsets/CommonComponents");
const ContractsSearch_1 = require("./ContractsSearch");
const Tools_1 = __importDefault(require("../../React/Tools"));
function ContractModal({ show, isEditng, onClose: handleClose, initialData, onIsReadyChange, onAddNew, onEdit }) {
    const [typeId, setTypeId] = (0, react_1.useState)(initialData?.typeId || 0);
    const [name, setName] = (0, react_1.useState)(initialData?.name || '');
    const [alias, setAlias] = (0, react_1.useState)(initialData?.alias || '');
    const [comment, setComment] = (0, react_1.useState)(initialData?.comment || '');
    const [status, setStatus] = (0, react_1.useState)(initialData?.status || 0);
    const [startDate, setStartDate] = (0, react_1.useState)(initialData?.startDate || new Date().toISOString().slice(0, 10));
    const [endDate, setEndDate] = (0, react_1.useState)(initialData?.endDate || new Date().toISOString().slice(0, 10));
    const [selectedContractors, setSelectedContractors] = (0, react_1.useState)(initialData?._contractors || []);
    const [selectedAdmin, setSelectedAdmin] = (0, react_1.useState)(initialData?._admin || undefined);
    const [selectedManager, setSelectedManager] = (0, react_1.useState)(initialData?._manager || undefined);
    async function handleSubmit(e) {
        e.preventDefault();
        onIsReadyChange(false);
        e.stopPropagation();
        const formData = new FormData(e.target);
        formData.append("_contractors", JSON.stringify(selectedContractors));
        (isEditng) ? await handleEdit(formData) : await handleAdd(formData);
        handleClose();
        onIsReadyChange(true);
    }
    ;
    async function handleEdit(formData) {
        const currentContract = { ...ContractsSearch_1.contractsRepository.currentItems[0] };
        const editedObject = Tools_1.default.updateObject(formData, currentContract);
        await ContractsSearch_1.contractsRepository.editItemNodeJS(editedObject);
        if (onEdit)
            onEdit(editedObject);
    }
    ;
    async function handleAdd(formData) {
    }
    ;
    return (react_1.default.createElement(react_bootstrap_1.Modal, { show: show, onHide: handleClose, onClick: (e) => e.stopPropagation(), onDoubleClick: (e) => e.stopPropagation() },
        react_1.default.createElement(react_bootstrap_1.Form, { onSubmit: handleSubmit },
            react_1.default.createElement(react_bootstrap_1.Modal.Header, { closeButton: true },
                react_1.default.createElement(react_bootstrap_1.Modal.Title, null, isEditng ? 'Edytuj kontrakt' : 'Dodaj nowy kontrakt')),
            react_1.default.createElement(react_bootstrap_1.Modal.Body, null,
                (isEditng) ?
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
                react_1.default.createElement(react_bootstrap_1.Form.Group, { controlId: "startDate" },
                    react_1.default.createElement(react_bootstrap_1.Form.Label, null, "Pocz\u0105tek"),
                    react_1.default.createElement(react_bootstrap_1.Form.Control, { type: "date", name: "startDate", value: startDate, onChange: (e) => setStartDate(e.target.value) })),
                react_1.default.createElement(react_bootstrap_1.Form.Group, { controlId: "endDate" },
                    react_1.default.createElement(react_bootstrap_1.Form.Label, null, "Zako\u0144czenie"),
                    react_1.default.createElement(react_bootstrap_1.Form.Control, { type: "date", name: "endDate", value: endDate, onChange: (e) => setEndDate(e.target.value) })),
                react_1.default.createElement(react_bootstrap_1.Form.Group, { controlId: "admin" },
                    react_1.default.createElement(CommonComponents_1.PersonSelectFormElement, { label: 'Administrator', value: selectedAdmin, onChange: (e) => {
                            console.log();
                            setSelectedAdmin(MainSetupReact_1.default.personsEnviRepository.items.filter((person) => e.id == person.id)[0]);
                        }, repository: MainSetupReact_1.default.personsEnviRepository })),
                react_1.default.createElement(react_bootstrap_1.Form.Group, null,
                    react_1.default.createElement(react_bootstrap_1.Form.Label, null, "Wykonawcy"),
                    react_1.default.createElement(CommonComponents_1.MyAsyncTypeahead, { labelKey: 'name', repository: ContractsSearch_1.entitiesRepository, onChange: (currentSelectedItems) => (0, CommonComponents_1.handleEditMyAsyncTypeaheadElement)(currentSelectedItems, selectedContractors, setSelectedContractors), selectedRepositoryItems: selectedContractors }))),
            react_1.default.createElement(react_bootstrap_1.Modal.Footer, null,
                react_1.default.createElement(react_bootstrap_1.Button, { variant: "secondary", onClick: handleClose }, "Anuluj"),
                react_1.default.createElement(react_bootstrap_1.Button, { type: "submit", variant: "primary" }, isEditng ? 'Edytuj' : 'Dodaj')))));
}
exports.ContractModal = ContractModal;
function AddNewContractButton({ onAddNew, onIsReadyChange }) {
    const [showForm, setShowForm] = (0, react_1.useState)(false);
    const handleOpen = () => setShowForm(true);
    const handleClose = () => setShowForm(false);
    return (react_1.default.createElement(react_1.default.Fragment, null,
        react_1.default.createElement(react_bootstrap_1.Button, { variant: "primary", onClick: handleOpen }, "Dodaj nowy"),
        react_1.default.createElement(ContractModal, { isEditng: false, show: showForm, onClose: handleClose, onAddNew: onAddNew, onIsReadyChange: onIsReadyChange })));
}
exports.AddNewContractButton = AddNewContractButton;
function EditContractButton({ initialData, onEdit, onIsReadyChange }) {
    const [showForm, setShowForm] = (0, react_1.useState)(false);
    const handleOpen = () => setShowForm(true);
    const handleClose = () => setShowForm(false);
    return (react_1.default.createElement(react_1.default.Fragment, null,
        react_1.default.createElement(react_bootstrap_1.Button, { variant: "primary", onClick: handleOpen }, "Edytuj"),
        react_1.default.createElement(ContractModal, { isEditng: true, show: showForm, onClose: handleClose, onIsReadyChange: onIsReadyChange, initialData: initialData, onEdit: onEdit })));
}
exports.EditContractButton = EditContractButton;
