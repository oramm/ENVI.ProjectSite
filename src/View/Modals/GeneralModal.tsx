import React, { useEffect, useRef, useState } from "react";
import { Modal, Button, Form, Alert, Spinner, Container, Placeholder, Row, Col, ProgressBar } from "react-bootstrap";
import { useForm, FieldValues, set } from "react-hook-form";
import RepositoryReact from "../../React/RepositoryReact";
import { FormProvider } from "./FormContext";
import { parseFieldValuestoFormData as parseFieldValuesToFormData } from "../Resultsets/CommonComponentsController";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import "../../Css/styles.css";
import { ModalBodyProps, ModalSaveCallback } from "./ModalsTypes";
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
    headerBadge?: React.ReactNode;
    isEditing: boolean;
    onEdit?: ModalSaveCallback<DataItemType>;
    specialActionRoute?: string;
    specialRetrieveActionRoute?: string;
    onAddNew?: ModalSaveCallback<DataItemType>;
    onClose: () => void;
    repository: RepositoryReact<DataItemType>;
    ModalBodyComponent: React.ComponentType<ModalBodyProps<DataItemType>>;
    modalBodyProps: ModalBodyProps<DataItemType>;
    makeValidationSchema?: (isEditing: boolean) => yup.ObjectSchema<any>;
    fieldsToUpdate?: string[];
    shouldRetrieveDataBeforeEdit?: boolean;
    size?: "sm" | "lg" | "xl" | undefined;
    enforceFocus?: boolean;
};

/**
 * Buduje obiekt wysyłany na serwer przy edycji: dane z repozytorium uzupełnione
 * wartościami z formularza.
 *
 * UWAGA: `lodash.merge` łączy TABLICE po indeksie, zamiast je zastępować. Dla pól
 * wielokrotnego wyboru (`_cases`, `_entitiesMain`, `_entitiesCc`, ...) dawało to wynik
 * będący sklejką starej i nowej listy:
 *   [A, B] + [B]  => [B, B]  → duplikat w bazie (UNIQUE_LetterId_CaseId, 409)
 *   [A, B] + [A]  => [A, B]  → usunięta pozycja "sama z siebie" wracała
 *   [A, B] + []   => [A, B]  → skasowanie wszystkich pozycji nie działało
 * Wartość z formularza jest kompletna, więc tablice nadpisujemy w całości. Pola
 * nieobecne w formularzu (undefined) nadal uzupełnia `merge` z `currentDataItem`.
 */
export function mergeFormDataIntoItem(
    currentDataItem: Record<string, any>,
    data: FieldValues,
    contextData?: unknown
) {
    const objectToEdit = merge(
        {},
        currentDataItem,
        data,
        { _contextData: contextData },
        { _originalData: currentDataItem } // oryginalne dane
    ) as Record<string, any>;

    overwriteArraysFromForm(objectToEdit, data);

    return objectToEdit;
}

/**
 * Nadpisuje w `target` każdą tablicę obecną w `source` — również zagnieżdżoną.
 * Kopia płytka (`[...value]`), bo `lodash.merge` też zwracał własne tablice: obiekt
 * wysyłany na serwer jest jeszcze mutowany w miejscu (`ToolsDate.convertDatesToUTC`)
 * i nie może współdzielić tablicy ze stanem formularza ani z `repository.items`.
 */
function overwriteArraysFromForm(target: Record<string, any>, source: Record<string, any>) {
    for (const [key, value] of Object.entries(source)) {
        if (Array.isArray(value)) target[key] = [...value];
        else if (isPlainObject(value) && isPlainObject(target[key])) overwriteArraysFromForm(target[key], value);
    }
}

function isPlainObject(value: unknown): value is Record<string, any> {
    return typeof value === "object" && value !== null && Object.getPrototypeOf(value) === Object.prototype;
}

/**
 * Zewnętrzny host modala. `GeneralModal` jest montowany na stałe przy przycisku
 * (tylko `show` się przełącza), więc gdyby useForm żyło tutaj, jego stan (wartości,
 * błędy, dirty) wyciekałby między kolejnymi otwarciami — react-bootstrap nie zawsze
 * odmontowuje zawartość, a efekty inicjalizujące pól odpalają się tylko przy montowaniu.
 *
 * Rozwiązanie: cała logika formularza żyje w `GeneralModalContent`, montowanym ze
 * ŚWIEŻYM `key` przy każdym otwarciu (openKey rośnie, gdy `show` przechodzi w true).
 * Dzięki temu każde otwarcie startuje z czystym useForm i na nowo odpala efekty
 * inicjalizujące ciała modala.
 */
export function GeneralModal<DataItemType extends RepositoryDataItem = RepositoryDataItem>(
    props: GeneralModalProps<DataItemType>,
) {
    const { show, onClose, size = "lg", enforceFocus = true } = props;
    // Świeży `key` przy każdym przejściu `show` false→true. Wzorzec "dostrajania stanu
    // przy zmianie propsów" (ustawienie stanu w trakcie renderu) — React porzuca bieżący
    // render i renderuje ponownie z nowym key, więc nie ma podwójnego montażu zawartości.
    const [openKey, setOpenKey] = useState(0);
    const [prevShow, setPrevShow] = useState(show);
    if (show !== prevShow) {
        setPrevShow(show);
        if (show) setOpenKey((key) => key + 1);
    }

    return (
        <Modal size={size} show={show} onHide={onClose} enforceFocus={enforceFocus}>
            <ErrorBoundary>
                <GeneralModalContent<DataItemType> key={openKey} {...props} />
            </ErrorBoundary>
        </Modal>
    );
}

