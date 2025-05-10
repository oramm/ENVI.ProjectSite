import React, { ComponentType, createContext, useContext, useEffect, useState } from "react";
import { Button, Card as Container, Col, Row } from "react-bootstrap";
import {
    Case,
    MilestoneData,
    OtherContract,
    OurContract,
    PersonData,
    ProjectData,
    RepositoryDataItem,
    Task,
} from "../../Typings/bussinesTypes";
import { SpinnerBootstrap, TaskStatusBadge } from "../View/Resultsets/CommonComponents";
import FilterableTable from "../View/Resultsets/FilterableTable/FilterableTable";
import {
    casesRepository,
    contractsRepository,
    contractsWithChildrenRepository,
    milestonesRepository,
    projectsRepository,
    tasksGlobalRepository,
} from "./TasksGlobalController";
import { TaskAddNewModalButton, TaskEditModalButton } from "./Modals/TasksGlobalModalButtons";
import { ProjectAddNewModalButton, ProjectEditModalButton } from "./Modals/ProjectModalButtons";
import { ProjectsFilterBody } from "./ProjectsFilterBody";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBars, faTimes } from "@fortawesome/free-solid-svg-icons";
import { SectionNode } from "../View/Resultsets/FilterableTable/Section";
import { CaseAddNewModalButton, CaseEditModalButton } from "./Modals/Case/CaseModalButtons";
import { SpecificAddNewModalButtonProps, SpecificEditModalButtonProps } from "../View/Modals/ModalsTypes";
import { ContractEditModalButton } from "./Modals/ContractModalButtons";
import { caseTypesRepository, milestoneTypesRepository } from "../Contracts/ContractsList/ContractsController";
import { ContractsWithChildren } from "./TasksGlobalTypes";
import { MilestoneAddNewModalButton, MilestoneEditModalButton } from "./Modals/Milestone/MilestoneModalButtons";
import { getSymbolByUniqueness } from "../View/Symbols";

