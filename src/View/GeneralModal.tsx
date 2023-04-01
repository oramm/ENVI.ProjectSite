import React, { useRef, useState } from 'react';
import { Modal, Button, Form, FormControlProps } from 'react-bootstrap';
import RepositoryReact, { RepositoryDataItem } from '../React/RepositoryReact';
import Tools from '../React/Tools';


type GeneralModalProps = {
    show: boolean;
    title: string;
    isEditing: boolean;
    onEdit?: (object: RepositoryDataItem) => void;
    onClose: () => void;
    onIsReadyChange: (isReady: boolean) => void;
    repository: RepositoryReact;
    ModalBodyComponent: React.ComponentType<ModalBodyProps>;
    modalBodyProps: ModalBodyProps;
};

export function GeneralModal({
    show,
    title,
    isEditing,
    onEdit,
    onClose,
    onIsReadyChange,
    repository,
    ModalBodyComponent,
    modalBodyProps
}: GeneralModalProps) {

    let additionalFieldsKeysValues: additionalFieldsKeysValue[] = [];


    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        onIsReadyChange(false);
        e.stopPropagation();
        const formData = new FormData(e.target as HTMLFormElement);
        if (additionalFieldsKeysValues)
            for (const keyValue of additionalFieldsKeysValues)
                formData.append(keyValue.name, keyValue.value);

        (isEditing) ? await handleEdit(formData) : await handleAdd(formData);

        onClose();
        onIsReadyChange(true);
    };
    function handleAdditionalFieldsKeysValues(values: additionalFieldsKeysValue[]) {
        additionalFieldsKeysValues = values;
        //if (modalBodyProps.onAdditionalFieldsKeysValuesChange)
        //    modalBodyProps.onAdditionalFieldsKeysValuesChange(values);
    }

    async function handleEdit(formData: FormData) {
        const currentContract = { ...repository.currentItems[0] }
        const editedObject = Tools.updateObject(formData, currentContract);

        await repository.editItemNodeJS(editedObject);
        if (onEdit) onEdit(editedObject);
    };

    async function handleAdd(formData: FormData) {


    };

    return (
        <Modal show={show} onHide={onClose} onClick={(e: any) => e.stopPropagation()} onDoubleClick={(e: any) => e.stopPropagation()}>
            <Form onSubmit={handleSubmit}>
                <Modal.Header closeButton={true}>
                    <Modal.Title>{title}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <ModalBodyComponent
                        {...modalBodyProps}
                        onAdditionalFieldsKeysValuesChange={handleAdditionalFieldsKeysValues}
                    />
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={onClose}>
                        Anuluj
                    </Button>
                    <Button type="submit" variant="primary">
                        Zatwierdź
                    </Button>
                </Modal.Footer>
            </Form>
        </Modal>
    );
}

export function EditModalButton({
    onEdit,
    onIsReadyChange,
    ModalBodyComponent,
    title,
    initialData,
    repository,
}: EditModalButtonProps) {
    const [showForm, setShowForm] = useState(false);
    const handleOpen = () => setShowForm(true);
    const handleClose = () => setShowForm(false);

    return (
        <>
            <Button
                variant="primary"
                onClick={handleOpen}>Edytuj</Button>

            <GeneralModal
                onClose={handleClose}
                show={showForm}
                isEditing={true}
                title={title}
                repository={repository}
                onIsReadyChange={onIsReadyChange}
                onEdit={onEdit}
                ModalBodyComponent={ModalBodyComponent}
                modalBodyProps={{
                    isEditing: true,
                    initialData: initialData,
                }}
            />
        </>
    );
}

export type ModalBodyProps = {
    isEditing: boolean;
    initialData?: RepositoryDataItem;
    onAdditionalFieldsKeysValuesChange?: (additionalFieldsKeysValues: additionalFieldsKeysValue[]) => void;
};

export type AddNewModalButtonProps = ModalButtonProps & {
    onAddNew: (object: RepositoryDataItem) => void;
};

export type EditModalButtonProps = ModalButtonProps & {
    onEdit: (object: RepositoryDataItem) => void;
    initialData: RepositoryDataItem;
};


export type ModalButtonProps = {
    onIsReadyChange: (isReady: boolean) => void;
    ModalBodyComponent: React.ComponentType<ModalBodyProps>;
    title: string;
    repository: RepositoryReact;

};

export type additionalFieldsKeysValue = {
    name: string;
    value: string;
};

