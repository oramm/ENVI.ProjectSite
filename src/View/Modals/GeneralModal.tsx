import React, { useEffect, useState } from 'react';
import { Modal, Button, Form, Alert, Spinner, Container, Placeholder } from 'react-bootstrap';
import { useForm, FieldValues } from 'react-hook-form';
import RepositoryReact from '../../React/RepositoryReact';
import { FormProvider } from './FormContext';
import { parseFieldValuestoFormData } from '../Resultsets/CommonComponentsController';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import '../../Css/styles.css';
import { ModalBodyProps } from './ModalsTypes';
import { RepositoryDataItem } from '../../../Typings/bussinesTypes';
import ErrorBoundary from './ErrorBoundary';
import { SpinnerBootstrap } from '../Resultsets/CommonComponents';

type GeneralModalProps<DataItemType extends RepositoryDataItem = RepositoryDataItem> = {
    show: boolean;
    title: string;
    isEditing: boolean;
    onEdit?: (object: DataItemType) => void;
    specialActionRoute?: string;
    onAddNew?: (object: DataItemType) => void;
    onClose: () => void;
    repository: RepositoryReact<DataItemType>;
    ModalBodyComponent: React.ComponentType<ModalBodyProps<DataItemType>>;
    modalBodyProps: ModalBodyProps<DataItemType>;
    makeValidationSchema?: (isEditing: boolean) => yup.ObjectSchema<any>;
    fieldsToUpdate?: string[];
    shouldRetrieveDataBeforeEdit?: boolean;
};

export function GeneralModal<DataItemType extends RepositoryDataItem = RepositoryDataItem>({
    show,
    title,
    isEditing,
    specialActionRoute,
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
    const [dataObjectFromServer, setDataObjectFromServer] = React.useState<DataItemType | undefined>(undefined);
    const [isLoadingData, setIsLoadingData] = React.useState(false);
    const [dataLoaded, setDataLoaded] = React.useState(false);

    const [errorMessage, setErrorMessage] = useState('');
    const [requestPending, setRequestPending] = useState(false);
    const formMethods = useForm({
        defaultValues: {},
        mode: 'onChange',
        resolver: validationSchema ? yupResolver(validationSchema(isEditing)) : undefined
    });
    let newObject: DataItemType;

    useEffect(() => {
        async function fetchData() {
            await loadDataObject();
        }
        fetchData();
    }, [show]);

    async function loadDataObject() {
        if (!show || dataLoaded || !shouldRetrieveDataBeforeEdit || !isEditing) return;
        setIsLoadingData(true);
        //TODO: w RepositoryReactdorobić funkckę która:
        const oldItems = repository.items;
        const dataObjectFromServer = (await repository.loadItemsFromServerPOST([{ id: modalBodyProps.initialData?.id }]))[0];
        repository.addToCurrentItems(dataObjectFromServer.id);
        repository.items = oldItems.map(item => item.id === repository.currentItems[0].id ? repository.currentItems[0] : item)

        setDataObjectFromServer(dataObjectFromServer as DataItemType);
        setIsLoadingData(false);
        setDataLoaded(true);
    }

    async function handleSubmitRepository(data: FieldValues) {
        try {
            setErrorMessage('');
            setRequestPending(true);

            // Sprawdź, czy obiekt data zawiera jakiekolwiek pliki
            const hasFiles = Object.values(data).some(value => value instanceof FileList || value instanceof File);
            // Jeśli data zawiera pliki, przetwórz go na FormData, w przeciwnym razie użyj data bezpośrednio
            const requestData = hasFiles ? parseFieldValuestoFormData(data) : data;
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
            if (error instanceof Error)
                setErrorMessage(error.message);
            setRequestPending(false);
        }
    };

    async function handleEditWithFiles(data: FormData) {
        const currentDataItem = { ...repository.currentItems[0] }
        data.append('id', currentDataItem.id.toString());

        appendContextData(currentDataItem, data);
        const editedObject = await repository.editItem(data as FormData, specialActionRoute, fieldsToUpdate);
        if (onEdit) onEdit(editedObject);
    };

    /** uzupełnij o dane z obiektu currentDataItem, które nie zostały przesłane w formularzu */
    function appendContextData(currentDataItem: DataItemType, data: FormData) {
        for (const key in currentDataItem) {
            if (!data.has(key)) {
                // Przekształć obiekt JavaScript do formatu JSON jeżeli jest obiektem
                if (typeof currentDataItem[key] === 'object' && currentDataItem[key] !== null) {
                    data.append(key, JSON.stringify(currentDataItem[key]));
                } else {
                    data.append(key, currentDataItem[key]);
                }
            }
        }
    }

    async function handleEditWithoutFiles(data: FieldValues) {
        const currentDataItem = { ...repository.currentItems[0] }
        const objectToEdit = { ...currentDataItem, ...data } as DataItemType;
        const editedObject = await repository.editItem(objectToEdit, specialActionRoute, fieldsToUpdate);
        if (onEdit) onEdit(editedObject);
    };


    async function handleAdd(data: FormData | FieldValues) {
        newObject = await repository.addNewItem(data);
        if (onAddNew) onAddNew(newObject);
    };

    function renderFormBody() {
        if (isLoadingData) {
            return (
                <div className="text-center m-5">
                    <SpinnerBootstrap />
                    <div className="m-3">Ładuję dane...</div>
                </div>
            );
        }

        return <Container>
            <FormProvider value={formMethods}>
                <ModalBodyComponent {...{ ...modalBodyProps, initialData: dataObjectFromServer || modalBodyProps.initialData }} />
                {errorMessage && (
                    <Alert className='mt-3' variant="danger" onClose={() => setErrorMessage('')} dismissible>
                        {errorMessage}
                    </Alert>
                )}
            </FormProvider>
        </Container>
    }

    return (
        <Modal size='lg' show={show} onHide={onClose} onClick={(e: any) => e.stopPropagation()} onDoubleClick={(e: any) => e.stopPropagation()}>
            <ErrorBoundary>
                <Form onSubmit={formMethods.handleSubmit(handleSubmitRepository)}>
                    <Modal.Header closeButton={true}>
                        <Modal.Title>{title}</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        {renderFormBody()}
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={onClose}>
                            Anuluj
                        </Button>
                        <Button type="submit" variant="primary" disabled={!formMethods.formState.isValid || requestPending || isLoadingData}>
                            Zatwierdź {' '}
                            {requestPending && <Spinner
                                as="span"
                                animation="border"
                                size="sm"
                                role="status"
                                aria-hidden="true"
                            />}
                        </Button>
                    </Modal.Footer>
                </Form>
            </ErrorBoundary>
        </Modal >
    );
}

function ModalFooter() {

}