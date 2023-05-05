import React, { useEffect, useRef, useState } from 'react';
import { Modal, Button, ButtonProps, Form, Alert, Spinner, Container } from 'react-bootstrap';
import { ButtonVariant } from 'react-bootstrap/esm/types';
import { useForm, FieldValues } from 'react-hook-form';
import RepositoryReact, { RepositoryDataItem } from '../../React/RepositoryReact';
import Tools from '../../React/Tools';
import { FormProvider } from './FormContext';
import ConfirmModal from './ConfirmModal';
import { parseFieldValuestoFormData } from '../Resultsets/CommonComponentsController';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import '../../Css/styles.css';
import { GeneralEditModalButtonProps, ModalBodyProps } from './ModalsTypes';

type GeneralModalProps = {
    show: boolean;
    title: string;
    isEditing: boolean;
    onEdit?: (object: RepositoryDataItem) => void;
    onAddNew?: (object: RepositoryDataItem) => void;
    onClose: () => void;
    repository: RepositoryReact;
    ModalBodyComponent: React.ComponentType<ModalBodyProps>;
    modalBodyProps: ModalBodyProps;
    validationSchema?: yup.ObjectSchema<any>;
};

export function GeneralModal({
    show,
    title,
    isEditing,
    onEdit,
    onAddNew,
    onClose,
    repository,
    ModalBodyComponent,
    modalBodyProps,
    validationSchema,
}: GeneralModalProps) {
    const [errorMessage, setErrorMessage] = useState('');
    const [requestPending, setRequestPending] = useState(false);

    const {
        register,
        setValue,
        watch,
        handleSubmit,
        control,
        formState: { errors, isValid },
        trigger,
    } = useForm({
        defaultValues: {},
        mode: 'onChange',
        resolver: validationSchema ? yupResolver(validationSchema) : undefined
    });

    let newObject: RepositoryDataItem;

    async function handleSubmitRepository(data: FieldValues) {
        try {
            setErrorMessage('');
            setRequestPending(true);

            // Sprawdź, czy obiekt data zawiera jakiekolwiek pliki
            const hasFiles = Object.values(data).some(value => value instanceof File);

            // Jeśli data zawiera pliki, przetwórz go na FormData, w przeciwnym razie użyj data bezpośrednio
            const requestData = hasFiles ? parseFieldValuestoFormData(data) : data;

            (isEditing) ? await handleEdit(requestData) : await handleAdd(requestData);
            onClose();
            setRequestPending(false);
        } catch (error) {
            if (error instanceof Error)
                setErrorMessage(error.message);
            setRequestPending(false);
        }
    };

    async function handleEdit(data: FormData | FieldValues) {
        const currentDataItem = { ...repository.currentItems[0] }
        const objectToEdit = data instanceof FormData ? Tools.updateObject(data, currentDataItem) : data as RepositoryDataItem;
        //uzupełnij atrybut id - bo nie jest przesyłany w formularzu
        objectToEdit.id = currentDataItem.id;
        const editedObject = await repository.editItemNodeJS(objectToEdit);
        if (onEdit) onEdit(editedObject);
    };

    async function handleAdd(formData: FormData | FieldValues) {
        newObject = await repository.addNewItemNodeJS(formData);
        if (onAddNew) onAddNew(newObject);
    };

    return (
        <Modal size='lg' show={show} onHide={onClose} onClick={(e: any) => e.stopPropagation()} onDoubleClick={(e: any) => e.stopPropagation()}>
            <Form onSubmit={handleSubmit(handleSubmitRepository)}>
                <Modal.Header closeButton={true}>
                    <Modal.Title>{title}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Container>
                        <FormProvider value={{ register, setValue, watch, handleSubmit, control, formState: { errors, isValid }, trigger }}>
                            <ModalBodyComponent {...modalBodyProps} />
                            {errorMessage && (
                                <Alert variant="danger" onClose={() => setErrorMessage('')} dismissible>
                                    {errorMessage}
                                </Alert>
                            )}
                        </FormProvider>
                    </Container>
                </Modal.Body>
                <Modal.Footer>
                    {requestPending && <Spinner animation="border" variant="primary" />}
                    <Button variant="secondary" onClick={onClose}>
                        Anuluj
                    </Button>
                    <Button type="submit" variant="primary" disabled={!isValid}>
                        Zatwierdź
                    </Button>
                </Modal.Footer>
            </Form>
        </Modal>
    );
}