function GeneralModalContent<DataItemType extends RepositoryDataItem = RepositoryDataItem>({
    show,
    title,
    subtitle,
    headerBadge,
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
}: GeneralModalProps<DataItemType>) {
    const [dataObjectFromServer, setDataObjectFromServer] = useState<DataItemType | undefined>(undefined);
    const [isLoadingData, setIsLoadingData] = useState(false);
    /**
     * Rekord utworzony w poprzedniej próbie dodania. Gdy sam `addNewItem` przeszedł, a padło
     * dopiero domknięcie zapisu (`onAddNew` — np. PUT konta systemowego), modal zostaje otwarty
     * z błędem. Ponowne "Zatwierdź" musi wtedy powtórzyć TYLKO domknięcie: bez tego drugie
     * kliknięcie zakładałoby drugi rekord.
     *
     * Konsekwencja: przy ponowieniu zmiany w polach rekordu bazowego nie idą już na serwer —
     * poprawiać trzeba to, na czym poległo domknięcie. `GeneralModalContent` montuje się ze
     * świeżym `key` przy każdym otwarciu, więc ref nie przecieka między otwarciami modala.
     */
    const createdItemRef = useRef<DataItemType | null>(null);

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
                item: modalBodyProps.initialData,
            });
            setErrorMessage("Błąd: Repository nie został przekazany do modala");
            return;
        }

        setIsLoadingData(true);
        try {
            // ✅ Tworzymy tymczasowe repository tylko do pobrania szczegółów
            // NIE nadpisuje głównego repository.items!
            const tempRepository = new RepositoryReact<DataItemType>({
                name: `${repository.name}_modalDetails_temp`,
                actionRoutes: {
                    getRoute: repository.actionRoutes.getRoute,
                    addNewRoute: "",
                    editRoute: "",
                    deleteRoute: "",
                },
            });

            const dataObjectFromServer = (
                await tempRepository.loadItemsFromServerPOST(
                    [{ id: modalBodyProps.initialData?.id }],
                    specialRetrieveActionRoute
                )
            )[0];
            if (dataObjectFromServer) {
                // ✅ Aktualizuj TYLKO currentItems i items w głównym repository
                // (dla spójności danych, nie nadpisuj całej listy)
                // Ensure currentItems contains the fetched object so edit handlers have access to its id
                repository.currentItems = [dataObjectFromServer];
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
                item: modalBodyProps.initialData || null,
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

            // Traktuj pole pliku jako "obecne" tylko gdy faktycznie wybrano plik.
            const hasFiles = Object.values(data).some((value) => {
                if (value instanceof FileList) return value.length > 0;
                if (value instanceof File) return true;
                return false;
            });
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
                currentitem: isEditing ? repository?.currentItems?.[0] : undefined,
                item: modalBodyProps.initialData,
                _fieldsToUpdate: isEditing ? fieldsToUpdate : undefined,
            });
            setRequestPending(false);
        }
    }

    async function handleEditWithFiles(data: FormData) {
        const currentDataItem = { ...repository.currentItems[0] };
        appendContextData(currentDataItem, data);

        // dołącz oryginalne dane jako JSON-string
        data.append("_originalData", JSON.stringify(currentDataItem));
        const editedObject = await repository.editItem(data as FormData, specialActionRoute, fieldsToUpdate);
        // `await`, bo część handlerów domyka zapis własnymi żądaniami (np. PUT konta v2).
        // Bez tego ich odrzucona obietnica nie wracała do `handleSubmitRepository`, modal
        // zamykał się jak po udanym zapisie, a błąd lądował najwyżej w konsoli.
        if (onEdit) await onEdit(editedObject);
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
        const objectToEdit = mergeFormDataIntoItem(
            currentDataItem,
            data,
            modalBodyProps.contextData
        ) as DataItemType;

        const editedObject = await repository.editItem(
            objectToEdit,
            specialActionRoute,
            fieldsToUpdate,
            handleProgress
        );
        // patrz komentarz w handleEditWithFiles — czekamy, żeby błąd handlera dotarł do modala.
        // `objectToEdit` jedzie drugim argumentem: odpowiedź serwera nie musi odbijać pól
        // formularza, a handler może ich potrzebować do własnych żądań (patrz ModalSaveCallback).
        if (onEdit) await onEdit(editedObject, objectToEdit);
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

        const newObject = createdItemRef.current ?? (await repository.addNewItem(data, undefined, handleProgress));
        createdItemRef.current = newObject;
        if (onAddNew) {
            // Merge form data into server response so callbacks retain form fields
            // (e.g. systemRoleId, systemEmail) that the backend strips before saving.
            // Server values take precedence; _contextData is stripped to avoid leaking
            // internal modal state into domain callbacks.
            // `await` z tego samego powodu co przy onEdit — handler może dopiero
            // dopisywać dane (konto systemowe, przypisania projektów) i jego błąd
            // musi zatrzymać modal, a nie zniknąć.
            if (data instanceof FormData) {
                await onAddNew(newObject);
            } else {
                const { _contextData: _stripped, ...cleanFormData } = data as any;
                const enriched = { ...cleanFormData, ...newObject } as DataItemType;
                // Keep repository.items in sync so FilterableTable reads enriched data
                if (newObject.id) repository.replaceItemById(newObject.id, enriched);
                await onAddNew(enriched);
            }
        }
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
                    <div className="d-flex flex-wrap align-items-center gap-2">
                        <h5 className="mb-0">{title}</h5>
                        {headerBadge}
                    </div>
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
    );
}
