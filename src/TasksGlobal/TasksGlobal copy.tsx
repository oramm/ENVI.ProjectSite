import React, { ComponentType, createContext, useContext, useEffect, useState } from 'react';
import { Button, Card as Container, Col, Row } from 'react-bootstrap';
import { Case, Contract, Milestone, OtherContract, OurContract, Person, Project, RepositoryDataItem, Task } from '../../Typings/bussinesTypes';
import { ContractProvider, useContract } from '../Contracts/ContractsList/ContractContext';
import { SpinnerBootstrap, TaskStatusBadge } from '../View/Resultsets/CommonComponents';
import FilterableTable from '../View/Resultsets/FilterableTable/FilterableTable';
import { casesRepository, contractsWithChildrenRepository, milestonesRepository, projectsRepository, tasksRepository } from './TasksGlobalController';
import { TasksGlobalFilterBody } from './TasksGlobalFilterBody';
import { TaskAddNewModalButton as TaskGlobalAddNewModalButton, TaskEditModalButton as TaskGlobalEditModalButton } from './Modals/TasksGlobalModalButtons';
import { ProjectAddNewModalButton, ProjectEditModalButton } from './Modals/ProjectModalButtons';
import { ProjectsFilterBody } from './ProjectsFilterBody';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars, faTimes } from '@fortawesome/free-solid-svg-icons';
import { SectionNode } from '../View/Resultsets/FilterableTable/Section';
import { CaseAddNewModalButton, CaseEditModalButton } from './Modals/Case/CaseModalButtons';
import { SpecificAddNewModalButtonProps, SpecificEditModalButtonProps } from '../View/Modals/ModalsTypes';
import { ContractEditModalButton } from './Modals/ContractModalButtons';
import { caseTypesRepository, milestoneTypesRepository } from '../Contracts/ContractsList/ContractsController';

export default function TasksGlobal() {
    const [tasks, setTasks] = useState([] as Task[] | undefined); //undefined żeby pasowało do typu danych w ContractProvider
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
                }),
                caseTypesRepository.loadItemsFromServer(),
                milestoneTypesRepository.loadItemsFromServer(),
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

    function makeTaskParentsLabel(task: Task) {
        const _contract = task._parent._parent._parent;
        const _milestone = task._parent._parent;
        const _case = task._parent;

        return `${_contract.ourId || ''} ${_contract.alias || ''} ${_contract.number || ''} | ` +
            `${_milestone._FolderNumber_TypeName_Name || ''} |` +
            `${_case._type.name || ''} | ${_case.name || ''}`;
    }

    function makeTableStructure() {
        const tableStructure = [];
        if (!showProjects) {
            tableStructure.push(
                { header: 'Kamień|Sprawa', renderTdBody: (task: Task) => <>{makeTaskParentsLabel(task)}</> }
            );
        }

        tableStructure.push(
            { header: 'Nazwa i opis', renderTdBody: (task: Task) => <>{task.name}<br />{task.description}</> },
            { header: 'Termin', objectAttributeToShow: 'deadline' },
            { header: 'Status', renderTdBody: (task: Task) => <TaskStatusBadge status={task.status} /> },
            { header: 'Właściciel', renderTdBody: (task: Task) => <>{`${task._owner.name} ${task._owner.surname}`}</> },
        );
        return tableStructure;
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
                                id='projects'
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
                                id='tasks'
                                title='Zadania'
                                showTableHeader={false}
                                initialObjects={tasks}
                                repository={tasksRepository}
                                AddNewButtonComponents={[TaskGlobalAddNewModalButton]}
                                FilterBodyComponent={!showProjects ? TasksGlobalFilterBody : undefined}
                                EditButtonComponent={TaskGlobalEditModalButton}
                                initialSections={buildTree(tasks || [])}
                                tableStructure={makeTableStructure()}
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

function makeContractTitleLabel(contract: OurContract | OtherContract) {
    const manager = contract._manager as Person;

    let label = 'K: ';
    label += contract.ourId ? `${contract.ourId || ''}` : `${contract._type.name} ${contract.number}`;
    if (contract.alias) label += ` [${contract.alias || ''}] `;
    if (manager) label += ` ${manager.name} ${manager.surname}`;
    return label;
}

function contractNodeEditHandler(node: SectionNode<Task>) {
    const contract = node.dataItem as OurContract | OtherContract;
    node.titleLabel = makeContractTitleLabel(contract);
}

function makeMilestoneTitleLabel(milestone: Milestone) {
    return `M: ${milestone._type._folderNumber} ${milestone._type.name} ${milestone.name || ''}`
}

function makeCaseTitleLabel(caseItem: Case) {
    return `S: ${caseItem._type.name} ${caseItem.name || ''}`;
}

function buildTree(tasks: Task[]): SectionNode<Task>[] {
    const contractNodes: SectionNode<Task>[] = [];
    for (const task of tasks) {
        const contract = task._parent._parent._parent;
        const milestone = task._parent._parent;
        const caseItem = task._parent;

        let contractNode = contractNodes.find(c => c.dataItem.id === contract.id);
        if (!contractNode) {
            const nodeName = 'contract';
            contractNode = {
                id: nodeName + contract.id,
                isInAccordion: true,
                level: 1,
                name: nodeName,
                repository: contractsWithChildrenRepository,
                dataItem: contract,
                titleLabel: makeContractTitleLabel(contract),
                children: [],
                EditButtonComponent: ContractEditModalButton as unknown as ComponentType<SpecificEditModalButtonProps<RepositoryDataItem>>,
                editHandler: contractNodeEditHandler,
                isDeletable: false,
            };
            contractNodes.push(contractNode);
        }

        const milestoneNodeName = 'milestone';
        let milestoneNode = contractNode.children.find(m => m.id === milestoneNodeName + milestone.id);
        if (!milestoneNode) {

            milestoneNode = {
                id: milestoneNodeName + milestone.id,
                isInAccordion: false,
                level: 2,
                name: milestoneNodeName,
                repository: milestonesRepository,
                dataItem: milestone,
                titleLabel: makeMilestoneTitleLabel(milestone),
                children: [],
                AddNewButtonComponent: CaseAddNewModalButton as unknown as ComponentType<SpecificAddNewModalButtonProps<RepositoryDataItem>>,

                isDeletable: true,
            };
            contractNode.children.push(milestoneNode);
        }

        const caseNodeName = 'case';
        let caseNode = milestoneNode.children.find(c => c.id === caseNodeName + caseItem.id);
        if (!caseNode) {
            caseNode = {
                id: caseNodeName + caseItem.id,
                level: 3,
                name: 'case',
                repository: casesRepository,
                dataItem: caseItem,
                titleLabel: makeCaseTitleLabel(caseItem),
                children: [],
                leaves: [],
                isDeletable: true,
                EditButtonComponent: CaseEditModalButton as unknown as ComponentType<SpecificEditModalButtonProps<RepositoryDataItem>>,
                editHandler: (node: SectionNode<Task>) => { node.titleLabel = makeCaseTitleLabel(node.dataItem as Case) },
            };
            milestoneNode.children.push(caseNode);
        }
        if (!caseNode.leaves) caseNode.leaves = [];
        caseNode.leaves.push(task);
    }

    return contractNodes;
}