export default function TasksGlobal() {
    //const [tasks, setTasks] = useState([] as Task[] | undefined); //undefined żeby pasowało do typu danych w ContractProvider
    const [contractsWithChildren, setContractsWithCildren] = useState([] as ContractsWithChildren[]);
    const [externalUpdate, setExternalUpdate] = useState(0);
    const [dataLoaded, setDataLoaded] = useState(true);
    const [selectedProject, setSelectedProject] = useState<ProjectData | undefined>(undefined);
    const [showProjects, setShowProjects] = useState(true);

    useEffect(() => {
        if (!selectedProject) return;
        async function fetchData() {
            setDataLoaded(false);

            const [contractsWithChildren] = await Promise.all([
                contractsWithChildrenRepository.loadItemsFromServerPOST([
                    {
                        _project: selectedProject,
                        statusType: "active",
                    },
                ]),
                caseTypesRepository.loadItemsFromServerPOST(),
                milestoneTypesRepository.loadItemsFromServerPOST(),
            ]);
            setContractsWithCildren(contractsWithChildren);
            setExternalUpdate((prevState) => prevState + 1);
            setDataLoaded(true);
        }

        fetchData();
    }, [selectedProject]);

    function handleShowProjects() {
        setShowProjects(!showProjects);
        setContractsWithCildren([]);
        setExternalUpdate((prevState) => prevState + 1);
    }

    function makeTaskParentsLabel(task: Task) {
        const _contract = task._parent._parent._contract as OurContract | OtherContract;
        const _milestone = task._parent._parent;
        const _case = task._parent;
        const ourId = "ourId" in _contract ? _contract.ourId : undefined;
        return (
            `${ourId || ""} ${_contract.alias || ""} ${_contract.number || ""} | ` +
            `${_milestone._FolderNumber_TypeName_Name || ""} |` +
            `${_case._type.name || ""} | ${_case.name || ""}`
        );
    }

    function renderTaskRowInCaseSection(task: Task) {
        return (
            <Row>
                <Col md={5}>
                    {task.name}
                    <br />
                    {task.description && <span className="text-secondary small">{task.description}</span>}
                </Col>
                <Col md={2}>{task.deadline && `${task.deadline}`} </Col>
                <Col md={2}>
                    <TaskStatusBadge status={task.status} />
                </Col>
                <Col md={3}>{task._owner && `${task._owner.name} ${task._owner.surname}`}</Col>
            </Row>
        );
    }

    return (
        <Container>
            <div className="d-flex justify-content-end">
                <div onClick={handleShowProjects}>
                    <FontAwesomeIcon icon={showProjects ? faTimes : faBars} />
                </div>
            </div>
            {showProjects && (
                <Row>
                    <Col md="3">
                        <FilterableTable<ProjectData>
                            id="projects"
                            title="Projekty"
                            repository={projectsRepository}
                            showTableHeader={false}
                            AddNewButtonComponents={[ProjectAddNewModalButton]}
                            FilterBodyComponent={ProjectsFilterBody}
                            EditButtonComponent={ProjectEditModalButton}
                            tableStructure={[
                                {
                                    header: "Nazwa",
                                    renderTdBody: (project: ProjectData) => <>{project._ourId_Alias}</>,
                                    colLg: 11,
                                },
                            ]}
                            onRowClick={setSelectedProject}
                        />
                    </Col>
                    <Col md="9">
                        {dataLoaded ? (
                            <FilterableTable<Task>
                                id="tasks"
                                title="Zadania"
                                showTableHeader={false}
                                repository={tasksGlobalRepository}
                                FilterBodyComponent={undefined}
                                EditButtonComponent={TaskEditModalButton}
                                initialSections={buildTree(contractsWithChildren)}
                                tableStructure={[
                                    { header: "Zadania", renderTdBody: renderTaskRowInCaseSection, colLg: 11 },
                                ]}
                                externalUpdate={externalUpdate}
                            />
                        ) : (
                            <LoadingMessage selectedProject={selectedProject} />
                        )}
                    </Col>
                </Row>
            )}
            <Row className="d-flex justify-content-end">Tabela zadań będzie tu dodana w przyszłości.</Row>
        </Container>
    );
}

function LoadingMessage({ selectedProject }: { selectedProject: ProjectData | undefined }) {
    return (
        <>
            <p> Ładuję zadania dla projektu:</p>
            <h3>{selectedProject?._ourId_Alias}</h3>
            <p>{selectedProject?.name}</p>
            <SpinnerBootstrap />
        </>
    );
}

function makeContractTitleLabel(contract: OurContract | OtherContract) {
    const manager = "ourId" in contract ? (contract._manager as PersonData) : undefined;
    const ourId = "ourId" in contract ? contract.ourId : undefined;

    let label = "Umowa: ";
    label += ourId ? `${ourId || ""}` : `${contract._type.name} ${contract.number}`;
    if (contract.alias) label += ` [${contract.alias || ""}] `;
    if (manager) label += ` ${manager.name} ${manager.surname}`;
    return label;
}

function contractNodeEditHandler(node: SectionNode<Task>) {
    console.log("contractNodeEditHandler", node);
    const contract = {
        ...(node.dataItem as OurContract | OtherContract),
    };
    node.titleLabel = makeContractTitleLabel(contract);
}

function milestoneNodeEditHandler(node: SectionNode<Task>) {
    console.log("milestoneNodeEditHandler", node);
    const milestone = {
        ...(node.dataItem as MilestoneData),
    };
    node.titleLabel = makeMilestoneTitleLabel(milestone);
}

function makeMilestoneTitleLabel(milestone: MilestoneData) {
    const dates: string = milestone._dates
        .map((d) => {
            const startDate = d.startDate ? d.startDate.toString().split("T")[0] : "⚠️ brak daty";
            const endDate = d.endDate ? d.endDate.toString().split("T")[0] : "⚠️ brak daty";
            return `[${startDate} - ${endDate}]`;
        })
        .join(", ");
    const uniqueicon = getSymbolByUniqueness(milestone._type.isUniquePerContract);
    return `Kamień: ${milestone._type._folderNumber} ${milestone._type.name} ${
        milestone.name || ""
    } ${dates} ${uniqueicon}`;
}

