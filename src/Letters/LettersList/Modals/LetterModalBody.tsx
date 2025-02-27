import React, { useEffect, useRef, useState } from 'react';
import { CaseSelectMenuElement, ContractSelectFormElement, ErrorMessage, FileInput, MyAsyncTypeahead, PersonSelectFormElement, ProjectSelector } from '../../../View/Modals/CommonFormComponents';
import { Alert, Col, Form, Placeholder, Row } from 'react-bootstrap';
import { useFormContext } from '../../../View/Modals/FormContext';
import { ModalBodyProps } from '../../../View/Modals/ModalsTypes';
import MainSetup from '../../../React/MainSetupReact';
import { Case, Contract, IncomingLetter, OurLetter, Project, RepositoryDataItem } from '../../../../Typings/bussinesTypes';
import { casesRepository, contractsRepository, projectsRepository } from '../LettersController';

export function LetterModalBody({ isEditing, initialData }: ModalBodyProps<OurLetter | IncomingLetter>) {
    const { register, reset, setValue, watch, formState: { dirtyFields, errors, isValid }, trigger } = useFormContext();
    const _project = isEditing ? undefined : watch('_project') as Project | undefined;

    const _contract = watch('_contract');
    const creationDate = watch('creationDate');
    const registrationDate = watch('registrationDate');

    function getContractFromCases(_cases: Case[] | undefined) {
        if (!_cases || _cases.length === 0) return undefined;
        return _cases[0]._parent._parent as Contract;
    }

    useEffect(() => {
        const resetData: any = {
            _contract: getContractFromCases(initialData?._cases),
            _cases: initialData?._cases || [],
            description: initialData?.description || '',
            creationDate: initialData?.creationDate || new Date().toISOString().slice(0, 10),
            registrationDate: initialData?.registrationDate || new Date().toISOString().slice(0, 10),
            _editor: initialData?._editor
        };
        if (!isEditing) resetData._project = _project;
        reset(resetData);

        trigger();
    }, [initialData, reset]);

    useEffect(() => {
        if (!dirtyFields._contract) return;
        setValue('_cases', undefined, { shouldValidate: true });
    }, [_contract, _contract?.id, setValue]);

    useEffect(() => {
        trigger(['creationDate', 'registrationDate']);
    }, [trigger, watch, creationDate, registrationDate]);

    useEffect(() => {
        setValue('registrationDate', creationDate);
    }, [setValue, creationDate]);

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
            <Form.Group>
                <Form.Label>Dotyczy spraw</Form.Label>
                {_contract ?
                    <CaseSelectMenuElement
                        name='_cases'
                        repository={casesRepository}
                        _project={_project}
                        _contract={_contract}
                        readonly={!_contract}
                    />
                    :
                    <Alert variant='warning'>Wybierz kontrakt, by przypisać do spraw</Alert>
                }
            </Form.Group>

            <Form.Group controlId="description">
                <Form.Label>Opis</Form.Label>
                <Form.Control
                    as="textarea"
                    rows={3}
                    placeholder="Podaj opis"
                    isValid={!errors?.description}
                    isInvalid={!!errors?.description}
                    {...register('description')}
                />
                <ErrorMessage name='description' errors={errors} />
            </Form.Group>
            <Row >
                <Form.Group as={Col} controlId="creationDate">
                    <Form.Label>Data utworzenia</Form.Label>
                    <Form.Control
                        type="date"
                        isValid={!errors.creationDate}
                        isInvalid={!!errors.creationDate}
                        {...register('creationDate')}
                    />
                    <ErrorMessage name='creationDate' errors={errors} />
                </Form.Group>
                <Form.Group as={Col} controlId="registrationDate">
                    <Form.Label>Data Nadania</Form.Label>
                    <Form.Control
                        type="date"
                        isValid={!errors.registrationDate}
                        isInvalid={!!errors.registrationDate}
                        {...register('registrationDate')}
                    />
                    <ErrorMessage name='registrationDate' errors={errors} />
                </Form.Group>
            </Row>
            <Form.Group controlId="_editor">
                <PersonSelectFormElement
                    label='Osoba rejestrująca'
                    name='_editor'
                    repository={MainSetup.personsEnviRepository}
                />
            </Form.Group>
            <Form.Group controlId="file">
                <Form.Label>Plik</Form.Label>
                <FileInput
                    acceptedFileTypes="application/msword, application/vnd.ms-excel, application/pdf"
                    {...register('file')}
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
    const _project = (watch('_project') as Project | undefined);

    //musi być zgodna z nazwą w Our... lub OtherContractModalBody
    const { SpecificLetterModalBody } = additionalProps;
    if (!SpecificLetterModalBody) throw new Error("SpecificContractModalBody is not defined");

    return (
        <>
            {_project ? (
                <SpecificLetterModalBody
                    isEditing={isEditing}
                    additionalProps={additionalProps}
                />
            ) : (
                <ProjectSelector
                    repository={projectsRepository}
                    name='_project'
                />
            )}
        </>
    );
};