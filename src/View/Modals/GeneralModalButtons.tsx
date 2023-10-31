
import React, { useState } from "react";
import { Button } from "react-bootstrap";
import { RepositoryDataItem } from "../../../Typings/bussinesTypes";
import ConfirmModal from "./ConfirmModal";
import { GeneralModal } from "./GeneralModal";
import { GeneralAddNewModalButtonProps, GeneralDeleteModalButtonProps, GeneralEditModalButtonButtonProps, GeneralEditModalButtonProps, GeneralModalButtonButtonProps, GeneralModalButtonProps } from "./ModalsTypes";
import { DeleteIconButton, EditIconButton } from "../Resultsets/CommonComponents";

export function GeneralEditModalButton<DataItemType extends RepositoryDataItem = RepositoryDataItem>({
    buttonProps,
    modalProps: {
        onEdit,
        specialActionRoute,
        ModalBodyComponent,
        additionalModalBodyProps,
        modalTitle,
        initialData,
        repository,
        makeValidationSchema,
        fieldsToUpdate,
        shouldRetrieveDataBeforeEdit,
    }
}: GeneralEditModalButtonProps<DataItemType>) {
    const [showForm, setShowForm] = useState(false);

    async function handleOpen() {
        setShowForm(true);
    }
    function handleClose() {
        setShowForm(false);
    }

    return (
        <>
            <GeneraEditButton
                {...buttonProps}
                onClick={handleOpen}
            />
            <GeneralModal<DataItemType>
                onClose={handleClose}
                show={showForm}
                isEditing={true}
                title={modalTitle}
                repository={repository}
                onEdit={onEdit}
                specialActionRoute={specialActionRoute}
                ModalBodyComponent={ModalBodyComponent}
                makeValidationSchema={makeValidationSchema}
                modalBodyProps={{
                    isEditing: true,
                    initialData: initialData,
                    additionalProps: additionalModalBodyProps,
                }}
                fieldsToUpdate={fieldsToUpdate}
                shouldRetrieveDataBeforeEdit={shouldRetrieveDataBeforeEdit}
            />
        </>
    );
}

/**wyświelta ikonę albo przycisk */
function GeneraEditButton(buttonProps: GeneralModalButtonButtonProps & { onClick: () => void },
) {
    const {
        buttonCaption,
        buttonIsActive,
        buttonIsDisabled,
        buttonSize = 'sm',
        buttonVariant = 'outline-success',
        onClick,
        layout = 'vertical'
    } = {
        ...buttonProps
    }
    if (!buttonCaption) {
        return <EditIconButton layout={layout} onClick={onClick} />
    }
    else
        return (<Button
            key={buttonCaption}
            variant={buttonVariant}
            size={buttonSize}
            active={buttonIsActive}
            disabled={buttonIsDisabled}
            onClick={onClick}
        >
            {buttonCaption}
        </Button>)
}

/** Wyświetla przycisk i przypięty do niego modal
 * @param modalProps - właściwości modalu
 * - onAddNew - funkcja z obiektu nadrzędnego wywoływana po dodaniu nowego elementu
 * - ModalBodyComponent - komponent wyświetlany w modalu 
 * - właściwości modalu
 * @param buttonProps - właściwości przycisku
 * 
 */
export function GeneralAddNewModalButton<DataItemType extends RepositoryDataItem>({
    modalProps: {
        onAddNew, // funkcja z obiektu nadrzędnego wywoływana po dodaniu nowego elementu
        contextData,
        ModalBodyComponent,
        additionalModalBodyProps,
        modalTitle,
        repository,
        makeValidationSchema: validationSchema,
    },
    buttonProps: {
        buttonCaption,
        buttonVariant = "outline-primary",
        buttonSize = "sm",
        buttonIsActive = false,
        buttonIsDisabled = false,
    },
}: GeneralAddNewModalButtonProps<DataItemType>) {
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
            <GeneralModal<DataItemType>
                onClose={handleClose}

                show={showForm}
                isEditing={false}
                title={modalTitle}
                repository={repository}
                onAddNew={onAddNew}
                ModalBodyComponent={ModalBodyComponent}
                makeValidationSchema={validationSchema}
                modalBodyProps={{
                    isEditing: false,
                    contextData,
                    additionalProps: additionalModalBodyProps,
                }}
            />
        </>
    );
}

/** Wyświetla ikonę kosza podłaczoną do Modala - nie przyjmuje ButtonProps */
export function GeneralDeleteModalButton<DataItemType extends RepositoryDataItem>({
    modalProps: { onDelete, modalTitle, initialData, repository },
    buttonProps,
}: GeneralDeleteModalButtonProps<DataItemType>) {
    const [showForm, setShowForm] = useState(false);
    const { layout = 'vertical' } = { ...buttonProps };
    const className = layout === 'vertical' ? 'icon icon-vertical' : 'icon icon-horizontal';
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
            <DeleteIconButton layout={layout} onClick={handleOpen} />

            <ConfirmModal
                onClose={handleClose}
                show={showForm}
                title={modalTitle}
                onConfirm={handleDelete}
                prompt={`Czy na pewno chcesz usunąć ${initialData?.name}?`}
            />
        </>
    );
}

export function PartialEditTrigger<DataItemType extends RepositoryDataItem = RepositoryDataItem>({
    modalProps: {
        onEdit,
        specialActionRoute,
        ModalBodyComponent,
        additionalModalBodyProps,
        modalTitle,
        initialData,
        repository,
        makeValidationSchema,
        fieldsToUpdate,
    },
    children
}: GeneralEditModalButtonProps<DataItemType> & { children: JSX.Element }) {
    const [showForm, setShowForm] = useState(false);

    function handleOpen() {
        setShowForm(true);
    }
    function handleClose() {
        setShowForm(false);
    }

    return (
        <>
            <span onClick={handleOpen} style={{ cursor: 'pointer' }}>
                {children}
            </span>
            <GeneralModal<DataItemType>
                onClose={handleClose}
                show={showForm}
                isEditing={true}
                title={modalTitle}
                repository={repository}
                onEdit={onEdit}
                specialActionRoute={specialActionRoute}
                ModalBodyComponent={ModalBodyComponent}
                makeValidationSchema={makeValidationSchema}
                modalBodyProps={{
                    isEditing: true,
                    initialData: initialData,
                    additionalProps: additionalModalBodyProps,
                }}
                fieldsToUpdate={fieldsToUpdate}
            />
        </>
    );
}