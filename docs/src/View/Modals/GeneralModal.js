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
exports.GeneralModal = GeneralModal;
const react_1 = __importStar(require("react"));
const react_bootstrap_1 = require("react-bootstrap");
const react_hook_form_1 = require("react-hook-form");
const RepositoryReact_1 = __importDefault(require("../../React/RepositoryReact"));
const FormContext_1 = require("./FormContext");
const CommonComponentsController_1 = require("../Resultsets/CommonComponentsController");
const yup_1 = require("@hookform/resolvers/yup");
require("../../Css/styles.css");
const ErrorBoundary_1 = __importDefault(require("./ErrorBoundary"));
const CommonComponents_1 = require("../Resultsets/CommonComponents");
const lodash_merge_1 = __importDefault(require("lodash.merge"));
const ToolsFetch_1 = __importDefault(require("../../React/Tools/ToolsFetch"));
function GeneralModal({ show, title, subtitle, isEditing, specialActionRoute, specialRetrieveActionRoute, onEdit, onAddNew, onClose, repository, ModalBodyComponent, modalBodyProps, makeValidationSchema: validationSchema, fieldsToUpdate, shouldRetrieveDataBeforeEdit = false, size = "lg", }) {
    const [dataObjectFromServer, setDataObjectFromServer] = (0, react_1.useState)(undefined);
    const [isLoadingData, setIsLoadingData] = (0, react_1.useState)(false);
    const [errorMessage, setErrorMessage] = (0, react_1.useState)("");
    const [requestPending, setRequestPending] = (0, react_1.useState)(false);
    const [progressData, setProgressData] = (0, react_1.useState)({
        text: "",
        percent: undefined,
    });
    const formMethods = (0, react_hook_form_1.useForm)({
        defaultValues: {},
        mode: "onChange",
        resolver: validationSchema ? (0, yup_1.yupResolver)(validationSchema(isEditing)) : undefined,
    });
    (0, react_1.useEffect)(() => {
        setErrorMessage("");
        setProgressData({ text: "" });
        async function fetchData() {
            await loadDataObject();
        }
        fetchData();
    }, [show]);
    // Sprawdź repository przy pierwszym renderze
    (0, react_1.useEffect)(() => {
        if (!repository) {
            const error = new Error("Repository is undefined in GeneralModal");
            ToolsFetch_1.default.sendClientErrorReport(error, {
                action: "GeneralModal_repository_validation",
                modalTitle: title,
                isEditing,
            });
            setErrorMessage("Błąd: Repository nie został przekazany do modala");
        }
    }, []);
    async function loadDataObject() {
        if (!show || !shouldRetrieveDataBeforeEdit || !isEditing)
            return;
        if (!repository) {
            const error = new Error("Repository is undefined in loadDataObject");
            ToolsFetch_1.default.sendClientErrorReport(error, {
                action: "GeneralModal_loadDataObject",
                modalTitle: title,
                item: modalBodyProps.initialData,
            });
            setErrorMessage("Błąd: Repository nie został przekazany do modala");
            return;
        }
        setIsLoadingData(true);
        try {
            // ✅ Tworzymy tymczasowe repository tylko do pobrania szczegółów
            // NIE nadpisuje głównego repository.items!
            const tempRepository = new RepositoryReact_1.default({
                name: `${repository.name}_modalDetails_temp`,
                actionRoutes: {
                    getRoute: repository.actionRoutes.getRoute,
                    addNewRoute: "",
                    editRoute: "",
                    deleteRoute: "",
                },
            });
            const dataObjectFromServer = (await tempRepository.loadItemsFromServerPOST([{ id: modalBodyProps.initialData?.id }], specialRetrieveActionRoute))[0];
            if (dataObjectFromServer) {
                // ✅ Aktualizuj TYLKO currentItems i items w głównym repository
                // (dla spójności danych, nie nadpisuj całej listy)
                repository.replaceCurrentItemById(dataObjectFromServer.id, dataObjectFromServer);
                repository.replaceItemById(dataObjectFromServer.id, dataObjectFromServer);
            }
            else {
                throw new Error("Nie znaleziono obiektu");
            }
            setDataObjectFromServer(dataObjectFromServer);
        }
        catch (error) {
            ToolsFetch_1.default.sendClientErrorReport(error, {
                repositoryName: repository?.name,
                action: "GeneralModal_loadDataObject_fetch",
                modalTitle: title,
                itemId: modalBodyProps.initialData?.id,
                item: modalBodyProps.initialData || null,
            });
            if (error instanceof Error) {
                setErrorMessage(error.message);
            }
        }
        finally {
            setIsLoadingData(false);
        }
    }
    async function handleSubmitRepository(data) {
        try {
            if (!repository) {
                throw new Error("Repository nie został przekazany do modala");
            }
            setErrorMessage("");
            setProgressData({ text: "" });
            setRequestPending(true);
            // Sprawdź, czy obiekt data zawiera jakiekolwiek pliki
            const hasFiles = Object.values(data).some((value) => value instanceof FileList || value instanceof File);
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
            ToolsFetch_1.default.sendClientErrorReport(error, {
                repositoryName: repository?.name,
                action: "GeneralModal_handleSubmit_" + (isEditing ? "edit" : "add"),
                modalTitle: title,
                hasRepository: !!repository,
                currentitem: isEditing ? repository?.currentItems?.[0] : undefined,
                item: modalBodyProps.initialData,
                _fieldsToUpdate: isEditing ? fieldsToUpdate : undefined,
            });
            setRequestPending(false);
        }
    }
    async function handleEditWithFiles(data) {
        const currentDataItem = { ...repository.currentItems[0] };
        appendContextData(currentDataItem, data);
        // dołącz oryginalne dane jako JSON-string
        data.append("_originalData", JSON.stringify(currentDataItem));
        const editedObject = await repository.editItem(data, specialActionRoute, fieldsToUpdate);
        if (onEdit)
            onEdit(editedObject);
    }
    /** uzupełnij o dane z obiektu currentDataItem, które nie zostały przesłane w formularzu */
    function appendContextData(currentDataItem, data) {
        for (const key in currentDataItem) {
            if (!data.has(key)) {
                const value = currentDataItem[key];
                // Check if the value is an object and not a Blob, then convert it to a JSON string
                if (typeof value === "object" && value !== null && !(value instanceof Blob)) {
                    data.append(key, JSON.stringify(value));
                }
                else if (typeof value === "string" || value instanceof Blob) {
                    // Directly append strings and Blobs
                    data.append(key, value);
                }
                else {
                    // Convert other types to string
                    data.append(key, String(value));
                }
            }
        }
    }
    async function handleEditWithoutFiles(data) {
        const currentDataItem = { ...repository.currentItems[0] };
        const objectToEdit = (0, lodash_merge_1.default)({}, currentDataItem, data, { _contextData: modalBodyProps.contextData }, { _originalData: currentDataItem } // oryginalne dane
        );
        const editedObject = await repository.editItem(objectToEdit, specialActionRoute, fieldsToUpdate, handleProgress);
        if (onEdit)
            onEdit(editedObject);
    }
    async function handleAdd(data) {
        if (data instanceof FormData) {
            data.append("_contextData", JSON.stringify(modalBodyProps.contextData));
        }
        else {
            data = {
                ...data,
                _contextData: modalBodyProps.contextData,
            };
        }
        const newObject = await repository.addNewItem(data, undefined, handleProgress);
        if (onAddNew)
            onAddNew(newObject);
    }
    function renderFormBody() {
        if (isLoadingData) {
            return (react_1.default.createElement("div", { className: "text-center m-5" },
                react_1.default.createElement(CommonComponents_1.SpinnerBootstrap, null),
                react_1.default.createElement("div", { className: "m-3" }, "\u0141aduj\u0119 dane...")));
        }
        return (react_1.default.createElement(react_bootstrap_1.Container, null,
            react_1.default.createElement(FormContext_1.FormProvider, { value: formMethods },
                react_1.default.createElement(ModalBodyComponent, { ...modalBodyProps, initialData: dataObjectFromServer || modalBodyProps.initialData }),
                errorMessage && (react_1.default.createElement(react_bootstrap_1.Alert, { style: { whiteSpace: "pre-wrap" }, className: "mt-3", variant: "danger", onClose: () => setErrorMessage(""), dismissible: true }, errorMessage)))));
    }
    function renderHeader() {
        return (react_1.default.createElement(react_bootstrap_1.Row, null,
            react_1.default.createElement(react_bootstrap_1.Col, null,
                react_1.default.createElement("h5", null, title),
                subtitle && react_1.default.createElement("div", { className: "text-muted small", dangerouslySetInnerHTML: { __html: subtitle } }))));
    }
    function handleProgress(sessionTask) {
        makeProgressMessage(sessionTask);
    }
    function makeProgressMessage(sessionTask) {
        if (!sessionTask.progressMesage)
            return "";
        if (sessionTask.status === "error") {
            setProgressData({ text: sessionTask.error || "" });
            return "";
        }
        const percent = sessionTask.percent !== undefined ? sessionTask.percent : "";
        const message = `Postęp: ${percent}% ${sessionTask.progressMesage}`;
        setProgressData({ text: message, percent: sessionTask.percent });
    }
    function renderProgressBar() {
        //stara wersja
        if (progressData.percent === undefined && progressData.text === "")
            return null;
        if (progressData.percent === undefined)
            return react_1.default.createElement("div", { className: "text-muted small me-3 mb-2" }, progressData.text);
        return (react_1.default.createElement("div", { className: "w-100 mb-2" },
            react_1.default.createElement(react_bootstrap_1.ProgressBar, { now: progressData.percent ?? 0, label: `${progressData.percent ?? 0}%`, variant: "info", style: { height: "0.6rem" } }),
            react_1.default.createElement("div", { className: "text-muted small mt-1" }, progressData.text)));
    }
    return (react_1.default.createElement(react_bootstrap_1.Modal, { size: size, show: show, onHide: onClose, onClick: (e) => e.stopPropagation(), onDoubleClick: (e) => e.stopPropagation() },
        react_1.default.createElement(ErrorBoundary_1.default, null,
            react_1.default.createElement(react_bootstrap_1.Form, { onSubmit: formMethods.handleSubmit(handleSubmitRepository) },
                react_1.default.createElement(react_bootstrap_1.Modal.Header, { closeButton: true }, renderHeader()),
                react_1.default.createElement(react_bootstrap_1.Modal.Body, null, renderFormBody()),
                react_1.default.createElement(react_bootstrap_1.Modal.Footer, null,
                    react_1.default.createElement(react_bootstrap_1.Row, { className: "w-100 align-items-center text-end" },
                        react_1.default.createElement(react_bootstrap_1.Col, { xs: "12", sm: "8", className: "W-100" }, renderProgressBar()),
                        react_1.default.createElement(react_bootstrap_1.Col, { className: "text-end" },
                            react_1.default.createElement(react_bootstrap_1.Button, { variant: "secondary", className: "me-2 mb-2", onClick: onClose }, "Anuluj"),
                            react_1.default.createElement(react_bootstrap_1.Button, { type: "submit", variant: "primary", className: "mb-2", disabled: !formMethods.formState.isValid || requestPending || isLoadingData },
                                react_1.default.createElement("span", { className: "d-inline-flex align-items-center" },
                                    "Zatwierd\u017A",
                                    requestPending && (react_1.default.createElement(react_bootstrap_1.Spinner, { as: "span", animation: "border", size: "sm", role: "status", "aria-hidden": "true", className: "ms-2" })))))))))));
}
