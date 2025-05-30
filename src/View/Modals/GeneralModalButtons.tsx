import React, { useState } from "react";
import { Button } from "react-bootstrap";
import { RepositoryDataItem } from "../../../Typings/bussinesTypes";
import ConfirmModal from "./ConfirmModal";
import { GeneralModal } from "./GeneralModal";
import {
    GeneralAddNewModalButtonProps,
    GeneralCopyModalButtonProps,
    GeneralDeleteModalButtonProps,
    GeneralEditModalButtonProps,
    GeneralModalButtonButtonProps,
} from "./ModalsTypes";
import { DeleteIconButton, EditIconButton, CopyIconButton } from "../Resultsets/CommonComponents";

/**
 *
 * @param modalProps - właściwości modalu
 * - onEdit - funkcja z obiektu nadrzędnego wywoływana po edycji elementu
 * - specialActionRoute - ścieżka do specjalnej akcji (np. wysłania maila)
 * - ModalBodyComponent - komponent wyświetlany w modalu
 * - additionalModalBodyProps - dodatkowe właściwości przekazywane do komponentu wyświetlanego w modalu
 * - modalTitle - tytuł modalu
 * - initialData - dane początkowe
 * - repository - repozytorium
 * - makeValidationSchema - funkcja tworząca schemat walidacji
 * - fieldsToUpdate - pola do aktualizacji
 * - shouldRetrieveDataBeforeEdit - czy powinno być pobrane dane przed edycją
 * @param buttonProps - właściwości przycisku
 */
export function GeneralEditModalButton<DataItemType extends RepositoryDataItem = RepositoryDataItem>({
    buttonProps,
    modalProps: {
        onEdit,
        specialActionRoute,
        specialRetrieveActionRoute,
        ModalBodyComponent,
        additionalModalBodyProps,
        modalTitle,
        modalSubtitle,
        initialData,
        repository,
        makeValidationSchema,
        fieldsToUpdate,
        shouldRetrieveDataBeforeEdit,
        contextData,
        size,
    },
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
            <GeneraEditButton {...buttonProps} onClick={handleOpen} />
            <GeneralModal<DataItemType>
                onClose={handleClose}
                show={showForm}
                isEditing={true}
                title={modalTitle}
                subtitle={modalSubtitle}
                repository={repository}
                onEdit={onEdit}
                specialActionRoute={specialActionRoute}
                specialRetrieveActionRoute={specialRetrieveActionRoute}
                ModalBodyComponent={ModalBodyComponent}
                makeValidationSchema={makeValidationSchema}
                modalBodyProps={{
                    isEditing: true,
                    initialData: initialData,
                    additionalProps: additionalModalBodyProps,
                    contextData: contextData,
                }}
                fieldsToUpdate={fieldsToUpdate}
                shouldRetrieveDataBeforeEdit={shouldRetrieveDataBeforeEdit}
                size={size}
            />
        </>
    );
}

/**wyświelta ikonę albo przycisk */
function GeneraEditButton(buttonProps: GeneralModalButtonButtonProps & { onClick: () => void }) {
    const {
        buttonCaption,
        buttonIsActive,
        buttonIsDisabled,
        buttonSize = "sm",
        buttonVariant = "outline-success",
        onClick,
        layout = "vertical",
    } = {
        ...buttonProps,
    };
    if (!buttonCaption) {
        return <EditIconButton layout={layout} onClick={onClick} />;
    } else
        return (
            <Button
                key={buttonCaption}
                variant={buttonVariant}
                size={buttonSize}
                active={buttonIsActive}
                disabled={buttonIsDisabled}
                onClick={onClick}
            >
                {buttonCaption}
            </Button>
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
        contextData,
        ModalBodyComponent,
        additionalModalBodyProps,
        modalTitle,
        modalSubtitle,
        repository,
        makeValidationSchema: validationSchema,
        size,
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
                subtitle={modalSubtitle}
                repository={repository}
                onAddNew={onAddNew}
                ModalBodyComponent={ModalBodyComponent}
                makeValidationSchema={validationSchema}
                modalBodyProps={{
                    isEditing: false,
                    contextData: contextData,
                    additionalProps: additionalModalBodyProps,
                }}
                size={size}
            />
        </>
    );
}

/** Wyświetla ikonę kosza podłaczoną do Modala - nie przyjmuje ButtonProps */
export function GeneralDeleteModalButton<DataItemType extends RepositoryDataItem>({
    modalProps: { onDelete, modalTitle, modalSubtitle, initialData, repository },
    buttonProps,
}: GeneralDeleteModalButtonProps<DataItemType>) {
    const [showForm, setShowForm] = useState(false);
    const { layout = "vertical" } = { ...buttonProps };
    const className = layout === "vertical" ? "icon icon-vertical" : "icon icon-horizontal";
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
                subtitle={modalSubtitle}
                onConfirm={handleDelete}
                prompt={`Czy na pewno chcesz usunąć ${"name" in initialData ? initialData?.name : "obiekt"}?`}
            />
        </>
    );
}

/** Wyświetla ikonę kopiowania podłączoną do Modala - nie przyjmuje ButtonProps */
export function GeneralCopyModalButton<DataItemType extends RepositoryDataItem>({
    modalProps: { onCopy, modalTitle, modalSubtitle, initialData, repository },
    buttonProps,
}: GeneralCopyModalButtonProps<DataItemType>) {
    const [showForm, setShowForm] = useState(false);
    const { layout = "vertical" } = { ...buttonProps };

    function handleOpen() {
        setShowForm(true);
    }
    function handleClose() {
        setShowForm(false);
    }
    async function handleCopy() {
        const copiedData = await repository.copyItem(initialData);
        onCopy(copiedData);
        handleClose();
    }

    const itemName = "name" in initialData ? initialData?.name : "obiekt";
    const defaultTitle = modalTitle || "Kopiowanie";
    const defaultPrompt = `Czy na pewno chcesz skopiować ${itemName}?`;

    return (
        <>
            <CopyIconButton layout={layout} onClick={handleOpen} />

            <ConfirmModal
                onClose={handleClose}
                show={showForm}
                title={defaultTitle}
                subtitle={modalSubtitle}
                onConfirm={handleCopy}
                prompt={defaultPrompt}
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
        modalSubtitle,
        initialData,
        repository,
        makeValidationSchema,
        fieldsToUpdate,
        contextData,
        size,
    },
    children,
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
            <span onClick={handleOpen} style={{ cursor: "pointer" }}>
                {children}
            </span>
            <GeneralModal<DataItemType>
                onClose={handleClose}
                show={showForm}
                isEditing={true}
                title={modalTitle}
                subtitle={modalSubtitle}
                repository={repository}
                onEdit={onEdit}
                specialActionRoute={specialActionRoute}
                ModalBodyComponent={ModalBodyComponent}
                makeValidationSchema={makeValidationSchema}
                modalBodyProps={{
                    isEditing: true,
                    initialData: initialData,
                    additionalProps: additionalModalBodyProps,
                    contextData: contextData,
                }}
                fieldsToUpdate={fieldsToUpdate}
                size={size}
            />
        </>
    );
}
