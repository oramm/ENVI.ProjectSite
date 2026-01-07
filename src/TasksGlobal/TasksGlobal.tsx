import React, { ComponentType, useEffect, useState } from "react";
import { Col, Card as Container, Row } from "react-bootstrap";
import { FieldValues } from "react-hook-form";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCalendarAlt, faUser } from "@fortawesome/free-solid-svg-icons";
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
import { ContractProvider } from "../Contracts/ContractsList/ContractContext";
import { caseTypesRepository, milestoneTypesRepository } from "../Contracts/ContractsList/ContractsController";
import { SpecificAddNewModalButtonProps, SpecificEditModalButtonProps } from "../View/Modals/ModalsTypes";
import {
    ContractStatusBadge,
    MilestoneStatusBadge,
    SpinnerBootstrap,
    TaskStatusBadge,
} from "../View/Resultsets/CommonComponents";
import FilterableTable from "../View/Resultsets/FilterableTable/FilterableTable";
import { SectionNode } from "../View/Resultsets/FilterableTable/Section";
import { getSymbolByUniqueness } from "../View/Symbols";
import { CaseAddNewModalButton, CaseEditModalButton } from "./Modals/Case/CaseModalButtons";
import { ContractEditModalButton } from "./Modals/ContractModalButtons";
import { MilestoneAddNewModalButton, MilestoneEditModalButton } from "./Modals/Milestone/MilestoneModalButtons";
import { ProjectAddNewModalButton, ProjectEditModalButton } from "./Modals/ProjectModalButtons";
import { TaskAddNewModalButton, TaskEditModalButton } from "./Modals/TasksGlobalModalButtons";
import { ProjectsFilterBody } from "./ProjectsFilterBody";
import {
    casesRepository,
    contractsRepository,
    contractsWithChildrenRepository,
    milestonesRepository,
    projectsRepository,
    tasksGlobalRepository,
} from "./TasksGlobalController";
import { TasksGlobalFilterBody } from "./TasksGlobalFilterBody";
import { ContractsWithChildren } from "./TasksGlobalTypes";

export default function TasksGlobal() {
    //const [tasks, setTasks] = useState([] as Task[] | undefined); //undefined żeby pasowało do typu danych w ContractProvider
    const [contractsWithChildren, setContractsWithCildren] = useState([] as ContractsWithChildren[]);
    const [externalUpdate, setExternalUpdate] = useState(0);
    const [dataLoaded, setDataLoaded] = useState(true);
    const [selectedProject, setSelectedProject] = useState<ProjectData | undefined>(undefined);

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

    async function handleSubmitTasksSections(criteria: FieldValues): Promise<SectionNode<Task>[]> {
        if (!selectedProject) return buildTree(contractsWithChildren);
        const [filteredContractsWithChildren] = await Promise.all([
            contractsWithChildrenRepository.loadItemsFromServerPOST([
                {
                    ...criteria,
                    _project: selectedProject,
                    statusType: criteria.statuses?.length ? undefined : "active",
                },
            ]),
        ]);

        return buildTree(filteredContractsWithChildren as ContractsWithChildren[]);
    }

    function handleResetTasksSections(): SectionNode<Task>[] {
        return buildTree(contractsWithChildren);
    }

    return (
        <ContractProvider project={selectedProject}>
            <Container>
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
                        {!selectedProject ? (
                            <NoProjectSelectedMessage />
                        ) : !dataLoaded ? (
                            <LoadingMessage selectedProject={selectedProject} />
                        ) : (
                            <FilterableTable<Task>
                                id="tasks"
                                title="Zadania"
                                showTableHeader={false}
                                repository={tasksGlobalRepository}
                                FilterBodyComponent={TasksGlobalFilterBody}
                                EditButtonComponent={TaskEditModalButton}
                                initialSections={buildTree(contractsWithChildren)}
                                snapshotMode="criteria-only"
                                sectionsFilterHandlers={{
                                    onSubmitSections: handleSubmitTasksSections,
                                    onResetSections: handleResetTasksSections,
                                }}
                                tableStructure={[
                                    { header: "Zadania", renderTdBody: renderTaskRowInCaseSection, colLg: 11 },
                                ]}
                                externalUpdate={externalUpdate}
                            />
                        )}
                    </Col>
                </Row>
            </Container>
        </ContractProvider>
    );
}

