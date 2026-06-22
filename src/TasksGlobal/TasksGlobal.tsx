import { faCalendarAlt, faSitemap, faUser } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { ComponentType, useEffect, useState } from "react";
import { Col, Card as Container, Row } from "react-bootstrap";
import { FieldValues } from "react-hook-form";
import {
    Case,
    MilestoneData,
    OtherContract,
    OurContract,
    ProjectData,
    RepositoryDataItem,
    Task,
} from "../../Typings/bussinesTypes";
import { ContractProvider } from "../Contracts/ContractsList/ContractContext";
import { caseTypesRepository, milestoneTypesRepository } from "../Contracts/ContractsList/ContractsController";
import ToolsDate from "../React/Tools/ToolsDate";
import { SpecificAddNewModalButtonProps, SpecificEditModalButtonProps } from "../View/Modals/ModalsTypes";
import {
    ContractStatusBadge,
    MilestoneStatusBadge,
    SpinnerBootstrap,
    TaskStatusBadge,
} from "../View/Resultsets/CommonComponents";
import FilterableTable from "../View/Resultsets/FilterableTable/FilterableTable";
import { SectionNode } from "../View/Resultsets/FilterableTable/Section";
import { UniquenessIcon } from "../View/Modals/CommonFormComponents/BussinesObjectSelectors";
import { CaseAddNewModalButton, CaseAndSubCaseAddButtonGroup, CaseEditModalButton } from "./Modals/Case/CaseModalButtons";
import { ContractEditModalButton } from "./Modals/ContractModalButtons";
import { MilestoneAddNewModalButton, MilestoneEditModalButton } from "./Modals/Milestone/MilestoneModalButtons";
import { ProjectAddNewModalButton, ProjectEditModalButton } from "./Modals/ProjectModalButtons";
import { TaskAddNewModalButton, TaskEditModalButton } from "./Modals/TasksGlobalModalButtons";
import { ProjectsFilterBody } from "./ProjectsFilterBody";
import "./TasksGlobal.css";
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
            <Row className="task-leaf-row align-items-center g-1">
                <Col md={5}>
                    <span className="task-name">{task.name}</span>
                    {task.description && (
                        <span className="d-block text-secondary task-description">{task.description}</span>
                    )}
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

function truncateText(text: string | undefined, maxLength: number): string {
    if (!text) return "";
    return text.length > maxLength ? text.substring(0, maxLength) + "..." : text;
}

function makeOurContractTitleHeader(contract: OurContract) {
    const contractName = truncateText(contract.name, 200);
    const hasAlias = !!contract.alias;
    const hasDates = contract.startDate || contract.endDate;
    const manager = contract._manager;

    return (
        <div className="d-flex flex-column gap-2">
            {/* Linia #1: ID + Status Badge */}
            <div className="d-flex align-items-center gap-2">
                <span className="contract-id">
                    {contract.ourId}
                    {hasAlias && ` | ${contract.alias}`}
                </span>
                <ContractStatusBadge status={contract.status} className="contract-status-badge" />
            </div>

            {/* Linia #2: Nazwa kontraktu (tytuł główny) */}
            <h6 className="contract-title">{contractName}</h6>

            {/* Linia #3: Daty + Koordynator */}
            <div className="contract-metadata d-flex flex-wrap gap-4 align-items-center">
                {hasDates && (
                    <div className="d-flex align-items-center gap-2">
                        <FontAwesomeIcon icon={faCalendarAlt} className="contract-metadata-icon" />
                        <span>
                            {contract.startDate ? ToolsDate.dateYMDtoDMY(contract.startDate) : "?"} —{" "}
                            {contract.endDate ? ToolsDate.dateYMDtoDMY(contract.endDate) : "?"}
                        </span>
                    </div>
                )}
                {manager && (
                    <div className="d-flex align-items-center gap-2">
                        <FontAwesomeIcon icon={faUser} className="contract-metadata-icon" />
                        <span>
                            {manager.name} {manager.surname}
                        </span>
                    </div>
                )}
            </div>
        </div>
    );
}

