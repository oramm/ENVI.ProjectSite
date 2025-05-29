import React, { useEffect, useState } from "react";
import { Modal, Button, Form, Alert, Spinner, Container, Placeholder, Row, Col, ProgressBar } from "react-bootstrap";
import { useForm, FieldValues, set } from "react-hook-form";
import RepositoryReact from "../../React/RepositoryReact";
import { FormProvider } from "./FormContext";
import { parseFieldValuestoFormData as parseFieldValuesToFormData } from "../Resultsets/CommonComponentsController";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import "../../Css/styles.css";
import { ModalBodyProps } from "./ModalsTypes";
import { RepositoryDataItem } from "../../../Typings/bussinesTypes";
import ErrorBoundary from "./ErrorBoundary";
import { SpinnerBootstrap } from "../Resultsets/CommonComponents";
import { SessionTask } from "../../../Typings/sessionTypes";
import merge from "lodash.merge";
import ToolsFetch from "../../React/Tools/ToolsFetch";

type GeneralModalProps<DataItemType extends RepositoryDataItem = RepositoryDataItem> = {
    show: boolean;
    title: string;
    subtitle?: string;
    isEditing: boolean;
    onEdit?: (object: DataItemType) => void;
    specialActionRoute?: string;
    specialRetrieveActionRoute?: string;
    onAddNew?: (object: DataItemType) => void;
    onClose: () => void;
    repository: RepositoryReact<DataItemType>;
    ModalBodyComponent: React.ComponentType<ModalBodyProps<DataItemType>>;
    modalBodyProps: ModalBodyProps<DataItemType>;
    makeValidationSchema?: (isEditing: boolean) => yup.ObjectSchema<any>;
    fieldsToUpdate?: string[];
    shouldRetrieveDataBeforeEdit?: boolean;
    size?: "sm" | "lg" | "xl" | undefined;
};

