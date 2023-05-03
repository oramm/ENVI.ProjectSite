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
exports.GeneralDeleteModalButton = exports.GeneralAddNewModalButton = exports.GeneralEditModalButton = exports.GeneralModal = void 0;
const react_1 = __importStar(require("react"));
const react_bootstrap_1 = require("react-bootstrap");
const react_hook_form_1 = require("react-hook-form");
const Tools_1 = __importDefault(require("../React/Tools"));
const FormContext_1 = require("./FormContext");
const CommonComponents_1 = require("./Resultsets/CommonComponents");
const CommonComponentsController_1 = require("./Resultsets/CommonComponentsController");
const yup_1 = require("@hookform/resolvers/yup");
function GeneralModal({ show, title, isEditing, onEdit, onAddNew, onClose, repository, ModalBodyComponent, modalBodyProps, validationSchema, }) {
    const [errorMessage, setErrorMessage] = (0, react_1.useState)('');
    const [requestPending, setRequestPending] = (0, react_1.useState)(false);
    const { register, setValue, watch, handleSubmit, control, formState: { errors, isValid }, trigger, } = (0, react_hook_form_1.useForm)({
        defaultValues: {},
        mode: 'onChange',
        resolver: validationSchema ? (0, yup_1.yupResolver)(validationSchema) : undefined
    });
    let newObject;
    async function handleSubmitRepository(data) {
        try {
            setErrorMessage('');
            setRequestPending(true);
            // Sprawdź, czy obiekt data zawiera jakiekolwiek pliki
            const hasFiles = Object.values(data).some(value => value instanceof File);
            // Jeśli data zawiera pliki, przetwórz go na FormData, w przeciwnym razie użyj data bezpośrednio
            const requestData = hasFiles ? (0, CommonComponentsController_1.parseFieldValuestoFormData)(data) : data;
            (isEditing) ? await handleEdit(requestData) : await handleAdd(requestData);
            onClose();
            setRequestPending(false);
        }
        catch (error) {
            if (error instanceof Error)
                setErrorMessage(error.message);
            setRequestPending(false);
        }
    }
    ;
    async function handleEdit(data) {
        const currentDataItem = { ...repository.currentItems[0] };
        const objectToEdit = data instanceof FormData ? Tools_1.default.updateObject(data, currentDataItem) : data;
        //uzupełnij atrybut id - bo nie jest przesyłany w formularzu
        objectToEdit.id = currentDataItem.id;
        const editedObject = await repository.editItemNodeJS(objectToEdit);
        if (onEdit)
            onEdit(editedObject);
    }
    ;
    async function handleAdd(formData) {
        newObject = await repository.addNewItemNodeJS(formData);
        if (onAddNew)
            onAddNew(newObject);
    }
    ;
    return (react_1.default.createElement(react_bootstrap_1.Modal, { size: 'lg', show: show, onHide: onClose, onClick: (e) => e.stopPropagation(), onDoubleClick: (e) => e.stopPropagation() },
        react_1.default.createElement(react_bootstrap_1.Form, { onSubmit: handleSubmit(handleSubmitRepository) },
            react_1.default.createElement(react_bootstrap_1.Modal.Header, { closeButton: true },
                react_1.default.createElement(react_bootstrap_1.Modal.Title, null, title)),
            react_1.default.createElement(react_bootstrap_1.Modal.Body, null,
                react_1.default.createElement(react_bootstrap_1.Container, null,
                    react_1.default.createElement(FormContext_1.FormProvider, { value: { register, setValue, watch, handleSubmit, control, formState: { errors, isValid }, trigger } },
                        react_1.default.createElement(ModalBodyComponent, { ...modalBodyProps }),
                        errorMessage && (react_1.default.createElement(react_bootstrap_1.Alert, { variant: "danger", onClose: () => setErrorMessage(''), dismissible: true }, errorMessage))))),
            react_1.default.createElement(react_bootstrap_1.Modal.Footer, null,
                requestPending && react_1.default.createElement(react_bootstrap_1.Spinner, { animation: "border", variant: "primary" }),
                react_1.default.createElement(react_bootstrap_1.Button, { variant: "secondary", onClick: onClose }, "Anuluj"),
                react_1.default.createElement(react_bootstrap_1.Button, { type: "submit", variant: "primary", disabled: !isValid }, "Zatwierd\u017A")))));
}
exports.GeneralModal = GeneralModal;
function GeneralEditModalButton({ modalProps: { onEdit, ModalBodyComponent, additionalModalBodyProps, modalTitle, initialData, repository, validationSchema, }, buttonProps = {}, }) {
    const { buttonCaption = "Edytuj", buttonVariant = "outline-primary" } = buttonProps;
    const [showForm, setShowForm] = (0, react_1.useState)(false);
    function handleOpen() {
        setShowForm(true);
    }
    function handleClose() {
        setShowForm(false);
    }
    return (react_1.default.createElement(react_1.default.Fragment, null,
        react_1.default.createElement(react_bootstrap_1.Button, { variant: buttonVariant, onClick: handleOpen }, buttonCaption),
        react_1.default.createElement(GeneralModal, { onClose: handleClose, show: showForm, isEditing: true, title: modalTitle, repository: repository, onEdit: onEdit, ModalBodyComponent: ModalBodyComponent, validationSchema: validationSchema, modalBodyProps: {
                isEditing: true,
                initialData: initialData,
                additionalProps: additionalModalBodyProps,
            } })));
}
exports.GeneralEditModalButton = GeneralEditModalButton;
/** Wyświetla przycisk i przypięty do niego modal
 * @param modalProps - właściwości modalu
 * - onAddNew - funkcja z obiektu nadrzędnego wywoływana po dodaniu nowego elementu
 * - ModalBodyComponent - komponent wyświetlany w modalu
 * - właściwości modalu
 * @param buttonProps - właściwości przycisku
 *
 */
