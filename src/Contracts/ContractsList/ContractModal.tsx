import React, { useRef, useState } from 'react';
import { Modal, Button, Form, FormControlProps } from 'react-bootstrap';
import MainController from '../../React/MainControllerReact';
import { RepositoryDataItem } from '../../React/RepositoryReact';
import MainSetup from '../../React/MainSetupReact';
import { ContractTypeSelectFormElement, PersonSelectFormElement, MyAsyncTypeahead, handleEditMyAsyncTypeaheadElement } from '../../View/Resultsets/CommonComponents';

import { contractsRepository, entitiesRepository } from './ContractsSearch'
import Tools from '../../React/Tools';

export function ContractModal({ show, isEditng, onClose: handleClose, initialData, onIsReadyChange, onAddNew, onEdit }: ContractModalProps) {
    const [typeId, setTypeId] = useState<number>(initialData?.typeId || 0);
    const [name, setName] = useState(initialData?.name as string || '');
    const [alias, setAlias] = useState(initialData?.alias as string || '');
    const [comment, setComment] = useState(initialData?.comment as string || '');
    const [status, setStatus] = useState(initialData?.status as string || 0);
    const [startDate, setStartDate] = useState(initialData?.startDate as string || new Date().toISOString().slice(0, 10));
    const [endDate, setEndDate] = useState(initialData?.endDate as string || new Date().toISOString().slice(0, 10));
    const [selectedContractors, setSelectedContractors] = useState<RepositoryDataItem[]>(initialData?._contractors || []);
    const [selectedAdmin, setSelectedAdmin] = useState<RepositoryDataItem>(initialData?._admin || undefined);
    const [selectedManager, setSelectedManager] = useState<RepositoryDataItem>(initialData?._manager || undefined);

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        onIsReadyChange(false);
        e.stopPropagation();
        const formData = new FormData(e.target as HTMLFormElement);
        formData.append("_contractors", JSON.stringify(selectedContractors));

        (isEditng) ? await handleEdit(formData) : await handleAdd(formData);

        handleClose();
        onIsReadyChange(true);
    };

    async function handleEdit(formData: FormData) {
        const currentContract = { ...contractsRepository.currentItems[0] }
        const editedObject = Tools.updateObject(formData, currentContract);

        await contractsRepository.editItemNodeJS(editedObject);
        if (onEdit) onEdit(editedObject);
    };

    async function handleAdd(formData: FormData) {


    };

    return (
        <Modal show={show} onHide={handleClose} onClick={(e: any) => e.stopPropagation()} onDoubleClick={(e: any) => e.stopPropagation()}>
            <Form onSubmit={handleSubmit}>
                <Modal.Header closeButton={true}>
                    <Modal.Title>{isEditng ? 'Edytuj kontrakt' : 'Dodaj nowy kontrakt'}</Modal.Title>
                </Modal.Header>
                <Modal.Body>

                    {(isEditng) ?
                        <ContractTypeSelectFormElement value={typeId} onChange={(e) => {
                            setTypeId(parseInt(e.target.value));
                            console.log(e.target.value);
                        }} />
                        : null
                    }
                    <Form.Group controlId="name">
                        <Form.Label>Nazwa kontraktu</Form.Label>
                        <Form.Control type="text" name="name" placeholder="Podaj nazwę" value={name} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value)} />
                    </Form.Group>

                    <Form.Group controlId="alias">
                        <Form.Label>Alias</Form.Label>
                        <Form.Control type="text" name='alias' placeholder="Podaj alias" value={alias} onChange={(e) => setAlias(e.target.value)} />
                    </Form.Group>

                    <Form.Group controlId="comment">
                        <Form.Label>Opis</Form.Label>
                        <Form.Control as="textarea" name="comment" rows={3} placeholder="Podaj opis" value={comment} onChange={(e) => setComment(e.target.value)} />
                    </Form.Group>
                    <Form.Group controlId="startDate">
                        <Form.Label>Początek</Form.Label>
                        <Form.Control type="date" name="startDate" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                    </Form.Group>
                    <Form.Group controlId="endDate">
                        <Form.Label>Zakończenie</Form.Label>
                        <Form.Control type="date" name="endDate" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
                    </Form.Group>
                    <Form.Group controlId="admin">
                        <PersonSelectFormElement
                            label='Administrator'

                            value={selectedAdmin}
                            onChange={(e: any) => {
                                console.log();
                                setSelectedAdmin(MainSetup.personsEnviRepository.items.filter((person) => e.id == person.id)[0]);
                            }}
                            repository={MainSetup.personsEnviRepository}
                        />
                    </Form.Group>
                    <Form.Group>
                        <Form.Label>Wykonawcy</Form.Label>
                        <MyAsyncTypeahead
                            labelKey='name'
                            repository={entitiesRepository}
                            onChange={(currentSelectedItems) => handleEditMyAsyncTypeaheadElement(currentSelectedItems, selectedContractors, setSelectedContractors)}
                            selectedRepositoryItems={selectedContractors}
                        />
                    </Form.Group>

                </Modal.Body>
                <Modal.Footer >
                    <Button variant="secondary" onClick={handleClose}>
                        Anuluj
                    </Button>
                    <Button type="submit" variant="primary">
                        {isEditng ? 'Edytuj' : 'Dodaj'}
                    </Button>
                </Modal.Footer>
            </Form>
        </Modal >
    );
}

export function AddNewContractButton({ onAddNew, onIsReadyChange }: AddNewContractButtonProps) {
    const [showForm, setShowForm] = useState(false);
    const handleOpen = () => setShowForm(true);
    const handleClose = () => setShowForm(false);

    return (
        <>
            <Button variant="primary" onClick={handleOpen}>Dodaj nowy</Button>
            <ContractModal
                isEditng={false}
                show={showForm}
                onClose={handleClose}
                onAddNew={onAddNew}
                onIsReadyChange={onIsReadyChange}
            />
        </>
    );
}

export function EditContractButton({ initialData, onEdit, onIsReadyChange }: EditContractButtonProps) {
    const [showForm, setShowForm] = useState(false);
    const handleOpen = () => setShowForm(true);
    const handleClose = () => setShowForm(false);

    return (
        <>
            <Button variant="primary" onClick={handleOpen}>Edytuj</Button>
            <ContractModal
                isEditng={true}
                show={showForm}
                onClose={handleClose}
                onIsReadyChange={onIsReadyChange}
                initialData={initialData}
                onEdit={onEdit}
            />
        </>
    );

}

type ContractModalProps = {
    show: boolean;
    isEditng: boolean;
    onClose: () => void;
    initialData?: RepositoryDataItem;
    onEdit?: (object: RepositoryDataItem) => void;
    onAddNew?: (object: RepositoryDataItem) => void;
    onIsReadyChange: (isReady: boolean) => void;
};

type AddNewContractButtonProps = ButtonProps & {
    onAddNew: (object: RepositoryDataItem) => void;
};

type EditContractButtonProps = ButtonProps & {
    onEdit: (object: RepositoryDataItem) => void;
    initialData: RepositoryDataItem;
};


type ButtonProps = {
    onIsReadyChange: (isReady: boolean) => void;
};
