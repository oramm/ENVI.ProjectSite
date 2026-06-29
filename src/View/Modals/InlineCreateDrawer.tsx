import React, { ReactNode, useEffect, useState } from "react";
import { Offcanvas, Button, Form, Alert, Spinner } from "react-bootstrap";
import { useForm, FieldValues } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import RepositoryReact from "../../React/RepositoryReact";
import { FormProvider } from "./FormContext";
import { parseFieldValuestoFormData as parseFieldValuesToFormData } from "../Resultsets/CommonComponentsController";
import { ModalBodyProps } from "./ModalsTypes";
import { RepositoryDataItem } from "../../../Typings/bussinesTypes";
import ErrorBoundary from "./ErrorBoundary";
import ToolsFetch from "../../React/Tools/ToolsFetch";

/**
 * Generyczny panel boczny (Offcanvas) do tworzenia nowego obiektu "w miejscu",
 * bez zamykania nadrzędnego modala. Lustrzane odbicie ścieżki dodawania z
 * `GeneralModal` (FormProvider + addNewItem), ale w formie panelu z `backdrop={false}`,
 * dzięki czemu host (np. formularz pisma) pozostaje widoczny i interaktywny.
 *
 * Wzorzec docelowo reużywalny jako "pick-or-create" w selektorach.
 * TODO(graf): panele mogą się zagnieżdżać (np. przyszły panel Kamienia milowego
 * otwierany z wnętrza tego panelu).
 */
interface InlineCreateDrawerProps<T extends RepositoryDataItem> {
    show: boolean;
    onHide: () => void;
    title: string;
    repository: RepositoryReact<T>;
    ModalBodyComponent: React.ComponentType<ModalBodyProps<T>>;
    makeValidationSchema?: (isEditing: boolean) => yup.ObjectSchema<any>;
    /** np. wybrany Kamień milowy przekazywany do CaseModalBody jako _parent */
    contextData?: unknown;
    additionalModalBodyProps?: Record<string, unknown>;
    /** rodzic dopisuje obiekt do opcji selektora i auto-zaznacza go */
    onCreated?: (created: T) => void;
    /** tryb edycji: gdy true, formularz jest pre-wypełniony danymi initialData */
    isEditing?: boolean;
    /** dane obiektu do edycji — pre-wypełniają formularz i są scalane z danymi formularza przy zapisie */
    initialData?: T;
    /** wywołany po pomyślnej edycji */
    onEdited?: (edited: T) => void;
    /** Badge wyświetlany obok tytułu — pokazuje ścieżkę kontekstu (kontrakt | kamień milowy | ...) */
    headerBadge?: ReactNode;
}

export function InlineCreateDrawer<T extends RepositoryDataItem>({
    show,
    onHide,
    title,
    repository,
    ModalBodyComponent,
    makeValidationSchema,
    contextData,
    additionalModalBodyProps,
    onCreated,
    isEditing = false,
    initialData,
    onEdited,
    headerBadge,
}: InlineCreateDrawerProps<T>) {
    const [errorMessage, setErrorMessage] = useState("");
    const [requestPending, setRequestPending] = useState(false);

    const formMethods = useForm({
        defaultValues: {},
        mode: "onChange",
        resolver: makeValidationSchema ? yupResolver(makeValidationSchema(isEditing)) : undefined,
    });

    // Czyść stan formularza i komunikaty przy każdym otwarciu/zamknięciu panelu.
    // W trybie tworzenia reset do pustego; w trybie edycji body-component sam
    // wypełni formularz przez swój własny useEffect z initialData.
    useEffect(() => {
        setErrorMessage("");
        setRequestPending(false);
        if (show && !isEditing) formMethods.reset({});
    }, [show]);

    async function handleSubmitRepository(data: FieldValues) {
        try {
            if (!repository) throw new Error("Repository nie został przekazany do panelu");

            setErrorMessage("");
            setRequestPending(true);

            if (isEditing) {
                // Scala initialData (zawiera id i pola nie pokazywane w formularzu)
                // z danymi formularza (zmiany wprowadzone przez użytkownika).
                const itemToEdit = { ...initialData, ...data } as T;
                const editedItem = (await repository.editItem(itemToEdit)) as T;
                onEdited?.(editedItem);
                onHide();
                return;
            }

            // Traktuj pole pliku jako "obecne" tylko gdy faktycznie wybrano plik
            // (zgodnie z logiką GeneralModal).
            const hasFiles = Object.values(data).some((value) => {
                if (value instanceof FileList) return value.length > 0;
                if (value instanceof File) return true;
                return false;
            });

            let requestData: FormData | FieldValues;
            if (hasFiles) {
                requestData = parseFieldValuesToFormData(data);
                requestData.append("_contextData", JSON.stringify(contextData));
            } else {
                requestData = { ...data, _contextData: contextData as object };
            }

            const newItem = (await repository.addNewItem(requestData)) as T;
            onCreated?.(newItem);
            onHide();
        } catch (error) {
            if (error instanceof Error) setErrorMessage(error.message);
            ToolsFetch.sendClientErrorReport(error, {
                repositoryName: repository?.name,
                action: isEditing ? "InlineCreateDrawer_handleSubmit_edit" : "InlineCreateDrawer_handleSubmit_add",
                drawerTitle: title,
            });
        } finally {
            setRequestPending(false);
        }
    }

    return (
        <Offcanvas
            show={show}
            onHide={onHide}
            placement="end"
            backdrop={false}
            scroll={true}
            // zIndex ponad warstwami Bootstrap modala (backdrop ~1050, modal ~1055), aby panel
            // nie był przyciemniany przez backdrop pisma ANI nie był przez modal przechwytywany
            // (modal trapuje pointer-events). Dzięki temu host pozostaje widoczny, a panel klikalny.
            style={{ width: 420, zIndex: 1060 }}
        >
            <ErrorBoundary>
                <Form onSubmit={(e) => { e.stopPropagation(); formMethods.handleSubmit(handleSubmitRepository)(e); }}>
                    <Offcanvas.Header closeButton>
                        <div className="d-flex flex-wrap align-items-center gap-2">
                            <Offcanvas.Title>{title}</Offcanvas.Title>
                            {headerBadge}
                        </div>
                    </Offcanvas.Header>
                    <Offcanvas.Body>
                        <FormProvider value={formMethods}>
                            <ModalBodyComponent
                                isEditing={isEditing}
                                initialData={initialData}
                                contextData={contextData}
                                additionalProps={additionalModalBodyProps}
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
                        <div className="text-end mt-3">
                            <Button variant="secondary" className="me-2" onClick={onHide}>
                                Anuluj
                            </Button>
                            <Button
                                type="submit"
                                variant="primary"
                                disabled={!formMethods.formState.isValid || requestPending}
                            >
                                <span className="d-inline-flex align-items-center">
                                    Zapisz
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
                        </div>
                    </Offcanvas.Body>
                </Form>
            </ErrorBoundary>
        </Offcanvas>
    );
}
