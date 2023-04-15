import React, { useEffect, useRef, useState } from 'react';
import { GeneralDeleteModalButton, GeneralDeleteModalButtonProps, GeneralEditModalButtonProps, ModalBodyProps, SpecificAddNewModalButtonProps, SpecificDeleteModalButtonProps, SpecificEditModalButtonProps } from '../../View/GeneralModal';
import { ContractTypeSelectFormElement, MyAsyncTypeahead, ValueInPLNInput } from '../../View/Resultsets/CommonComponents';
import { Form } from 'react-bootstrap';
import ContractsController from './ContractsController';
import { OurContractEditModalButton, OurContractModalBody } from './OurContractModalBody';
import { OtherContractEditModalButton, OtherContractModalBody } from './OtherContractModalBody';
import { contractsRepository, projectsRepository } from './ContractsSearch';
import { RepositoryDataItem } from '../../React/RepositoryReact';
import MainSetup from '../../React/MainSetupReact';

export function ContractModalBody({ isEditing, initialData, onValidationChange }: ModalBodyProps) {
    const [name, setName] = useState(initialData?.name as string || '');
    const [alias, setAlias] = useState(initialData?.alias as string || '');
    const [comment, setComment] = useState(initialData?.comment as string || '');
    const [valueInPLN, setValueInPLN] = useState(initialData?.value as string || '');
    const [status, setStatus] = useState(initialData?.status as string || '');
    const [startDate, setStartDate] = useState(initialData?.startDate as string || new Date().toISOString().slice(0, 10));
    const [endDate, setEndDate] = useState(initialData?.endDate as string || new Date().toISOString().slice(0, 10));

    const [isNameValid, setIsNameValid] = useState(initialData?.name ? true : false);
    const [isAliasValid, setIsAliasValid] = useState(initialData?.alias ? true : false);
    const [isCommentValid, setIsCommentValid] = useState(initialData?.comment ? true : false);
    const [isValueInPLNValid, setIsValueInPLNValid] = useState(initialData?.value ? true : false);
    const [isStatusValid, setIsStatusValid] = useState(initialData?.status ? true : false);
    const [isStartDateValid, setIsStartDateValid] = useState(initialData?.startDate ? true : false);
    const [isEndDateValid, setIsEndDateValid] = useState(initialData?.endDate ? true : false);

    function handleNameChange(e: React.ChangeEvent<HTMLInputElement>) {
        const value = e.target.value;
        const validationFormula = value.length >= 3 && value.length <= 50;
        setName(value);
        setIsNameValid(validationFormula);
        if (onValidationChange)
            onValidationChange('name', validationFormula);
    };

    function handleAliasChange(e: React.ChangeEvent<HTMLInputElement>) {
        const value = e.target.value;
        const validationFormula = value.length <= 30;
        setAlias(value);
        setIsAliasValid(validationFormula);
        if (onValidationChange)
            onValidationChange('alias', validationFormula);
    };

    //dodaj hadnleCHange dla pozostałych pól:
    function handleCommentChange(e: React.ChangeEvent<HTMLInputElement>) {
        const value = e.target.value;
        const validationFormula = value.length <= 100;
        setComment(value);
        setIsCommentValid(validationFormula);
        if (onValidationChange)
            onValidationChange('comment', validationFormula);
    };

    function handleValueInPLNChange(value: string) {
        const validationFormula = value.length <= 100;
        setValueInPLN(value);
        setIsValueInPLNValid(validationFormula);
        if (onValidationChange)
            onValidationChange('value', validationFormula);
    };

    function handleStatusChange(e: React.ChangeEvent<HTMLInputElement>) {
        const value = e.target.value;
        const validationFormula = value.length > 0;
        setStatus(value);
        setIsStatusValid(validationFormula);
        if (onValidationChange)
            onValidationChange('status', validationFormula);
    };

    function handleStartDateChange(e: React.ChangeEvent<HTMLInputElement>) {
        const value = e.target.value;
        const endDate = new Date(value);
        const start = new Date(startDate);
        const validationFormula = value.length > 0 && endDate >= start;

        setStartDate(value);
        setIsStartDateValid(validationFormula);
        setIsEndDateValid(validationFormula);
        if (onValidationChange) {
            onValidationChange('startDate', validationFormula);
            onValidationChange('endDate', validationFormula);
        }

    };

    function handleEndDateChange(e: React.ChangeEvent<HTMLInputElement>) {
        const value = e.target.value;
        const endDate = new Date(value);
        const start = new Date(startDate);
        const validationFormula = value.length > 0 && endDate >= start;
        setEndDate(value);
        setIsEndDateValid(validationFormula);
        setIsStartDateValid(validationFormula);
        if (onValidationChange) {
            onValidationChange('endDate', validationFormula);
            onValidationChange('startDate', validationFormula);
        }
    }

    return (
        <>
            <Form.Group controlId="name">
                <Form.Label>Nazwa kontraktu</Form.Label>
                <Form.Control
                    type="text"
                    name="name"
                    placeholder="Podaj nazwę"
                    value={name}
                    onChange={handleNameChange}
                    isInvalid={!isNameValid}
                    isValid={isNameValid}
                />
                {!isNameValid && (
                    <Form.Text className="text-danger">
                        Nazwa musi zawierać od 3 do 50 znaków.
                    </Form.Text>
                )}
            </Form.Group>

            <Form.Group controlId="alias">
                <Form.Label>Alias</Form.Label>
                <Form.Control
                    type="text"
                    name='alias'
                    placeholder="Podaj alias"
                    value={alias}
                    onChange={handleAliasChange}
                    isInvalid={!isAliasValid}
                    isValid={isAliasValid}
                />
            </Form.Group>

            <Form.Group controlId="comment">
                <Form.Label>Opis</Form.Label>
                <Form.Control
                    as="textarea"
                    name="comment"
                    rows={3}
                    placeholder="Podaj opis"
                    value={comment}
                    onChange={handleCommentChange}
                    isInvalid={!isCommentValid}
                    isValid={isCommentValid}
                />
            </Form.Group>
            <Form.Group controlId="valueInPLN">
                <Form.Label>Wartość netto w PLN</Form.Label>
                <ValueInPLNInput
                    onChange={handleValueInPLNChange}
                    value={valueInPLN}
                />
            </Form.Group>
            <Form.Group controlId="startDate">
                <Form.Label>Początek</Form.Label>
                <Form.Control
                    type="date"
                    name="startDate"
                    value={startDate}
                    onChange={handleStartDateChange}
                    isInvalid={!isStartDateValid}
                    isValid={isStartDateValid}
                />
            </Form.Group>
            <Form.Group controlId="endDate">
                <Form.Label>Zakończenie</Form.Label>
                <Form.Control
                    type="date"
                    name="endDate"
                    value={endDate}
                    onChange={handleEndDateChange}
                    isInvalid={!isEndDateValid}
                    isValid={isEndDateValid}
                />
            </Form.Group>
            <Form.Group controlId="status">
                <Form.Label>Status</Form.Label>
                <Form.Control
                    as="select"
                    name="status"
                    onChange={handleStatusChange}
                    value={status}
                    isInvalid={!isStatusValid}
                    isValid={isStatusValid}
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
export function ProjectSelectorModalBody({ isEditing, onAdditionalFieldsKeysValuesChange, additionalProps, onValidationChange }: ProjectSelectorProps) {
    const [projects, setProjects] = useState([] as RepositoryDataItem[]);
    const [selected, setSelected] = useState(false);
    //musi być zgodna z nazwą w Our... lub OtherContractModalBody
    const { SpecificContractModalBody } = additionalProps;
    if (!SpecificContractModalBody) throw new Error("SpecificContractModalBody is not defined");


    useEffect(() => {
        if (projects.length > 0) {
            const additionalFieldsKeysValues = [
                { name: '_parent', value: JSON.stringify(projects[0]) }
            ];

            if (!onAdditionalFieldsKeysValuesChange) throw new Error('OtherContractModalBody:: onAdditionalFieldsKeysValuesChange is not defined');
            onAdditionalFieldsKeysValuesChange(additionalFieldsKeysValues);
        }
    }, [projects, selected]);


    const handleProjectSelection = (currentSelectedItems: RepositoryDataItem[]) => {
        //setProjects(prevProjects => currentSelectedItems);
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
                    onValidationChange={onValidationChange}
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
                        isRequired={true}
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