function GeneralAddNewModalButton({ modalProps: { onAddNew, // funkcja z obiektu nadrzędnego wywoływana po dodaniu nowego elementu
ModalBodyComponent, additionalModalBodyProps, modalTitle, repository, validationSchema, }, buttonProps: { buttonCaption, buttonVariant = "outline-primary", buttonSize = "sm", buttonIsActive = false, buttonIsDisabled = false, }, }) {
    const [showForm, setShowForm] = (0, react_1.useState)(false);
    function handleOpen() {
        setShowForm(true);
    }
    function handleClose() {
        setShowForm(false);
    }
    return (react_1.default.createElement(react_1.default.Fragment, null,
        react_1.default.createElement(react_bootstrap_1.Button, { key: buttonCaption, variant: buttonVariant, size: buttonSize, active: buttonIsActive, disabled: buttonIsDisabled, onClick: handleOpen }, buttonCaption),
        react_1.default.createElement(GeneralModal, { onClose: handleClose, show: showForm, isEditing: false, title: modalTitle, repository: repository, onAddNew: onAddNew, ModalBodyComponent: ModalBodyComponent, validationSchema: validationSchema, modalBodyProps: {
                isEditing: false,
                additionalProps: additionalModalBodyProps,
            } })));
}
exports.GeneralAddNewModalButton = GeneralAddNewModalButton;
function GeneralDeleteModalButton({ modalProps: { onDelete, modalTitle, initialData, repository }, buttonProps = {}, }) {
    const { buttonCaption = "Usuń", buttonVariant = "outline-danger" } = buttonProps;
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
        react_1.default.createElement(react_bootstrap_1.Button, { variant: buttonVariant, onClick: handleOpen }, buttonCaption),
        react_1.default.createElement(CommonComponents_1.ConfirmModal, { onClose: handleClose, show: showForm, title: modalTitle, onConfirm: handleDelete, prompt: `Czy na pewno chcesz usunąć ${initialData.name}?` })));
}
exports.GeneralDeleteModalButton = GeneralDeleteModalButton;
