import React, { useRef, useState } from 'react';
import { Modal, Button, ButtonProps, Form, FormControlProps, Alert, Row, Spinner } from 'react-bootstrap';
import { ButtonVariant } from 'react-bootstrap/esm/types';
import { useForm, FieldValues } from 'react-hook-form';
import RepositoryReact, { RepositoryDataItem } from '../React/RepositoryReact';
import Tools from '../React/Tools';
import { FormProvider } from './FormContext';
import { ConfirmModal } from './Resultsets/CommonComponents';
import { parseFieldValuestoFormData } from './Resultsets/CommonComponentsController';


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
    modalBodyProps
}: GeneralModalProps) {
    const [errorMessage, setErrorMessage] = useState('');
    const [validationArray, setValidationArray] = useState<{ name: string; isValid: boolean }[]>([]);
    const [isValidated, setIsValidated] = useState(false);
    const [requestPending, setRequestPending] = useState(false);

    const {
        register,
        setValue,
        watch,
        handleSubmit,
        control,
        formState: { errors, isValid },
    } = useForm({ defaultValues: {}, mode: 'onChange' });

    //const [isSubmitEnabled, setIsSubmitEnabled] = useState(false);
    const additionalFieldsKeysValues = useRef<additionalFieldsKeysValue[]>([]);
    let newObject: RepositoryDataItem;

    function handleValidationChange(fieldName: string, isValid: boolean) {
        // Aktualizuj tablicę walidacji
        setValidationArray((prevState) => {
            const newArray = [...prevState];
            const existingIndex = newArray.findIndex((item) => item.name === fieldName);

            if (existingIndex !== -1) {
                newArray[existingIndex].isValid = isValid;
            } else {
                newArray.push({ name: fieldName, isValid });
            }
            console.log('handleValidationChange newArray', newArray);
            return newArray;
        });

        // Sprawdź, czy wszystkie pola są prawidłowe, i ustaw stan `isSubmitEnabled`
        const isAllValid = validationArray.every((item) => item.isValid);
        console.log('handleValidationChange isAllValid', isAllValid);
        setIsValidated(isAllValid);
    }

    async function handleSubmitRepository(data: FieldValues) {
        try {
            setErrorMessage('');
            setRequestPending(true);
            const formData = parseFieldValuestoFormData(data);
            if (additionalFieldsKeysValues)
                for (const keyValue of additionalFieldsKeysValues.current)
                    formData.append(keyValue.name, keyValue.value);

            (isEditing) ? await handleEdit(formData) : await handleAdd(formData);
            onClose();
            setRequestPending(false);
        } catch (error) {
            if (error instanceof Error)
                setErrorMessage(error.message);
            setRequestPending(false);
        }
    };

    function handleAdditionalFieldsKeysValues(values: additionalFieldsKeysValue[]) {
        const newAdditionalFieldsKeysValues = [...additionalFieldsKeysValues.current];

        values.forEach((newValue) => {
            // Sprawdź, czy istnieje element o takim samym atrybucie 'name' w tablicy
            const existingIndex = newAdditionalFieldsKeysValues.findIndex(
                (item) => item.name === newValue.name
            );

            // Jeśli element istnieje, zaktualizuj wartość; w przeciwnym razie dodaj nowy element
            if (existingIndex !== -1) {
                newAdditionalFieldsKeysValues[existingIndex].value = newValue.value;
            } else {
                newAdditionalFieldsKeysValues.push(newValue);
            }
        });

        additionalFieldsKeysValues.current = newAdditionalFieldsKeysValues;
    }

    async function handleEdit(formData: FormData) {
        const currentDataItem = { ...repository.currentItems[0] }
        const editedObject = Tools.updateObject(formData, currentDataItem);

        await repository.editItemNodeJS(editedObject);
        if (onEdit) onEdit(editedObject);
    };

    async function handleAdd(formData: FormData) {
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
                    <FormProvider value={{ register, setValue, watch, handleSubmit, control, formState: { errors, isValid } }}>
                        <ModalBodyComponent
                            {...modalBodyProps}
                            onAdditionalFieldsKeysValuesChange={handleAdditionalFieldsKeysValues}
                            onValidationChange={handleValidationChange}
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
    modalProps: { onEdit, ModalBodyComponent, additionalModalBodyProps, modalTitle, initialData, repository },
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
        repository },
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
 * @param onAdditionalFieldsKeysValuesChange - funkcja wywoływana po zmianie wartości dodatkowych pól
 * @param additionalProps - dodatkowe właściwości przekazywane do body - np. inne komponenty - patrz OurContractAddNewModalButton
 */
export type ModalBodyProps = {
    isEditing: boolean;
    initialData?: RepositoryDataItem;
    onAdditionalFieldsKeysValuesChange?: (additionalFieldsKeysValues: additionalFieldsKeysValue[]) => void;
    additionalProps?: any;
    onValidationChange?: (fieldName: string, isValid: boolean) => void;
}

type GeneralModalButtonModalProps = {
    ModalBodyComponent: React.ComponentType<ModalBodyProps>;
    additionalModalBodyProps?: any;
    modalTitle: string;
    repository: RepositoryReact;
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

