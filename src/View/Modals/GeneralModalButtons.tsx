
import React, { useState } from "react";
import { Button } from "react-bootstrap";
import { RepositoryDataItem } from "../../../Typings/bussinesTypes";
import ConfirmModal from "./ConfirmModal";
import { GeneralModal } from "./GeneralModal";
import { GeneralAddNewModalButtonProps, GeneralDeleteModalButtonProps, GeneralEditModalButtonProps } from "./ModalsTypes";

export function GeneralEditModalButton<DataItemTpe extends RepositoryDataItem = RepositoryDataItem>({
    modalProps: {
        onEdit,
        ModalBodyComponent,
        additionalModalBodyProps,
        modalTitle,
        initialData,
        repository,
        makeValidationSchema,
    },
    buttonProps = {},
}: GeneralEditModalButtonProps<DataItemTpe>) {
    const { buttonCaption, buttonVariant = "light" } = buttonProps;
    const [showForm, setShowForm] = useState(false);

    function handleOpen() {
        setShowForm(true);
    }
    function handleClose() {
        setShowForm(false);
    }

    return (
        <>
            <a href='#' onClick={handleOpen} className='icon-vertical text-general'>
                <i className="fa fa-pencil fa-lg"></i>
            </a>

            <GeneralModal<DataItemTpe>
                onClose={handleClose}
                show={showForm}
                isEditing={true}
                title={modalTitle}
                repository={repository}
                onEdit={onEdit}
                ModalBodyComponent={ModalBodyComponent}
                makeValidationSchema={makeValidationSchema}
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
export function GeneralAddNewModalButton<DataItemType extends RepositoryDataItem>({
    modalProps: {
        onAddNew, // funkcja z obiektu nadrzędnego wywoływana po dodaniu nowego elementu
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
                    additionalProps: additionalModalBodyProps,
                }}
            />
        </>
    );
}

/** Wyświetla ikonę kosza podłaczoną do Modala - nie przyjmuje ButtonProps */
export function GeneralDeleteModalButton<DataItemType extends RepositoryDataItem>({
    modalProps: { onDelete, modalTitle, initialData, repository },
}: GeneralDeleteModalButtonProps<DataItemType>) {
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
            <a href='#' onClick={handleOpen} className='icon-vertical text-danger'>
                <i className="fa fa-trash fa-lg"></i>
            </a>

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