function makeOtherContractTitleHeader(contract: OtherContract) {
    const ourRelatedId = contract._ourContract ? contract._ourContract.ourId : "Brak powiązania";
    const identifier = `${contract._type.name} ${contract.number} ➔ ${ourRelatedId}`; // NO alias — alias lives in the hero
    const contractName = truncateText(contract.name, 200);
    const contractorNames = (contract._contractors ?? []).map((c) => c.name);
    const heroParts = [contract.alias, ...contractorNames].filter(Boolean);
    const hasAnchor = heroParts.length > 0;
    // Hero z jasnym, cienkim separatorem „·" (jak na zatwierdzonej makiecie B2-a):
    // separator ma być delikatny i NIE dziedziczyć pogrubienia hero, aby wizualnie
    // oddzielać alias od wykonawcy. Fallback (brak kotwicy) => sama nazwa kontraktu.
    const heroNodes: React.ReactNode = hasAnchor
        ? heroParts.flatMap((part, idx) =>
              idx === 0
                  ? [<React.Fragment key={`p${idx}`}>{part}</React.Fragment>]
                  : [
                        <span key={`s${idx}`} className="contract-hero-sep">
                            {" · "}
                        </span>,
                        <React.Fragment key={`p${idx}`}>{part}</React.Fragment>,
                    ],
          )
        : contractName;
    const hasDates = contract.startDate || contract.endDate;

    const manager = contract._ourContract?._manager;

    return (
        <div className="d-flex flex-column gap-2">
            {/* L1 — HERO: alias · wykonawca (kotwica pamięciowa) + status inline.
                Status zostaje w lewym bloku (NIE justify-content-between), aby na
                stanie ACTIVE nie kolidował z menu akcji po prawej. */}
            <div className="d-flex align-items-center flex-wrap gap-2">
                <span className="contract-hero">{heroNodes}</span>
                <ContractStatusBadge status={contract.status} className="contract-status-badge" />
            </div>

            {/* L2 — identyfikator (bez aliasu — alias jest w hero) */}
            <span className="contract-id">{identifier}</span>

            {/* L3 — zdegradowana nazwa kontraktu (drugi plan).
                Renderowana tylko gdy hero jest kotwicą — w fallbacku hero = nazwa,
                więc pominięcie unika duplikatu. */}
            {hasAnchor && <div className="contract-name-demoted">{contractName}</div>}

            {/* L4 — Daty + Koordynator (bez zmian) */}
            <div className="contract-metadata d-flex flex-wrap gap-4 align-items-center">
                {hasDates && (
                    <div className="d-flex align-items-center gap-2">
                        <FontAwesomeIcon icon={faCalendarAlt} className="contract-metadata-icon" />
                        <span>
                            {contract.startDate ? ToolsDate.dateYMDtoDMY(contract.startDate) : "?"} —{" "}
                            {contract.endDate ? ToolsDate.dateYMDtoDMY(contract.endDate) : "?"}
                        </span>
                    </div>
                )}
                {manager && (
                    <div className="d-flex align-items-center gap-2">
                        <FontAwesomeIcon icon={faUser} className="contract-metadata-icon" />
                        <span>
                            {manager.name} {manager.surname}
                        </span>
                    </div>
                )}
            </div>
        </div>
    );
}

function makeContractTitleHeader(contract: OurContract | OtherContract) {
    const isOurContract = "ourId" in contract;
    return isOurContract
        ? makeOurContractTitleHeader(contract as OurContract)
        : makeOtherContractTitleHeader(contract as OtherContract);
}

function contractNodeEditHandler(node: SectionNode<Task>) {
    console.log("contractNodeEditHandler", node);
    const contract = {
        ...(node.dataItem as OurContract | OtherContract),
    };
    node.title = makeContractTitleHeader(contract);
}

function milestoneNodeEditHandler(node: SectionNode<Task>) {
    console.log("milestoneNodeEditHandler", node);
    const milestone = {
        ...(node.dataItem as MilestoneData),
    };
    node.title = <>{makeMilestoneTitleLabel(milestone)}</>;
}

function makeMilestoneTitleLabel(milestone: MilestoneData) {
    const titleText = `Kamień: ${milestone._type._folderNumber} ${milestone._type.name} ${
        milestone.name || ""
    }`;

    return (
        <div className="d-flex gap-3 align-items-center justify-content-between">
            <div className="d-flex flex-column gap-1">
                <span>
                    {titleText}
                    <UniquenessIcon isUnique={milestone._type.isUniquePerContract} />
                </span>
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
            <div>{milestone.status && <MilestoneStatusBadge status={milestone.status} />}</div>
        </div>
    );
}

