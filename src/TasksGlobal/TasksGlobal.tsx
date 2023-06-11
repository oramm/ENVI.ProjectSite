import React, { createContext, useContext, useEffect, useState } from 'react';
import { Button, Card as Container, Col, Row } from 'react-bootstrap';
import { Task } from '../../Typings/bussinesTypes';
import { ContractProvider, useContract } from '../Contracts/ContractsList/ContractContext';
import ToolsDate from '../React/ToolsDate';
import { SpinnerBootstrap, TaskStatusBadge } from '../View/Resultsets/CommonComponents';
import FilterableTable from '../View/Resultsets/FilterableTable';
import { tasksRepository } from './TasksGlobalController';
import { TasksGlobalFilterBody } from './TasksGlobalFilterBody';
import { TaskAddNewModalButton as TaskGlobalAddNewModalButton, TaskEditModalButton as TaskGlobalEditModalButton } from './TasksGlobalModalButtons';

export default function TasksGlobal() {
    const [tasks, setTasks] = useState([] as Task[] | undefined);
    const [showLeftCol, setShowLeftCol] = useState(true);

    const handleToggle = () => {
        setShowLeftCol(!showLeftCol);
    };

    return (
        <ContractProvider
            tasks={tasks}
            setTasks={setTasks}
        >
            <Container>
                <Row>
                    {showLeftCol && (
                        <Col md={3}>
                            Projekty
                        </Col>
                    )}
                    <Col md={showLeftCol ? 9 : 12}>
                        {tasks ?
                            <FilterableTable<Task>
                                title='Zadania'
                                initialObjects={tasks}
                                repository={tasksRepository}
                                AddNewButtonComponents={[TaskGlobalAddNewModalButton]}
                                FilterBodyComponent={TasksGlobalFilterBody}
                                EditButtonComponent={TaskGlobalEditModalButton}
                                tableStructure={[
                                    { header: 'Nazwa', objectAttributeToShow: 'name' },
                                    { header: 'Opis', objectAttributeToShow: 'description' },
                                    { header: 'Termin', objectAttributeToShow: 'deadline' },
                                    { header: 'Status', renderTdBody: (task: Task) => <TaskStatusBadge status={task.status} /> },
                                    { header: 'Właściciel', renderTdBody: (task: Task) => <>{`${task._owner.name} ${task._owner.surname}`}</> },
                                ]}
                            />
                            : <>"Ładowanie zadań..." <SpinnerBootstrap /></>
                        }
                    </Col>
                </Row>
                <Button onClick={handleToggle}>
                    {showLeftCol ? 'Ukryj' : 'Pokaż'} Projekty
                </Button>
            </Container>
        </ContractProvider>
    );
}