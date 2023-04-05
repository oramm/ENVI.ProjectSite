import React, { useRef, useState } from 'react';
import { CommonFormFields as CommonContractFormFields } from './CommonContractFormFields';
import { GeneralDeleteModalButton, GeneralDeleteModalButtonProps, GeneralEditModalButtonProps, ModalBodyProps, SpecificAddNewModalButtonProps, SpecificDeleteModalButtonProps, SpecificEditModalButtonProps } from '../../View/GeneralModal';
import { ContractTypeSelectFormElement, MyAsyncTypeahead, ValueInPLNInput } from '../../View/Resultsets/CommonComponents';
import { Form } from 'react-bootstrap';
import ContractsController from './ContractsController';
import { OurContractEditModalButton, OurContractModalBody } from './OurContractModalBody';
import { OtherContractEditModalButton, OtherContractModalBody } from './OtherContractModalBody';
import { contractsRepository, projectsRepository } from './ContractsSearch';
import { RepositoryDataItem } from '../../React/RepositoryReact';
import MainSetup from '../../React/MainSetupReact';

export function ContractModalBody({ isEditing, initialData }: ModalBodyProps) {
    const [typeId, setTypeId] = useState<number>(initialData?.typeId || 0);
    const [name, setName] = useState(initialData?.name as string || '');
    const [alias, setAlias] = useState(initialData?.alias as string || '');
    const [comment, setComment] = useState(initialData?.comment as string || '');
    const [valueInPLN, setValueInPLN] = useState(initialData?.value as string || '');
    const [status, setStatus] = useState(initialData?.status as string || '');
    const [startDate, setStartDate] = useState(initialData?.startDate as string || new Date().toISOString().slice(0, 10));
    const [endDate, setEndDate] = useState(initialData?.endDate as string || new Date().toISOString().slice(0, 10));

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

type ProjectSelectorProps = ModalBodyProps & {
    SpecificContractModalBody?: React.ComponentType<ModalBodyProps>;
};
/** przełęcza widok pomiędzy wyborem projektu a formularzem kontraktu
 * SpecificContractModalBody - komponent formularza kontraktu (OurContractModalBody lub OtherContractModalBody)
 * @param additionalProps - dodatkowe propsy przekazywane do SpecificContractModalBody - ustawiane w Otjer lub OurContractModalBody
 * w tym przypadku jest additionalProps zawiera tylko parametr SpecificContractModalBody - komponent formularza kontraktu (OurContractModalBody lub OtherContractModalBody)
 * 
 */
export function ProjectSelectorModalBody({ isEditing, onAdditionalFieldsKeysValuesChange, additionalProps }: ProjectSelectorProps) {
    console.log('ProProjectSelectorModalBody props:: ', additionalProps);

    const [projects, setProjects] = useState([] as RepositoryDataItem[]);
    const [selected, setSelected] = useState(false);
    //musi być zgodna z nazwą w Our... lub OtherContractModalBody
    const { SpecificContractModalBody } = additionalProps;
    if (!SpecificContractModalBody) throw new Error("SpecificContractModalBody is not defined");

    const handleProjectSelection = (currentSelectedItems: RepositoryDataItem[]) => {
        setProjects(currentSelectedItems);
        setSelected(currentSelectedItems.length > 0);
    };

    return (
        <>
            {selected ? (
                <SpecificContractModalBody
                    isEditing={isEditing}
                    additionalProps={additionalProps}
                    onAdditionalFieldsKeysValuesChange={onAdditionalFieldsKeysValuesChange}
                    projectOurId={projects[0].ourId}
                />
            ) : (
                <Form.Group>
                    <Form.Label>Projekt</Form.Label>
                    <MyAsyncTypeahead
                        labelKey="ourId"
                        repository={projectsRepository}
                        selectedRepositoryItems={projects}
                        onChange={handleProjectSelection}
                        specialSerwerSearchActionRoute={'projects/' + MainSetup.currentUser.systemEmail}
                    />
                </Form.Group>
            )}
        </>
    );
};

/** przycisk i modal edycji OurCOntract lub OtherContract */
export function ContractEditModalButton({
    modalProps: { onEdit, onIsReadyChange, initialData },
    buttonProps,
    isOurContract,
}: SpecificEditModalButtonProps & { isOurContract: boolean }) {

    return (
        isOurContract
            ? <OurContractEditModalButton
                modalProps={{ onEdit, onIsReadyChange, initialData }}
                buttonProps={buttonProps}
            />
            : <OtherContractEditModalButton
                modalProps={{ onEdit, onIsReadyChange, initialData }}
                buttonProps={buttonProps}
            />
    );
}

export function ContractDeleteModalButton({
    modalProps: { onDelete } }: SpecificDeleteModalButtonProps) {
    const currentContract = contractsRepository.currentItems[0];
    const modalTitle = 'Usuwanie kontraktu ' + (currentContract?.ourId || currentContract?._number || '');

    return (
        <GeneralDeleteModalButton
            modalProps={{
                onDelete,
                modalTitle,
                repository: contractsRepository,
                initialData: contractsRepository.currentItems[0],
            }}
        />
    );
}