function makeCaseTitleLabel(caseItem: Case) {
    const uniqueicon = getSymbolByUniqueness(caseItem._type.isUniquePerMilestone);
    return `Sprawa: ${caseItem._typeFolderNumber_TypeName_Number_Name || ""} ${uniqueicon}`;
}

function buildTree(contractsWithChildrenInput: ContractsWithChildren[]): SectionNode<Task>[] {
    const contractNodes: SectionNode<Task>[] = [];

    for (const { contract, milestonesWithCases } of contractsWithChildrenInput) {
        const contractNode: SectionNode<Task> = {
            id: "contract" + contract.id,
            isInAccordion: true,
            level: 1,
            type: "contract",
            childrenNodesType: "milestone",
            repository: contractsRepository,
            dataItem: contract,
            titleLabel: makeContractTitleLabel(contract),
            children: [] as SectionNode<Task>[],
            AddNewButtonComponent: MilestoneAddNewModalButton as unknown as ComponentType<
                SpecificAddNewModalButtonProps<RepositoryDataItem>
            >,
            EditButtonComponent: ContractEditModalButton as unknown as ComponentType<
                SpecificEditModalButtonProps<RepositoryDataItem>
            >,
            editHandler: contractNodeEditHandler,
            isDeletable: false,
        };
        contractNodes.push(contractNode);

        for (const { milestone, casesWithTasks } of milestonesWithCases || []) {
            const milestoneNode = {
                id: "milestone" + milestone.id,
                isInAccordion: true,
                level: 2,
                type: "milestone",
                childrenNodesType: "case",
                repository: milestonesRepository, // Dostosuj do Twojego repozytorium kamieni milowych
                dataItem: milestone,
                titleLabel: makeMilestoneTitleLabel(milestone), // Dostosuj do Twojej metody
                children: [] as SectionNode<Task>[],
                AddNewButtonComponent: CaseAddNewModalButton as unknown as ComponentType<
                    SpecificAddNewModalButtonProps<RepositoryDataItem>
                >,
                EditButtonComponent: MilestoneEditModalButton as unknown as ComponentType<
                    SpecificEditModalButtonProps<RepositoryDataItem>
                >,
                editHandler: milestoneNodeEditHandler,
                isDeletable: true,
            };
            contractNode.children.push(milestoneNode);

            for (const { caseItem, tasks } of casesWithTasks || []) {
                const caseNode = {
                    id: "case" + caseItem.id,
                    level: 3,
                    type: "case",
                    repository: casesRepository,
                    dataItem: caseItem,
                    titleLabel: makeCaseTitleLabel(caseItem),
                    children: [],
                    leaves: [] as Task[],
                    isDeletable: true,
                    AddNewButtonComponent: TaskAddNewModalButton as unknown as ComponentType<
                        SpecificAddNewModalButtonProps<RepositoryDataItem>
                    >, // Dostosuj do Twojego komponentu
                    EditButtonComponent: CaseEditModalButton as unknown as ComponentType<
                        SpecificEditModalButtonProps<RepositoryDataItem>
                    >, // Dostosuj do Twojego komponentu
                    editHandler: (node: SectionNode<Task>) => {
                        node.titleLabel = makeCaseTitleLabel(node.dataItem as Case);
                    }, // Dostosuj do Twojej metody
                };
                milestoneNode.children.push(caseNode);

                for (const task of tasks || []) {
                    if (!caseNode.leaves) caseNode.leaves = [];
                    caseNode.leaves.push(task);
                }
                tasksGlobalRepository.items = [...tasksGlobalRepository.items, ...caseNode.leaves];
            }
        }
    }
    console.log("contractNodes", contractNodes);
    return contractNodes;
}
