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
import { useValidation } from '../../View/useValidation';
import { useFormContext } from '../../View/FormContext';

export function ContractModalBody({ isEditing, initialData, onValidationChange }: ModalBodyProps) {
    const { register, setValue, watch, formState } = useFormContext();


    const [startDate, setStartDate] = useState(initialData?.startDate as string || new Date().toISOString().slice(0, 10));
    const [endDate, setEndDate] = useState(initialData?.endDate as string || new Date().toISOString().slice(0, 10));

    const [isStartDateValid, setIsStartDateValid] = useState(initialData?.startDate ? true : false);
    const [isEndDateValid, setIsEndDateValid] = useState(initialData?.endDate ? true : false);


    useEffect(() => {
        setValue('name', initialData?.name || '', { shouldValidate: true });
        setValue('alias', initialData?.alias || '', { shouldValidate: true });
        setValue('comment', initialData?.comment || '', { shouldValidate: true });
        setValue('value', initialData?.value || '', { shouldValidate: true });
        setValue('status', initialData?.satus || '', { shouldValidate: true });
        setValue('startDate', initialData?.startDate || new Date().toISOString().slice(0, 10), { shouldValidate: true });
        setValue('endDate', initialData?.endDate || new Date().toISOString().slice(0, 10), { shouldValidate: true });
    }, [initialData, setValue]);


    const aliasValidation = useValidation<string>({
        initialValue: initialData?.alias || '',
        validationFunction: (value) => value.length <= 30,
        fieldName: 'alias',
        validationMessage: 'Alias może zawierać maksymalnie 30 znaków.',
        onValidationChange,
    });

    const commentValidation = useValidation<string>({
        initialValue: initialData?.comment || '',
        validationFunction: (value) => value.length <= 100,
        fieldName: 'comment',
        validationMessage: 'Komentarz może zawierać maksymalnie 100 znaków.',
        onValidationChange,
    });

    //pozostałe pola:
    const valueInPLNValidation = useValidation<string>({
        initialValue: initialData?.value || '',
        validationFunction: (value) => value.length <= 100,
        fieldName: 'value',
        validationMessage: 'Wartość może zawierać maksymalnie 100 znaków.',
        onValidationChange,
    });

    const statusValidation = useValidation<string>({
        initialValue: initialData?.status || '',
        validationFunction: (value) => value.length > 0,
        fieldName: 'status',
        validationMessage: 'Status jest wymagany.',
        onValidationChange,
    });

    function datesValidationFunction(value: { start: string, end: string }) {
        const { start, end } = { ...value };
        const endDate = new Date(end);
        const startDate = new Date(start);
        return start.length > 0 && end.length > 0 && endDate > startDate;
    }


    const [updateCounter, setUpdateCounter] = useState(0);

    useEffect(() => {
        const validationResult = datesValidationFunction({ start: startDate, end: endDate });
        setIsStartDateValid(validationResult);
        setIsEndDateValid(validationResult);
        if (onValidationChange) {
            onValidationChange('startDate', validationResult);
            onValidationChange('endDate', validationResult);
        }
        setUpdateCounter(updateCounter + 1);
    }, [startDate, endDate, onValidationChange, datesValidationFunction, updateCounter, setIsStartDateValid, setIsEndDateValid]);

    useEffect(() => {
        if (updateCounter === 0) {
            setStartDate(new Date().toISOString().slice(0, 10));
            setEndDate(new Date().toISOString().slice(0, 10));
        }
    }, [updateCounter]);

    function handleStartDateChange(e: React.ChangeEvent<HTMLInputElement>) {
        setStartDate(e.target.value);
    };

    function handleEndDateChange(e: React.ChangeEvent<HTMLInputElement>) {
        setEndDate(e.target.value);
    }


    return (
        <>
            <Form.Group controlId="name">
                <Form.Label>Nazwa kontraktu</Form.Label>
                <Form.Control
                    type="text"
                    placeholder="Podaj nazwę"
                    isInvalid={!!formState.errors?.name}
                    isValid={!formState.errors?.name}
                    {...register('name', {
                        required: { value: true, message: 'Nazwa jest wymagana' },
                        minLength: { value: 3, message: 'Nazwa musi mieć przynajmniej 3 znaki' },
                        maxLength: { value: 50, message: 'Nazwa może mieć maksymalnie 50 znaków' }
                    })
                    } />
                {formState.errors?.name && (
                    <Form.Text className="text-danger">
                        {formState.errors.name.message as string}
                    </Form.Text>
                )}
            </Form.Group>

            <Form.Group controlId="alias">
                <Form.Label>Alias</Form.Label>
                <Form.Control
                    type="text"
                    name='alias'
                    placeholder="Podaj alias"
                    value={aliasValidation.value}
                    onChange={aliasValidation.handleChange}
                    isInvalid={!aliasValidation.isValid}
                    isValid={aliasValidation.isValid}
                />
                {!aliasValidation.isValid && (
                    <Form.Text className="text-danger">
                        {aliasValidation.validationMessage}
                    </Form.Text>
                )}
            </Form.Group>

            <Form.Group controlId="comment">
                <Form.Label>Opis</Form.Label>
                <Form.Control
                    as="textarea"
                    name="comment"
                    rows={3}
                    placeholder="Podaj opis"
                    value={commentValidation.value}
                    onChange={commentValidation.handleChange}
                    isInvalid={!commentValidation.isValid}
                    isValid={commentValidation.isValid}
                />
                {!commentValidation.isValid && (
                    <Form.Text className="text-danger">
                        {commentValidation.validationMessage}
                    </Form.Text>
                )}
            </Form.Group>
            <Form.Group controlId="valueInPLN">
                <Form.Label>Wartość netto w PLN</Form.Label>
                <ValueInPLNInput
                    onChange={valueInPLNValidation.handleChange}
                    value={valueInPLNValidation.value}
                />
                {!valueInPLNValidation.isValid && (
                    <Form.Text className="text-danger">
                        {valueInPLNValidation.validationMessage}
                    </Form.Text>
                )}
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
                {!isStartDateValid && (
                    <Form.Text className="text-danger">
                        Data zakończenia musi być późniejsza niż data rozpoczęcia.
                    </Form.Text>
                )}
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
                {!isEndDateValid && (
                    <Form.Text className="text-danger">
                        Data zakończenia musi być późniejsza niż data rozpoczęcia.
                    </Form.Text>
                )}
            </Form.Group>
            <Form.Group controlId="status">
                <Form.Label>Status</Form.Label>
                <Form.Control
                    as="select"
                    isInvalid={!formState.isValid}
                    isValid={formState.isValid}
                    {...register('status', {
                        required: { value: true, message: 'Pole jest wymagane' }
                    })}
                >
                    <option value="">-- Wybierz opcję --</option>
                    {ContractsController.statusNames.map((statusName, index) => (
                        <option key={index} value={statusName}>{statusName}</option>
                    ))}
                </Form.Control>
                {
                    !formState.isValid && (
                        <Form.Text className="text-danger">
                            {formState.errors.status?.message as string}
                        </Form.Text>
                    )
                }
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