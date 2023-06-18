import React, { createContext, useContext, useEffect, useState } from 'react';
import { Button, Card as Container, Col, Row } from 'react-bootstrap';
import { Contract, Project, Task } from '../../Typings/bussinesTypes';
import { ContractProvider, useContract } from '../Contracts/ContractsList/ContractContext';
import { SpinnerBootstrap, TaskStatusBadge } from '../View/Resultsets/CommonComponents';
import FilterableTable from '../View/Resultsets/FilterableTable';
import { contractsRepository, projectsRepository, tasksRepository } from './TasksGlobalController';
import { TasksGlobalFilterBody } from './TasksGlobalFilterBody';
import { TaskAddNewModalButton as TaskGlobalAddNewModalButton, TaskEditModalButton as TaskGlobalEditModalButton } from './Modals/TasksGlobalModalButtons';
import { ProjectAddNewModalButton, ProjectEditModalButton } from './Modals/ProjectModalButtons';
import { ProjectsFilterBody } from './ProjectsFilterBody';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars, faTimes } from '@fortawesome/free-solid-svg-icons';

export default function TasksGlobal() {
    const [tasks, setTasks] = useState([] as Task[] | undefined);
    const [externalTasksUpdate, setExternalTasksUpdate] = useState(0);
    const [tasksLoaded, setTasksLoaded] = useState(true);
    const [selectedProject, setSelectedProject] = useState<Project | undefined>(undefined);
    const [showProjects, setShowProjects] = useState(true);

    useEffect(() => {
        if (!selectedProject) return;
        async function fetchData() {
            setTasksLoaded(false);

            const [tasks] = await Promise.all([
                tasksRepository.loadItemsFromServer({
                    _project: JSON.stringify(selectedProject)
                })
            ]);
            setTasks(tasks);
            setExternalTasksUpdate(prevState => prevState + 1);
            setTasksLoaded(true);
        };

        fetchData();
    }, [selectedProject]);

    function handleShowProjects() {
        setShowProjects(!showProjects);
        setTasks([]);
        setExternalTasksUpdate(prevState => prevState + 1);
    }

    return (
        <ContractProvider
            tasks={tasks}
            setTasks={setTasks}
        >
            <Container>
                <Row>
                    {showProjects &&
                        <Col md={3}>
                            <FilterableTable<Project>
                                title='Projekty'
                                repository={projectsRepository}
                                AddNewButtonComponents={[ProjectAddNewModalButton]}
                                FilterBodyComponent={ProjectsFilterBody}
                                EditButtonComponent={ProjectEditModalButton}
                                tableStructure={[
                                    { header: 'Nazwa', renderTdBody: (project: Project) => <>{project._ourId_Alias}</> },
                                ]}
                                onRowClick={setSelectedProject}
                            />
                        </Col>
                    }
                    <Col md={showProjects ? '9' : '12'}>
                        <div className="d-flex justify-content-end">
                            <div onClick={handleShowProjects}>
                                <FontAwesomeIcon icon={showProjects ? faTimes : faBars} />
                            </div>
                        </div>
                        {tasksLoaded ?
                            <FilterableTable<Task>
                                title='Zadania'
                                initialObjects={tasks}
                                repository={tasksRepository}
                                AddNewButtonComponents={[TaskGlobalAddNewModalButton]}
                                FilterBodyComponent={!showProjects ? TasksGlobalFilterBody : undefined}
                                EditButtonComponent={TaskGlobalEditModalButton}
                                sectionsStructure={[
                                    {
                                        name: 'Kontrakty',
                                        repository: contractsRepository,
                                        makeTittleLabel: (contract) => contract.name,
                                        getIdAsLeafSection: (contract) => contract.id,
                                    },

                                ]}
                                tableStructure={[
                                    { header: 'Kamień|Sprawa', renderTdBody: (task: Task) => <>{task._parent._typeFolderNumber_TypeName_Number_Name}</> },
                                    { header: 'Nazwa', objectAttributeToShow: 'name' },
                                    { header: 'Opis', objectAttributeToShow: 'description' },
                                    { header: 'Termin', objectAttributeToShow: 'deadline' },
                                    { header: 'Status', renderTdBody: (task: Task) => <TaskStatusBadge status={task.status} /> },
                                    { header: 'Właściciel', renderTdBody: (task: Task) => <>{`${task._owner.name} ${task._owner.surname}`}</> },
                                ]}
                                externalUpdate={externalTasksUpdate}

                            />
                            :
                            <>
                                <p>Ładuję zadania dla projektu:</p>
                                <h3>{selectedProject?._ourId_Alias}</h3>
                                <p>{selectedProject?.name}</p>
                                <SpinnerBootstrap />
                            </>
                        }
                    </Col>
                </Row>
            </Container>
        </ContractProvider>
    );
}