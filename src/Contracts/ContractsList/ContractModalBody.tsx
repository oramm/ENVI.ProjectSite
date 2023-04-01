import React, { useRef, useState } from 'react';
import { CommonFormFields as CommonContractFormFields } from './CommonContractFormFields';
import { EditModalButtonProps, ModalBodyProps } from '../../View/GeneralModal';
import { ContractTypeSelectFormElement, ValueInPLNInput } from '../../View/Resultsets/CommonComponents';
import { Form } from 'react-bootstrap';
import ContractsController from './ContractsController';
import { OurContractEditModalButton, OurContractModalBody } from './OurContractModalBody';
import { OtherContractEditModalButton, OtherContractModalBody } from './OtherContractModalBody';
import { contractsRepository } from './ContractsSearch';

export function ContractModalBody({ isEditing, initialData }: ModalBodyProps) {
    const [typeId, setTypeId] = useState<number>(initialData?.typeId || 0);
    const [name, setName] = useState(initialData?.name as string || '');
    const [alias, setAlias] = useState(initialData?.alias as string || '');
    const [comment, setComment] = useState(initialData?.comment as string || '');
    const [valueInPLN, setValueInPLN] = useState(initialData?.value as string || '');
    const [status, setStatus] = useState(initialData?.status as string || '');
    const [startDate, setStartDate] = useState(initialData?.startDate as string || new Date().toISOString().slice(0, 10));
    const [endDate, setEndDate] = useState(initialData?.endDate as string || new Date().toISOString().slice(0, 10));

    if (!isEditing && !initialData)
        initialData = {
            id: 0,
            _parent: contractsRepository.currentItems[0]._parent,
            startDate: new Date().toISOString().slice(0, 10),
            endDate: new Date().toISOString().slice(0, 10)
        };

    return (
        <>{
            (isEditing) ?
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
            <Form.Group controlId="valueInPLN">
                <Form.Label>Wartość netto w PLN</Form.Label>
                <ValueInPLNInput
                    onChange={setValueInPLN}
                    value={valueInPLN}
                />
            </Form.Group>
            <Form.Group controlId="startDate">
                <Form.Label>Początek</Form.Label>
                <Form.Control type="date" name="startDate" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
            </Form.Group>
            <Form.Group controlId="endDate">
                <Form.Label>Zakończenie</Form.Label>
                <Form.Control type="date" name="endDate" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
            </Form.Group>
            <Form.Group controlId="status">
                <Form.Label>Status</Form.Label>
                <Form.Control
                    as="select"
                    name="status"
                    onChange={(e) => setStatus(e.target.value)}
                    value={status}
                >
                    <option value="">-- Wybierz opcję --</option>
                    {ContractsController.statusNames.map((statusName, index) => (
                        <option key={index} value={statusName}>{statusName}</option>
                    ))}
                </Form.Control>
            </Form.Group >
        </>
    );
}

function ContractEditModalButton({
    contractType,
    onEdit,
    onIsReadyChange,
    initialData,
}: EditModalButtonProps & { contractType: string }) {
    const modalBodyComponent =
        contractType === "our"
            ? OurContractModalBody
            : OtherContractModalBody;

    const editModalButton =
        contractType === "our"
            ? <OurContractEditModalButton
                onEdit={onEdit}
                ModalBodyComponent={modalBodyComponent}
                onIsReadyChange={onIsReadyChange}
                initialData={initialData}
            />
            : <OtherContractEditModalButton
                onEdit={onEdit}
                ModalBodyComponent={modalBodyComponent}
                onIsReadyChange={onIsReadyChange}
                initialData={initialData}
            />;

    return editModalButton;
}
