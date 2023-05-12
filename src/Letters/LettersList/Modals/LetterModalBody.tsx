import React, { useEffect, useRef, useState } from 'react';
import { ContractSelectFormElement, FileInput, MyAsyncTypeahead, PersonSelectFormElement, ProjectSelector } from '../../../View/Modals/CommonFormComponents';
import { Col, Form, Row } from 'react-bootstrap';
import { contractsRepository, projectsRepository } from '../LettersSearch';
import { useFormContext } from '../../../View/Modals/FormContext';
import { ModalBodyProps } from '../../../View/Modals/ModalsTypes';
import MainSetup from '../../../React/MainSetupReact';
import { RepositoryDataItem } from '../../../../Typings/bussinesTypes';

export function LetterModalBody({ isEditing, initialData }: ModalBodyProps) {
    const { register, setValue, watch, formState, trigger } = useFormContext();
    const _project = watch('_project') as RepositoryDataItem | undefined;
    const _contract = watch('_contract');

    function getContractFromCases(_cases: RepositoryDataItem[]) {
        if (!_cases || _cases.length === 0) return undefined;
        const _contract = contractsRepository
        return _cases[0]._parent._parent as RepositoryDataItem;
    }

    useEffect(() => {
        setValue('_contract', getContractFromCases(initialData?._cases), { shouldValidate: true });
        setValue('description', initialData?.description || '', { shouldValidate: true });
        setValue('creationDate', initialData?.creationDate || new Date().toISOString().slice(0, 10), { shouldValidate: true });
        setValue('registrationDate', initialData?.registrationDate || new Date().toISOString().slice(0, 10), { shouldValidate: true });
        setValue('_editor', initialData?._editor, { shouldValidate: true });

    }, [initialData, setValue]);

    return (
        <>
            <Form.Group controlId="_contract">
                <Form.Label>Wybierz kontrakt</Form.Label>
                <ContractSelectFormElement
                    name='_contract'
                    repository={contractsRepository}
                    _project={_project}
                    readOnly={!isEditing}
                />
            </Form.Group>
            <Form.Group controlId="description">
                <Form.Label>Opis</Form.Label>
                <Form.Control
                    as="textarea"
                    rows={3}
                    placeholder="Podaj opis"
                    isValid={!formState.errors?.description}
                    isInvalid={!!formState.errors?.description}
                    {...register('description')}
                />
                {
                    formState.errors?.description && (
                        <Form.Text className="text-danger">
                            {formState.errors.description.message as string}
                        </Form.Text>
                    )
                }
            </Form.Group>
            <Row >
                <Form.Group as={Col} controlId="creationDate">
                    <Form.Label>Data utworzenia</Form.Label>
                    <Form.Control
                        type="date"
                        isValid={!formState.errors.creationDate}
                        isInvalid={!!formState.errors.creationDate}
                        {...register('creationDate')}
                        onChange={(e) => {
                            register("creationDate").onChange(e); // wywołaj standardowe zachowanie
                            trigger("registrationDate");
                        }}
                    />
                    {formState.errors.startDate && (
                        <Form.Text className="text-danger">
                            {formState.errors.startDate.message as string}
                        </Form.Text>
                    )}
                </Form.Group>
                <Form.Group as={Col} controlId="registrationDate">
                    <Form.Label>Data Nadania</Form.Label>
                    <Form.Control
                        type="date"
                        isValid={!formState.errors.registrationDate}
                        isInvalid={!!formState.errors.registrationDate}
                        {...register('registrationDate')}
                        onChange={(e) => {
                            register("registrationDate").onChange(e); // wywołaj standardowe zachowanie
                            trigger("creationDate");
                        }}
                    />
                    {formState.errors.registrationDate && (
                        <Form.Text className="text-danger">
                            {formState.errors.registrationDate.message as string}
                        </Form.Text>
                    )}
                </Form.Group>
            </Row>
            <Form.Group controlId="_editor">
                <PersonSelectFormElement
                    label='Osoba rejestrująca'
                    name='_editor'
                    repository={MainSetup.personsEnviRepository}
                    required={true}
                />
            </Form.Group>
            <Form.Group controlId="file">
                <FileInput
                    name="file"
                    acceptedFileTypes="application/msword, application/vnd.ms-excel, application/pdf"
                />
            </Form.Group>
        </>
    );
}

type ProjectSelectorProps = ModalBodyProps & {
    SpecificContractModalBody?: React.ComponentType<ModalBodyProps>;
};
/** przełęcza widok pomiędzy wyborem projektu a formularzem pisma
 * SpecificContractModalBody - komponent formularza kontraktu (OurContractModalBody lub OtherContractModalBody)
 * @param additionalProps - dodatkowe propsy przekazywane do SpecificContractModalBody - ustawiane w Otjer lub OurContractModalBody
 * w tym przypadku jest additionalProps zawiera tylko parametr SpecificContractModalBody - komponent formularza kontraktu (OurContractModalBody lub OtherContractModalBody)
 * 
 */
export function ProjectSelectorModalBody({ isEditing, additionalProps }: ProjectSelectorProps) {
    const { register, setValue, watch, formState } = useFormContext();
    const project = (watch('_project') as RepositoryDataItem | undefined);

    //musi być zgodna z nazwą w Our... lub OtherContractModalBody
    const { SpecificLetterModalBody } = additionalProps;
    if (!SpecificLetterModalBody) throw new Error("SpecificContractModalBody is not defined");

    return (
        <>
            {project ? (
                <SpecificLetterModalBody
                    isEditing={isEditing}
                    additionalProps={additionalProps}
                />
            ) : (
                <ProjectSelector
                    repository={projectsRepository}
                    required={true}
                    name='_project'
                />
            )}
        </>
    );
};