export function GeneralModal<DataItemType extends RepositoryDataItem = RepositoryDataItem>({
    show,
    title,
    subtitle,
    isEditing,
    specialActionRoute,
    specialRetrieveActionRoute,
    onEdit,
    onAddNew,
    onClose,
    repository,
    ModalBodyComponent,
    modalBodyProps,
    makeValidationSchema: validationSchema,
    fieldsToUpdate,
    shouldRetrieveDataBeforeEdit = false,
    size = "lg",
}: GeneralModalProps<DataItemType>) {
    const [dataObjectFromServer, setDataObjectFromServer] = useState<DataItemType | undefined>(undefined);
    const [isLoadingData, setIsLoadingData] = useState(false);

    const [errorMessage, setErrorMessage] = useState("");
    const [requestPending, setRequestPending] = useState(false);
    const [progressData, setProgressData] = useState<{ text: string; percent?: number }>({
        text: "",
        percent: undefined,
    });

    const formMethods = useForm({
        defaultValues: {},
        mode: "onChange",
        resolver: validationSchema ? yupResolver(validationSchema(isEditing)) : undefined,
    });
    useEffect(() => {
        setErrorMessage("");
        setProgressData({ text: "" });
        async function fetchData() {
            await loadDataObject();
        }
        fetchData();
    }, [show]);

    // Sprawdź repository przy pierwszym renderze
    useEffect(() => {
        if (!repository) {
            const error = new Error("Repository is undefined in GeneralModal");
            ToolsFetch.sendClientErrorReport(error, {
                action: "GeneralModal_repository_validation",
                modalTitle: title,
                isEditing,
            });
            setErrorMessage("Błąd: Repository nie został przekazany do modala");
        }
    }, []);

    async function loadDataObject() {
        if (!show || !shouldRetrieveDataBeforeEdit || !isEditing) return;

        if (!repository) {
            const error = new Error("Repository is undefined in loadDataObject");
            ToolsFetch.sendClientErrorReport(error, {
                action: "GeneralModal_loadDataObject",
                modalTitle: title,
            });
            setErrorMessage("Błąd: Repository nie został przekazany do modala");
            return;
        }

        setIsLoadingData(true);
        try {
            const dataObjectFromServer = (
                await repository.loadItemsFromServerPOST(
                    [{ id: modalBodyProps.initialData?.id }],
                    specialRetrieveActionRoute
                )
            )[0];
            if (dataObjectFromServer) {
                repository.replaceCurrentItemById(dataObjectFromServer.id, dataObjectFromServer);
                repository.replaceItemById(dataObjectFromServer.id, dataObjectFromServer);
            } else {
                throw new Error("Nie znaleziono obiektu");
            }

            setDataObjectFromServer(dataObjectFromServer as DataItemType);
        } catch (error) {
            ToolsFetch.sendClientErrorReport(error, {
                repositoryName: repository?.name,
                action: "GeneralModal_loadDataObject_fetch",
                modalTitle: title,
                itemId: modalBodyProps.initialData?.id,
            });
            if (error instanceof Error) {
                setErrorMessage(error.message);
            }
        } finally {
            setIsLoadingData(false);
        }
    }
    async function handleSubmitRepository(data: FieldValues) {
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
            const requestData = hasFiles ? parseFieldValuesToFormData(data) : data;
            if (isEditing) {
                if (hasFiles) {
                    await handleEditWithFiles(requestData as FormData);
                } else {
                    await handleEditWithoutFiles(requestData as FieldValues);
                }
            } else {
                await handleAdd(requestData);
            }
            onClose();
            setRequestPending(false);
        } catch (error) {
            if (error instanceof Error) setErrorMessage(error.message);
            ToolsFetch.sendClientErrorReport(error, {
                repositoryName: repository?.name,
                action: "GeneralModal_handleSubmit_" + (isEditing ? "edit" : "add"),
                modalTitle: title,
                hasRepository: !!repository,
            });
            setRequestPending(false);
        }
    }

    async function handleEditWithFiles(data: FormData) {
        const currentDataItem = { ...repository.currentItems[0] };
        data.append("id", currentDataItem.id.toString());

        appendContextData(currentDataItem, data);
        // dołącz oryginalne dane jako JSON-string
        data.append("_originalData", JSON.stringify(currentDataItem));
        const editedObject = await repository.editItem(data as FormData, specialActionRoute, fieldsToUpdate);
        if (onEdit) onEdit(editedObject);
    }

    /** uzupełnij o dane z obiektu currentDataItem, które nie zostały przesłane w formularzu */
    function appendContextData(currentDataItem: Record<string, any>, data: FormData) {
        for (const key in currentDataItem) {
            if (!data.has(key)) {
                const value = currentDataItem[key];
                // Check if the value is an object and not a Blob, then convert it to a JSON string
                if (typeof value === "object" && value !== null && !(value instanceof Blob)) {
                    data.append(key, JSON.stringify(value));
                } else if (typeof value === "string" || value instanceof Blob) {
                    // Directly append strings and Blobs
                    data.append(key, value);
                } else {
                    // Convert other types to string
                    data.append(key, String(value));
                }
            }
        }
    }

    async function handleEditWithoutFiles(data: FieldValues) {
        const currentDataItem = { ...repository.currentItems[0] };
        const objectToEdit = merge(
            {},
            currentDataItem,
            data,
            { _contextData: modalBodyProps.contextData },
            { _originalData: currentDataItem } // oryginalne dane
        ) as DataItemType;

        const editedObject = await repository.editItem(
            objectToEdit,
            specialActionRoute,
            fieldsToUpdate,
            handleProgress
        );
        if (onEdit) onEdit(editedObject);
    }

    async function handleAdd(data: FormData | FieldValues) {
        if (data instanceof FormData) {
            data.append("_contextData", JSON.stringify(modalBodyProps.contextData));
        } else {
            data = {
                ...data,
                _contextData: modalBodyProps.contextData as object,
            };
        }

        const newObject = await repository.addNewItem(data, undefined, handleProgress);
        if (onAddNew) onAddNew(newObject);
    }

    function renderFormBody() {
        if (isLoadingData) {
            return (
                <div className="text-center m-5">
                    <SpinnerBootstrap />
                    <div className="m-3">Ładuję dane...</div>
                </div>
            );
        }
        return (
            <Container>
                <FormProvider value={formMethods}>
                    <ModalBodyComponent
                        {...{ ...modalBodyProps, initialData: dataObjectFromServer || modalBodyProps.initialData }}
                    />
                    {errorMessage && (
                        <Alert
                            style={{ whiteSpace: "pre-wrap" }}
                            className="mt-3"
                            variant="danger"
                            onClose={() => setErrorMessage("")}
                            dismissible
                        >
                            {errorMessage}
                        </Alert>
                    )}
                </FormProvider>
            </Container>
        );
    }

    function renderHeader() {
        return (
            <Row>
                <Col>
                    <h5>{title}</h5>
                    {subtitle && <div className="text-muted small" dangerouslySetInnerHTML={{ __html: subtitle }} />}
                </Col>
            </Row>
        );
    }

    function handleProgress(sessionTask: SessionTask) {
        makeProgressMessage(sessionTask);
    }

    function makeProgressMessage(sessionTask: SessionTask) {
        if (!sessionTask.progressMesage) return "";
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
        if (progressData.percent === undefined && progressData.text === "") return null;
        if (progressData.percent === undefined)
            return <div className="text-muted small me-3 mb-2">{progressData.text}</div>;
        return (
            <div className="w-100 mb-2">
                <ProgressBar
                    now={progressData.percent ?? 0}
                    label={`${progressData.percent ?? 0}%`}
                    variant="info"
                    style={{ height: "0.6rem" }}
                />
                <div className="text-muted small mt-1">{progressData.text}</div>
            </div>
        );
    }

    return (
        <Modal
            size={size}
            show={show}
            onHide={onClose}
            onClick={(e: any) => e.stopPropagation()}
            onDoubleClick={(e: any) => e.stopPropagation()}
        >
            <ErrorBoundary>
                <Form onSubmit={formMethods.handleSubmit(handleSubmitRepository)}>
                    <Modal.Header closeButton={true}>{renderHeader()}</Modal.Header>
                    <Modal.Body>{renderFormBody()}</Modal.Body>
                    <Modal.Footer>
                        <Row className="w-100 align-items-center text-end">
                            <Col xs="12" sm="8" className="W-100">
                                {renderProgressBar()}
                            </Col>
                            <Col className="text-end">
                                <Button variant="secondary" className="me-2 mb-2" onClick={onClose}>
                                    Anuluj
                                </Button>
                                <Button
                                    type="submit"
                                    variant="primary"
                                    className="mb-2"
                                    disabled={!formMethods.formState.isValid || requestPending || isLoadingData}
                                >
                                    <span className="d-inline-flex align-items-center">
                                        Zatwierdź
                                        {requestPending && (
                                            <Spinner
                                                as="span"
                                                animation="border"
                                                size="sm"
                                                role="status"
                                                aria-hidden="true"
                                                className="ms-2"
                                            />
                                        )}
                                    </span>
                                </Button>
                            </Col>
                        </Row>
                    </Modal.Footer>
                </Form>
            </ErrorBoundary>
        </Modal>
    );
}
