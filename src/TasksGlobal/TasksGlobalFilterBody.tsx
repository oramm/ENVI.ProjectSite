import React from 'react';
import { Col, Row } from 'react-bootstrap';
import { useFormContext } from '../View/Modals/FormContext';
import { TasksFilterBodyCommonFields } from '../Contracts/ContractsList/ContractDetails/Tasks/TasksFilterBodyCommonFields';
import { useContract } from '../Contracts/ContractsList/ContractContext';
import { FilterBodyProps } from '../View/Resultsets/FilterableTable';
import { ProjectSelector, ContractSelectFormElement } from '../View/Modals/CommonFormComponents';
import { contractsRepository, projectsRepository } from './TasksGlobalController';


export function TasksGlobalFilterBody({ }: FilterBodyProps) {
    const { register } = useFormContext();
    const { project } = useContract();
    return (
        <>
            <TasksFilterBodyCommonFields />
            <Row xl={5} md={3} xs={1}>
                {!project &&
                    <Col>
                        <ProjectSelector
                            repository={projectsRepository}
                            name='_project'
                            showValidationInfo={false}
                        />
                        <ContractSelectFormElement
                            repository={contractsRepository}
                            showValidationInfo={false}
                            _project={project}
                        />
                    </Col>
                }
            </Row >
        </>
    );
}