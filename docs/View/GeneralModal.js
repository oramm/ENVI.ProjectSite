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
exports.EditModalButton = exports.GeneralModal = void 0;
const react_1 = __importStar(require("react"));
const react_bootstrap_1 = require("react-bootstrap");
const Tools_1 = __importDefault(require("../React/Tools"));
function GeneralModal({ show, title, isEditing, onEdit, onClose, onIsReadyChange, repository, ModalBodyComponent, modalBodyProps }) {
    let additionalFieldsKeysValues = [];
    async function handleSubmit(e) {
        e.preventDefault();
        onIsReadyChange(false);
        e.stopPropagation();
        const formData = new FormData(e.target);
        if (additionalFieldsKeysValues)
            for (const keyValue of additionalFieldsKeysValues)
                formData.append(keyValue.name, keyValue.value);
        (isEditing) ? await handleEdit(formData) : await handleAdd(formData);
        onClose();
        onIsReadyChange(true);
    }
    ;
    function handleAdditionalFieldsKeysValues(values) {
        additionalFieldsKeysValues = values;
        //if (modalBodyProps.onAdditionalFieldsKeysValuesChange)
        //    modalBodyProps.onAdditionalFieldsKeysValuesChange(values);
    }
    async function handleEdit(formData) {
        const currentContract = { ...repository.currentItems[0] };
        const editedObject = Tools_1.default.updateObject(formData, currentContract);
        await repository.editItemNodeJS(editedObject);
        if (onEdit)
            onEdit(editedObject);
    }
    ;
    async function handleAdd(formData) {
    }
    ;
    return (react_1.default.createElement(react_bootstrap_1.Modal, { show: show, onHide: onClose, onClick: (e) => e.stopPropagation(), onDoubleClick: (e) => e.stopPropagation() },
        react_1.default.createElement(react_bootstrap_1.Form, { onSubmit: handleSubmit },
            react_1.default.createElement(react_bootstrap_1.Modal.Header, { closeButton: true },
                react_1.default.createElement(react_bootstrap_1.Modal.Title, null, title)),
            react_1.default.createElement(react_bootstrap_1.Modal.Body, null,
                react_1.default.createElement(ModalBodyComponent, { ...modalBodyProps, onAdditionalFieldsKeysValuesChange: handleAdditionalFieldsKeysValues })),
            react_1.default.createElement(react_bootstrap_1.Modal.Footer, null,
                react_1.default.createElement(react_bootstrap_1.Button, { variant: "secondary", onClick: onClose }, "Anuluj"),
                react_1.default.createElement(react_bootstrap_1.Button, { type: "submit", variant: "primary" }, "Zatwierd\u017A")))));
}
exports.GeneralModal = GeneralModal;
function EditModalButton({ onEdit, onIsReadyChange, ModalBodyComponent, title, initialData, repository, }) {
    const [showForm, setShowForm] = (0, react_1.useState)(false);
    const handleOpen = () => setShowForm(true);
    const handleClose = () => setShowForm(false);
    return (react_1.default.createElement(react_1.default.Fragment, null,
        react_1.default.createElement(react_bootstrap_1.Button, { variant: "primary", onClick: handleOpen }, "Edytuj"),
        react_1.default.createElement(GeneralModal, { onClose: handleClose, show: showForm, isEditing: true, title: title, repository: repository, onIsReadyChange: onIsReadyChange, onEdit: onEdit, ModalBodyComponent: ModalBodyComponent, modalBodyProps: {
                isEditing: true,
                initialData: initialData,
            } })));
}
exports.EditModalButton = EditModalButton;