function makeCaseTitleLabel(caseItem: Case) {
    const isParentCase = Boolean(caseItem._type.allowsSubCases) && !caseItem.parentCaseId;
    return (
        <>
            {`Sprawa: ${caseItem._typeFolderNumber_TypeName_Number_Name || ""}`}
            <UniquenessIcon isUnique={caseItem._type.isUniquePerMilestone} />
            {isParentCase && (
                <FontAwesomeIcon
                    icon={faSitemap}
                    className="ms-1 text-primary"
                    size="sm"
                    title="Sprawa może mieć podsprawy"
                />
            )}
        </>
    );
}

function buildTree(contractsWithChildrenInput: ContractsWithChildren[]): SectionNode<Task>[] {
    const contractNodes: SectionNode<Task>[] = [];
    const allTasks: Task[] = [];

    for (const { contract, milestonesWithCases } of contractsWithChildrenInput) {
        const isOurContract = "ourId" in contract;
        const borderColor = isOurContract ? "var(--section-border-our)" : "var(--section-border-other)";

        const contractNode: SectionNode<Task> = {
            id: "contract" + contract.id,
            isInAccordion: true,
            borderColor: borderColor,
            level: 1,
            type: "contract",
            childrenNodesType: "milestone",
            selectedObjectRoute: "/contract/",
            repository: contractsRepository,
            dataItem: contract,
            title: makeContractTitleHeader(contract),
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

            for (const { caseItem, tasks, subCasesWithTasks } of casesWithTasks || []) {
                const allowsSubCases = Boolean(caseItem._type.allowsSubCases);
                const caseTasks = tasks ?? [];
                const caseNode = {
                    id: "case" + caseItem.id,
                    level: 3,
                    type: "case",
                    repository: casesRepository,
                    dataItem: caseItem,
                    title: <>{makeCaseTitleLabel(caseItem)}</>,
                    children: [] as SectionNode<Task>[],
                    leaves: caseTasks.length > 0 ? caseTasks : [],
                    isDeletable: true,
                    AddNewButtonComponent: (allowsSubCases
                        ? CaseAndSubCaseAddButtonGroup
                        : TaskAddNewModalButton) as unknown as ComponentType<
                        SpecificAddNewModalButtonProps<RepositoryDataItem>
                    >,
                    EditButtonComponent: CaseEditModalButton as unknown as ComponentType<
                        SpecificEditModalButtonProps<RepositoryDataItem>
                    >,
                    editHandler: (node: SectionNode<Task>) => {
                        node.title = <>{makeCaseTitleLabel(node.dataItem as Case)}</>;
                    },
                };
                milestoneNode.children.push(caseNode);
                allTasks.push(...caseTasks);

                if (allowsSubCases) {
                    for (const { caseItem: subCase, tasks: subTasks } of subCasesWithTasks || []) {
                        const subCaseTasks = subTasks ?? [];
                        const subCaseNode = {
                            id: "subcase" + subCase.id,
                            level: 4,
                            type: "subcase",
                            repository: casesRepository,
                            dataItem: subCase,
                            title: <>{makeCaseTitleLabel(subCase)}</>,
                            children: [] as SectionNode<Task>[],
                            leaves: subCaseTasks as Task[],
                            isDeletable: true,
                            AddNewButtonComponent: TaskAddNewModalButton as unknown as ComponentType<
                                SpecificAddNewModalButtonProps<RepositoryDataItem>
                            >,
                            EditButtonComponent: CaseEditModalButton as unknown as ComponentType<
                                SpecificEditModalButtonProps<RepositoryDataItem>
                            >,
                            editHandler: (node: SectionNode<Task>) => {
                                node.title = <>{makeCaseTitleLabel(node.dataItem as Case)}</>;
                            },
                        };
                        caseNode.children.push(subCaseNode);
                        allTasks.push(...subCaseTasks);
                    }
                }
            }
        }
    }
    tasksGlobalRepository.items = allTasks;
    console.log("contractNodes", contractNodes);
    return contractNodes;
}
