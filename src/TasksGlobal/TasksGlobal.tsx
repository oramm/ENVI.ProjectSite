import React, { ComponentType, createContext, useContext, useEffect, useState } from 'react';
import { Button, Card as Container, Col, Row } from 'react-bootstrap';
import { Case, Milestone, OtherContract, OurContract, Person, Project, RepositoryDataItem, Task } from '../../Typings/bussinesTypes';
import { SpinnerBootstrap, TaskStatusBadge } from '../View/Resultsets/CommonComponents';
import FilterableTable from '../View/Resultsets/FilterableTable/FilterableTable';
import { casesRepository, contractsRepository, contractsWithChildrenRepository, milestonesRepository, projectsRepository, tasksRepository } from './TasksGlobalController';
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
import { ContractsWithChildren } from './TasksGlobalTypes';

export default function TasksGlobal() {
    //const [tasks, setTasks] = useState([] as Task[] | undefined); //undefined żeby pasowało do typu danych w ContractProvider
    const [contractsWithChildren, setContractsWithCildren] = useState([] as ContractsWithChildren[]);
    const [externalUpdate, setExternalUpdate] = useState(0);
    const [tasksLoaded, setDataLoaded] = useState(true);
    const [selectedProject, setSelectedProject] = useState<Project | undefined>(undefined);
    const [showProjects, setShowProjects] = useState(true);

    useEffect(() => {
        if (!selectedProject) return;
        async function fetchData() {
            setDataLoaded(false);

            const [contractsWithChildren] = await Promise.all([
                contractsWithChildrenRepository.loadItemsFromServer({
                    _project: JSON.stringify(selectedProject)
                }),
                caseTypesRepository.loadItemsFromServer(),
                milestoneTypesRepository.loadItemsFromServer(),
            ]);
            setContractsWithCildren(contractsWithChildren);
            setExternalUpdate(prevState => prevState + 1);
            setDataLoaded(true);
        };

        fetchData();
    }, [selectedProject]);


    function handleShowProjects() {
        setShowProjects(!showProjects);
        setContractsWithCildren([]);
        setExternalUpdate(prevState => prevState + 1);
    }

    function makeTaskParentsLabel(task: Task) {
        const _contract = task._parent._parent._parent;
        const _milestone = task._parent._parent;
        const _case = task._parent;

        return `${_contract.ourId || ''} ${_contract.alias || ''} ${_contract.number || ''} | ` +
            `${_milestone._FolderNumber_TypeName_Name || ''} |` +
            `${_case._type.name || ''} | ${_case.name || ''}`;
    }

    function makeTasksTableStructure() {
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
                            showTableHeader={false}
                            //initialObjects={contractsWithChildren}
                            repository={tasksRepository}
                            AddNewButtonComponents={[TaskGlobalAddNewModalButton]}
                            FilterBodyComponent={!showProjects ? TasksGlobalFilterBody : undefined}
                            EditButtonComponent={TaskGlobalEditModalButton}
                            initialSections={buildTree(contractsWithChildren)}
                            tableStructure={makeTasksTableStructure()}
                            externalUpdate={externalUpdate}

                        />
                        :
                        <LoadingMessage selectedProject={selectedProject} />
                    }
                </Col>
            </Row>
        </Container>
    );
}

function LoadingMessage({ selectedProject }: { selectedProject: Project | undefined }) {
    return (
        <>
            <p> Ładuję zadania dla projektu:</p >
            <h3>{selectedProject?._ourId_Alias}</h3>
            <p>{selectedProject?.name}</p>
            <SpinnerBootstrap />
        </>)
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

function buildTree(contractsWithChildrenInput: ContractsWithChildren[]): SectionNode<Task>[] {
    const contractNodes: SectionNode<Task>[] = [];

    for (const { contract, milestonesWithCases: milestonesWitchCases } of contractsWithChildrenInput) {
        const contractNode = {
            id: 'contract' + contract.id,
            isInAccordion: true,
            level: 1,
            name: 'contract',
            repository: contractsRepository,
            dataItem: contract,
            titleLabel: makeContractTitleLabel(contract), // Dostosuj do Twojej metody
            children: [] as SectionNode<Task>[],
            EditButtonComponent: ContractEditModalButton as unknown as ComponentType<SpecificEditModalButtonProps<RepositoryDataItem>>, // Dostosuj do Twojego komponentu
            editHandler: contractNodeEditHandler, // Dostosuj do Twojej metody
            isDeletable: false,
        };
        contractNodes.push(contractNode);

        for (const { milestone, casesWithTasks } of milestonesWitchCases || []) {
            const milestoneNode = {
                id: 'milestone' + milestone.id,
                isInAccordion: false,
                level: 2,
                name: 'milestone',
                repository: milestonesRepository, // Dostosuj do Twojego repozytorium kamieni milowych
                dataItem: milestone,
                titleLabel: makeMilestoneTitleLabel(milestone), // Dostosuj do Twojej metody
                children: [] as SectionNode<Task>[],
                AddNewButtonComponent: CaseAddNewModalButton as unknown as ComponentType<SpecificAddNewModalButtonProps<RepositoryDataItem>>, // Dostosuj do Twojego komponentu
                isDeletable: true,
            };
            contractNode.children.push(milestoneNode);

            for (const { caseItem, tasks } of casesWithTasks || []) {
                const caseNode = {
                    id: 'case' + caseItem.id,
                    level: 3,
                    name: 'case',
                    repository: casesRepository, // Dostosuj do Twojego repozytorium spraw
                    dataItem: caseItem,
                    titleLabel: makeCaseTitleLabel(caseItem), // Dostosuj do Twojej metody
                    children: [],
                    leaves: [] as Task[],
                    isDeletable: true,
                    EditButtonComponent: CaseEditModalButton as unknown as ComponentType<SpecificEditModalButtonProps<RepositoryDataItem>>, // Dostosuj do Twojego komponentu
                    editHandler: (node: SectionNode<Task>) => { node.titleLabel = makeCaseTitleLabel(node.dataItem as Case) }, // Dostosuj do Twojej metody
                };
                milestoneNode.children.push(caseNode);

                for (const task of tasks || []) {
                    if (!caseNode.leaves) caseNode.leaves = [];
                    caseNode.leaves.push(task);
                }
                tasksRepository.items = [...tasksRepository.items, ...caseNode.leaves];
            }
        }
    }
    console.log('contractNodes', contractNodes);
    return contractNodes;
}