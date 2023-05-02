import React, { useEffect, useRef, useState } from 'react';
import { Modal, Button, ButtonProps, Form, FormControlProps, Alert, Row, Spinner } from 'react-bootstrap';
import { ButtonVariant } from 'react-bootstrap/esm/types';
import { useForm, FieldValues } from 'react-hook-form';
import RepositoryReact, { RepositoryDataItem } from '../React/RepositoryReact';
import Tools from '../React/Tools';
import { FormProvider } from './FormContext';
import { ConfirmModal } from './Resultsets/CommonComponents';
import { parseFieldValuestoFormData } from './Resultsets/CommonComponentsController';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';

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
        const editedObject = data instanceof FormData ? Tools.updateObject(data, currentDataItem) : data as RepositoryDataItem;

        await repository.editItemNodeJS(editedObject);
        if (onEdit) onEdit(editedObject);
    };

    async function handleAdd(formData: FormData | FieldValues) {
        newObject = await repository.addNewItemNodeJS(formData);
        if (onAddNew) onAddNew(newObject);
    };

    return (
        <Modal show={show} onHide={onClose} onClick={(e: any) => e.stopPropagation()} onDoubleClick={(e: any) => e.stopPropagation()}>
            <Form onSubmit={handleSubmit(handleSubmitRepository)}>
                <Modal.Header closeButton={true}>
                    <Modal.Title>{title}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <FormProvider value={{ register, setValue, watch, handleSubmit, control, formState: { errors, isValid }, trigger }}>
                        <ModalBodyComponent
                            {...modalBodyProps}
                        />
                        <Row>
                            {errorMessage && (
                                <Alert variant="danger" onClose={() => setErrorMessage('')} dismissible>
                                    {errorMessage}
                                </Alert>
                            )}
                        </Row>
                    </FormProvider>
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

export function GeneralEditModalButton({
    modalProps: {
        onEdit,
        ModalBodyComponent,
        additionalModalBodyProps,
        modalTitle,
        initialData,
        repository,
        validationSchema,
    },
    buttonProps = {},
}: GeneralEditModalButtonProps) {
    const { buttonCaption = "Edytuj", buttonVariant = "outline-primary" } = buttonProps;
    const [showForm, setShowForm] = useState(false);

    function handleOpen() {
        setShowForm(true);
    }
    function handleClose() {
        setShowForm(false);
    }

    return (
        <>
            <Button variant={buttonVariant} onClick={handleOpen}>
                {buttonCaption}
            </Button>

            <GeneralModal
                onClose={handleClose}
                show={showForm}
                isEditing={true}
                title={modalTitle}
                repository={repository}
                onEdit={onEdit}
                ModalBodyComponent={ModalBodyComponent}
                validationSchema={validationSchema}
                modalBodyProps={{
                    isEditing: true,
                    initialData: initialData,
                    additionalProps: additionalModalBodyProps,
                }}
            />
        </>
    );
}

/** Wyświetla przycisk i przypięty do niego modal
 * @param modalProps - właściwości modalu
 * - onAddNew - funkcja z obiektu nadrzędnego wywoływana po dodaniu nowego elementu
 * - ModalBodyComponent - komponent wyświetlany w modalu 
 * - właściwości modalu
 * @param buttonProps - właściwości przycisku
 * 
 */
export function GeneralAddNewModalButton({
    modalProps: {
        onAddNew, // funkcja z obiektu nadrzędnego wywoływana po dodaniu nowego elementu
        ModalBodyComponent,
        additionalModalBodyProps,
        modalTitle,
        repository,
        validationSchema,
    },
    buttonProps: {
        buttonCaption,
        buttonVariant = "outline-primary",
        buttonSize = "sm",
        buttonIsActive = false,
        buttonIsDisabled = false,
    },
}: GeneralAddNewModalButtonProps) {
    const [showForm, setShowForm] = useState(false);

    function handleOpen() {
        setShowForm(true);
    }
    function handleClose() {
        setShowForm(false);
    }

    return (
        <>
            <Button
                key={buttonCaption}
                variant={buttonVariant}
                size={buttonSize}
                active={buttonIsActive}
                disabled={buttonIsDisabled}
                onClick={handleOpen}
            >
                {buttonCaption}
            </Button>
            <GeneralModal
                onClose={handleClose}
                show={showForm}
                isEditing={false}
                title={modalTitle}
                repository={repository}
                onAddNew={onAddNew}
                ModalBodyComponent={ModalBodyComponent}
                validationSchema={validationSchema}
                modalBodyProps={{
                    isEditing: false,
                    additionalProps: additionalModalBodyProps,
                }}
            />
        </>
    );
}

export function GeneralDeleteModalButton({
    modalProps: { onDelete, modalTitle, initialData, repository },
    buttonProps = {},
}: GeneralDeleteModalButtonProps) {
    const { buttonCaption = "Usuń", buttonVariant = "outline-danger" } = buttonProps;

    const [showForm, setShowForm] = useState(false);

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

    return (
        <>
            <Button variant={buttonVariant} onClick={handleOpen}>
                {buttonCaption}
            </Button>

            <ConfirmModal
                onClose={handleClose}
                show={showForm}
                title={modalTitle}
                onConfirm={handleDelete}
                prompt={`Czy na pewno chcesz usunąć ${initialData.name}?`}
            />
        </>
    );
}

/**
 * parametry body modalu z formularzem
 * @param isEditing - czy modal jest w trybie edycji trzeba przekazać do do body bo część pól jest różna w trybie edycji i dodawania
 * @param initialData - dane inicjalne do wyświetlenia w formularzu
 * @param additionalProps - dodatkowe właściwości przekazywane do body - np. inne komponenty - patrz OurContractAddNewModalButton
 */
export type ModalBodyProps = {
    isEditing: boolean;
    initialData?: RepositoryDataItem;
    additionalProps?: any;
}

type GeneralModalButtonModalProps = {
    ModalBodyComponent: React.ComponentType<ModalBodyProps>;
    additionalModalBodyProps?: any;
    modalTitle: string;
    repository: RepositoryReact;
    validationSchema?: yup.ObjectSchema<any>;
};

type GeneralModalButtonButtonProps = {
    buttonVariant?: ButtonVariant;
    buttonSize?: ButtonProps["size"];
    buttonIsActive?: boolean;
    buttonIsDisabled?: boolean;
};

export type GeneralModalButtonProps = {
    modalProps: GeneralModalButtonModalProps;
    buttonProps: GeneralModalButtonButtonProps;
};

type GeneralAddNewModalButtonModalProps = GeneralModalButtonModalProps & {
    onAddNew: (object: RepositoryDataItem) => void;
};

type GeneralAddNewModalButtonButtonProps = GeneralModalButtonButtonProps & {
    buttonCaption: string;
};

export type GeneralAddNewModalButtonProps = {
    modalProps: GeneralAddNewModalButtonModalProps;
    buttonProps: GeneralAddNewModalButtonButtonProps;
};

type GeneralEditModalButtonModalProps = GeneralModalButtonModalProps & {
    onEdit: (object: RepositoryDataItem) => void;
    initialData: RepositoryDataItem;
};

type GeneralEditModalButtonButtonProps = GeneralModalButtonButtonProps & {
    buttonCaption?: string;
};

export type GeneralEditModalButtonProps = {
    modalProps: GeneralEditModalButtonModalProps;
    buttonProps?: GeneralEditModalButtonButtonProps;
};

type GeneralDeleteModalButtonModalProps = Omit<
    GeneralModalButtonModalProps,
    "ModalBodyComponent"
> & {
    onDelete: (objectId: number) => void;
    initialData: RepositoryDataItem;
};

type GeneralDeleteModalButtonButtonProps = GeneralModalButtonButtonProps & {
    buttonCaption?: string;
};

export type GeneralDeleteModalButtonProps = {
    modalProps: GeneralDeleteModalButtonModalProps;
    buttonProps?: GeneralDeleteModalButtonButtonProps;
};

type SpecificAddNewModalButtonModalProps = Omit<
    GeneralAddNewModalButtonModalProps,
    "ModalBodyComponent" | "modalTitle" | "repository"
> & {
    onAddNew: (object: RepositoryDataItem) => void;
};

type SpecificAddNewModalButtonButtonProps = GeneralAddNewModalButtonButtonProps;

export type SpecificAddNewModalButtonProps = {
    modalProps: SpecificAddNewModalButtonModalProps;
    buttonProps?: SpecificAddNewModalButtonButtonProps;
};

type SpecificEditModalButtonModalProps = Omit<
    GeneralEditModalButtonModalProps,
    "ModalBodyComponent" | "modalTitle" | "repository"
> & {
    onEdit: (object: RepositoryDataItem) => void;
    initialData: RepositoryDataItem;
};

type SpecificEditModalButtonButtonProps = GeneralEditModalButtonButtonProps;

export type SpecificEditModalButtonProps = {
    modalProps: SpecificEditModalButtonModalProps;
    buttonProps?: SpecificEditModalButtonButtonProps;
};

type SpecificDeleteModalButtonModalProps = Omit<
    GeneralDeleteModalButtonModalProps,
    "ModalBodyComponent" | "modalTitle" | "repository"
> & {
    onDelete: (objectId: number) => void;
    initialData: RepositoryDataItem;
};

type SpecificDeleteModalButtonButtonProps = GeneralDeleteModalButtonButtonProps;

export type SpecificDeleteModalButtonProps = {
    modalProps: SpecificDeleteModalButtonModalProps;
    buttonProps?: SpecificDeleteModalButtonButtonProps;
};


export type additionalFieldsKeysValue = {
    name: string;
    value: string;
};