function NoProjectSelectedMessage() {
    return (
        <>
            <h3>Wybierz projekt</h3>
            <p className="text-muted">Kliknij na projekt z listy po lewej stronie, aby zobaczyć zadania.</p>
        </>
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

    const identifier = ourId ? `${ourId || ""}` : `${contract._type.name} ${contract.number}`;

    return (
        <div className="d-flex flex-column gap-2 py-1">
            <div className="d-flex align-items-center gap-3 flex-wrap">
                <span className="mb-0 text-success">Umowa: {identifier}</span>
                {contract.alias && <span className="text-muted">{contract.alias}</span>}
                <span className="small" style={{ fontSize: "0.9rem" }}>
                    <ContractStatusBadge status={contract.status} />
                </span>
            </div>
            <div className="d-flex gap-4 align-items-center text-secondary" style={{ fontSize: "0.9rem" }}>
                {contract.endDate && (
                    <div className="d-flex align-items-center gap-2">
                        <FontAwesomeIcon icon={faCalendarAlt} className="text-muted" />
                        <span>
                            Termin do: <strong className="text-dark">{contract.endDate}</strong>
                        </span>
                    </div>
                )}
                {contract.endDate && manager && (
                    <div className="border-start border-secondary" style={{ height: "1.2em" }}></div>
                )}
                {manager && (
                    <div className="d-flex align-items-center gap-2">
                        <FontAwesomeIcon icon={faUser} className="text-muted" />
                        <span>
                            Koordynator:{" "}
                            <strong className="text-dark">
                                {manager.name} {manager.surname}
                            </strong>
                        </span>
                    </div>
                )}
            </div>
        </div>
    );
}

function contractNodeEditHandler(node: SectionNode<Task>) {
    console.log("contractNodeEditHandler", node);
    const contract = {
        ...(node.dataItem as OurContract | OtherContract),
    };
    node.title = makeContractTitleLabel(contract);
}

function milestoneNodeEditHandler(node: SectionNode<Task>) {
    console.log("milestoneNodeEditHandler", node);
    const milestone = {
        ...(node.dataItem as MilestoneData),
    };
    node.title = <>{makeMilestoneTitleLabel(milestone)}</>;
}

function makeMilestoneTitleLabel(milestone: MilestoneData) {
    const uniqueicon = getSymbolByUniqueness(milestone._type.isUniquePerContract);
    const titleText = `Kamień: ${milestone._type._folderNumber} ${milestone._type.name} ${milestone.name || ""}`;

    return (
        <div className="d-flex flex-column gap-1">
            <div className="d-flex align-items-center gap-2 flex-wrap">
                <span>
                    {titleText} {uniqueicon}
                </span>
                {milestone.status && <MilestoneStatusBadge status={milestone.status} />}
            </div>
            {milestone._dates && milestone._dates.length > 0 && (
                <div className="d-flex align-items-center gap-2 text-secondary small" style={{ lineHeight: "1" }}>
                    <FontAwesomeIcon icon={faCalendarAlt} className="text-muted" />
                    {milestone._dates.map((d, index) => {
                        const startDate = d.startDate ? d.startDate.toString().split("T")[0] : "⚠️ brak daty";
                        const endDate = d.endDate ? d.endDate.toString().split("T")[0] : "⚠️ brak daty";
                        return (
                            <span key={index}>
                                {startDate} - {endDate}
                            </span>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

function makeCaseTitleLabel(caseItem: Case) {
    const uniqueicon = getSymbolByUniqueness(caseItem._type.isUniquePerMilestone);
    return `Sprawa: ${caseItem._typeFolderNumber_TypeName_Number_Name || ""} ${uniqueicon}`;
}

function buildTree(contractsWithChildrenInput: ContractsWithChildren[]): SectionNode<Task>[] {
    const contractNodes: SectionNode<Task>[] = [];
    const allTasks: Task[] = [];

    for (const { contract, milestonesWithCases } of contractsWithChildrenInput) {
        const contractNode: SectionNode<Task> = {
            id: "contract" + contract.id,
            isInAccordion: true,
            level: 1,
            type: "contract",
            childrenNodesType: "milestone",
            selectedObjectRoute: "/contract/",
            repository: contractsRepository,
            dataItem: contract,
            title: makeContractTitleLabel(contract),
            children: [] as SectionNode<Task>[],
            AddNewButtonComponent: MilestoneAddNewModalButton as unknown as ComponentType<
                SpecificAddNewModalButtonProps<RepositoryDataItem>
            >,
            EditButtonComponent: ContractEditModalButton as unknown as ComponentType<
                SpecificEditModalButtonProps<RepositoryDataItem>
            >,
            editHandler: contractNodeEditHandler,
            shouldRetrieveDataBeforeEdit: true,
            specialRetrieveActionRoute: "contracts",
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
                title: <>{makeMilestoneTitleLabel(milestone)}</>, // Dostosuj do Twojej metody
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
                    title: <>{makeCaseTitleLabel(caseItem)}</>,
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
                        node.title = <>{makeCaseTitleLabel(node.dataItem as Case)}</>;
                    }, // Dostosuj do Twojej metody
                };
                milestoneNode.children.push(caseNode);

                for (const task of tasks || []) {
                    if (!caseNode.leaves) caseNode.leaves = [];
                    caseNode.leaves.push(task);
                }
                allTasks.push(...(caseNode.leaves || []));
            }
        }
    }
    tasksGlobalRepository.items = allTasks;
    console.log("contractNodes", contractNodes);
    return contractNodes;
}
