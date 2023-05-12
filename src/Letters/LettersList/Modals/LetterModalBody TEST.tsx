import React, { useEffect, useRef, useState } from 'react';
import { CaseSelectMenuElement, ContractSelectFormElement, FileInput, MyAsyncTypeahead, PersonSelectFormElement, ProjectSelector } from '../../../View/Modals/CommonFormComponents';
import { Col, Form, Row } from 'react-bootstrap';
import { casesRepository, contractsRepository, projectsRepository } from '../LettersSearch';
import { useFormContext } from '../../../View/Modals/FormContext';
import { ModalBodyProps } from '../../../View/Modals/ModalsTypes';
import MainSetup from '../../../React/MainSetupReact';
import { RepositoryDataItem } from '../../../../Typings/bussinesTypes';


type ProjectSelectorProps = ModalBodyProps & {
    SpecificContractModalBody?: React.ComponentType<ModalBodyProps>;
};


export function ProjectSelectorModalBody({ isEditing, additionalProps }: ProjectSelectorProps) {
    const { register, setValue, watch, formState } = useFormContext();
    const _project = (watch('_project') as RepositoryDataItem | undefined);

    return (
        <>
            <ProjectSelector
                repository={projectsRepository}
                required={true}
                name='_project'
            />

            <Form.Group>
                <Form.Label>Dotyczy spraw</Form.Label>
                <CaseSelectMenuElement
                    name='_cases'
                    repository={casesRepository}
                    required={true}
                />
            </Form.Group>
        </>
    );
};
