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
exports.GeneralDeleteModalButton = exports.GeneralAddNewModalButton = exports.GeneralEditModalButton = void 0;
const react_1 = __importStar(require("react"));
const react_bootstrap_1 = require("react-bootstrap");
const ConfirmModal_1 = __importDefault(require("./ConfirmModal"));
const GeneralModal_1 = require("./GeneralModal");
const react_fontawesome_1 = require("@fortawesome/react-fontawesome");
const free_solid_svg_icons_1 = require("@fortawesome/free-solid-svg-icons");
function GeneralEditModalButton({ modalProps: { onEdit, specialActionRoute, ModalBodyComponent, additionalModalBodyProps, modalTitle, initialData, repository, makeValidationSchema, }, buttonProps = {}, }) {
    const [showForm, setShowForm] = (0, react_1.useState)(false);
    function handleOpen() {
        setShowForm(true);
    }
    function handleClose() {
        setShowForm(false);
    }
    return (react_1.default.createElement(react_1.default.Fragment, null,
        react_1.default.createElement(GeneraEditButton, { ...buttonProps, onClick: handleOpen }),
        react_1.default.createElement(GeneralModal_1.GeneralModal, { onClose: handleClose, show: showForm, isEditing: true, title: modalTitle, repository: repository, onEdit: onEdit, specialActionRoute: specialActionRoute, ModalBodyComponent: ModalBodyComponent, makeValidationSchema: makeValidationSchema, modalBodyProps: {
                isEditing: true,
                initialData: initialData,
                additionalProps: additionalModalBodyProps,
            } })));
}
exports.GeneralEditModalButton = GeneralEditModalButton;
/**wyświelta ikonę albo przycisk */
function GeneraEditButton(buttonProps) {
    const { buttonCaption, buttonIsActive, buttonIsDisabled, buttonSize = 'sm', buttonVariant = 'outline-success', onClick } = {
        ...buttonProps
    };
    if (!buttonCaption)
        return (react_1.default.createElement("a", { href: '#', onClick: onClick, className: 'icon-vertical text-general' },
            react_1.default.createElement(react_fontawesome_1.FontAwesomeIcon, { icon: free_solid_svg_icons_1.faPencil, size: "lg" })));
    else
        return (react_1.default.createElement(react_bootstrap_1.Button, { key: buttonCaption, variant: buttonVariant, size: buttonSize, active: buttonIsActive, disabled: buttonIsDisabled, onClick: onClick }, buttonCaption));
}
/** Wyświetla przycisk i przypięty do niego modal
 * @param modalProps - właściwości modalu
 * - onAddNew - funkcja z obiektu nadrzędnego wywoływana po dodaniu nowego elementu
 * - ModalBodyComponent - komponent wyświetlany w modalu
 * - właściwości modalu
 * @param buttonProps - właściwości przycisku
 *
 */
function GeneralAddNewModalButton({ modalProps: { onAddNew, // funkcja z obiektu nadrzędnego wywoływana po dodaniu nowego elementu
ModalBodyComponent, additionalModalBodyProps, modalTitle, repository, makeValidationSchema: validationSchema, }, buttonProps: { buttonCaption, buttonVariant = "outline-primary", buttonSize = "sm", buttonIsActive = false, buttonIsDisabled = false, }, }) {
    const [showForm, setShowForm] = (0, react_1.useState)(false);
    function handleOpen() {
        setShowForm(true);
    }
    function handleClose() {
        setShowForm(false);
    }
    return (react_1.default.createElement(react_1.default.Fragment, null,
        react_1.default.createElement(react_bootstrap_1.Button, { key: buttonCaption, variant: buttonVariant, size: buttonSize, active: buttonIsActive, disabled: buttonIsDisabled, onClick: handleOpen }, buttonCaption),
        react_1.default.createElement(GeneralModal_1.GeneralModal, { onClose: handleClose, show: showForm, isEditing: false, title: modalTitle, repository: repository, onAddNew: onAddNew, ModalBodyComponent: ModalBodyComponent, makeValidationSchema: validationSchema, modalBodyProps: {
                isEditing: false,
                additionalProps: additionalModalBodyProps,
            } })));
}
exports.GeneralAddNewModalButton = GeneralAddNewModalButton;
/** Wyświetla ikonę kosza podłaczoną do Modala - nie przyjmuje ButtonProps */
function GeneralDeleteModalButton({ modalProps: { onDelete, modalTitle, initialData, repository }, }) {
    const [showForm, setShowForm] = (0, react_1.useState)(false);
    function handleOpen() {
        setShowForm(true);
    }
    function handleClose() {
        setShowForm(false);
    }
    async function handleDelete() {
        await repository.deleteItemNodeJS(initialData.id);
        onDelete(initialData.id);
    }
    return (react_1.default.createElement(react_1.default.Fragment, null,
        react_1.default.createElement("a", { href: '#', onClick: handleOpen, className: 'icon-vertical text-danger' },
            react_1.default.createElement(react_fontawesome_1.FontAwesomeIcon, { icon: free_solid_svg_icons_1.faTrash, size: "lg" })),
        react_1.default.createElement(ConfirmModal_1.default, { onClose: handleClose, show: showForm, title: modalTitle, onConfirm: handleDelete, prompt: `Czy na pewno chcesz usunąć ${initialData?.name}?` })));
}
exports.GeneralDeleteModalButton = GeneralDeleteModalButton;
