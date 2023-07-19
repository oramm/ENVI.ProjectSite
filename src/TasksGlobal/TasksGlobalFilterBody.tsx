import React from 'react';
import { Col, Form, Row } from 'react-bootstrap';
import { useFormContext } from '../View/Modals/FormContext';
import { TasksFilterBodyCommonFields } from '../Contracts/ContractsList/ContractDetails/Tasks/TasksFilterBodyCommonFields';
import { useContract } from '../Contracts/ContractsList/ContractContext';
import { ContractSelectFormElement } from '../View/Modals/CommonFormComponents';
import { contractsWithChildrenRepository, projectsRepository } from './TasksGlobalController';

export function TasksGlobalFilterBody() {
    const { register } = useFormContext();
    const { project } = useContract();
    return (
        <>
            <TasksFilterBodyCommonFields />
            <Row xl={5} md={3} xs={1}>
                {!project &&
                    <Col>
                        <Form.Group as={Col} controlId="_contract">
                            <Form.Label>Kontrakt</Form.Label>
                            <ContractSelectFormElement
                                repository={contractsWithChildrenRepository}
                                showValidationInfo={false}
                                _project={project}
                            />
                        </Form.Group>
                    </Col>
                }
            </Row >
        </>
    );
}