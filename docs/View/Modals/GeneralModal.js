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
exports.GeneralModal = void 0;
const react_1 = __importStar(require("react"));
const react_bootstrap_1 = require("react-bootstrap");
const react_hook_form_1 = require("react-hook-form");
const FormContext_1 = require("./FormContext");
const CommonComponentsController_1 = require("../Resultsets/CommonComponentsController");
const yup_1 = require("@hookform/resolvers/yup");
require("../../Css/styles.css");
const ErrorBoundary_1 = __importDefault(require("./ErrorBoundary"));
const CommonComponents_1 = require("../Resultsets/CommonComponents");
function GeneralModal({ show, title, isEditing, specialActionRoute, onEdit, onAddNew, onClose, repository, ModalBodyComponent, modalBodyProps, makeValidationSchema: validationSchema, fieldsToUpdate, shouldRetrieveDataBeforeEdit = false, }) {
    const [dataObjectFromServer, setDataObjectFromServer] = react_1.default.useState(undefined);
    const [isLoadingData, setIsLoadingData] = react_1.default.useState(false);
    const [dataLoaded, setDataLoaded] = react_1.default.useState(false);
    const [errorMessage, setErrorMessage] = (0, react_1.useState)('');
    const [requestPending, setRequestPending] = (0, react_1.useState)(false);
    const formMethods = (0, react_hook_form_1.useForm)({
        defaultValues: {},
        mode: 'onChange',
        resolver: validationSchema ? (0, yup_1.yupResolver)(validationSchema(isEditing)) : undefined
    });
    let newObject;
    (0, react_1.useEffect)(() => {
        async function fetchData() {
            await loadDataObject();
        }
        fetchData();
    }, [show]);
    async function loadDataObject() {
        if (!show || dataLoaded || !shouldRetrieveDataBeforeEdit || !isEditing)
            return;
        setIsLoadingData(true);
        const dataObjectFromServer = (await repository.loadItemsFromServerPOST([{ id: modalBodyProps.initialData?.id }]))[0];
        setDataObjectFromServer(dataObjectFromServer);
        setIsLoadingData(false);
        setDataLoaded(true);
    }
    async function handleSubmitRepository(data) {
        try {
            setErrorMessage('');
            setRequestPending(true);
            // Sprawdź, czy obiekt data zawiera jakiekolwiek pliki
            const hasFiles = Object.values(data).some(value => value instanceof FileList || value instanceof File);
            // Jeśli data zawiera pliki, przetwórz go na FormData, w przeciwnym razie użyj data bezpośrednio
            const requestData = hasFiles ? (0, CommonComponentsController_1.parseFieldValuestoFormData)(data) : data;
            if (isEditing) {
                if (hasFiles) {
                    await handleEditWithFiles(requestData);
                }
                else {
                    await handleEditWithoutFiles(requestData);
                }
            }
            else {
                await handleAdd(requestData);
            }
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
    async function handleEditWithFiles(data) {
        const currentDataItem = { ...repository.currentItems[0] };
        data.append('id', currentDataItem.id.toString());
        appendContextData(currentDataItem, data);
        const editedObject = await repository.editItem(data, specialActionRoute, fieldsToUpdate);
        if (onEdit)
            onEdit(editedObject);
    }
    ;
    /** uzupełnij o dane z obiektu currentDataItem, które nie zostały przesłane w formularzu */
    function appendContextData(currentDataItem, data) {
        for (const key in currentDataItem) {
            if (!data.has(key)) {
                // Przekształć obiekt JavaScript do formatu JSON jeżeli jest obiektem
                if (typeof currentDataItem[key] === 'object' && currentDataItem[key] !== null) {
                    data.append(key, JSON.stringify(currentDataItem[key]));
                }
                else {
                    data.append(key, currentDataItem[key]);
                }
            }
        }
    }
    async function handleEditWithoutFiles(data) {
        const currentDataItem = { ...repository.currentItems[0] };
        const objectToEdit = { ...currentDataItem, ...data };
        const editedObject = await repository.editItem(objectToEdit, specialActionRoute, fieldsToUpdate);
        if (onEdit)
            onEdit(editedObject);
    }
    ;
    async function handleAdd(data) {
        newObject = await repository.addNewItem(data);
        if (onAddNew)
            onAddNew(newObject);
    }
    ;
    function renderFormBody() {
        if (isLoadingData) {
            return (react_1.default.createElement("div", { className: "text-center m-5" },
                react_1.default.createElement(CommonComponents_1.SpinnerBootstrap, null),
                react_1.default.createElement("div", { className: "m-3" }, "\u0141aduj\u0119 dane...")));
        }
        return react_1.default.createElement(react_bootstrap_1.Container, null,
            react_1.default.createElement(FormContext_1.FormProvider, { value: formMethods },
                react_1.default.createElement(ModalBodyComponent, { ...{ ...modalBodyProps, initialData: dataObjectFromServer || modalBodyProps.initialData } }),
                errorMessage && (react_1.default.createElement(react_bootstrap_1.Alert, { variant: "danger", onClose: () => setErrorMessage(''), dismissible: true }, errorMessage))));
    }
    return (react_1.default.createElement(react_bootstrap_1.Modal, { size: 'lg', show: show, onHide: onClose, onClick: (e) => e.stopPropagation(), onDoubleClick: (e) => e.stopPropagation() },
        react_1.default.createElement(ErrorBoundary_1.default, null,
            react_1.default.createElement(react_bootstrap_1.Form, { onSubmit: formMethods.handleSubmit(handleSubmitRepository) },
                react_1.default.createElement(react_bootstrap_1.Modal.Header, { closeButton: true },
                    react_1.default.createElement(react_bootstrap_1.Modal.Title, null, title)),
                react_1.default.createElement(react_bootstrap_1.Modal.Body, null, renderFormBody()),
                react_1.default.createElement(react_bootstrap_1.Modal.Footer, null,
                    react_1.default.createElement(react_bootstrap_1.Button, { variant: "secondary", onClick: onClose }, "Anuluj"),
                    react_1.default.createElement(react_bootstrap_1.Button, { type: "submit", variant: "primary", disabled: !formMethods.formState.isValid || requestPending || isLoadingData },
                        "Zatwierd\u017A ",
                        ' ',
                        requestPending && react_1.default.createElement(react_bootstrap_1.Spinner, { as: "span", animation: "border", size: "sm", role: "status", "aria-hidden": "true" })))))));
}
exports.GeneralModal = GeneralModal;
function ModalFooter() {
}
