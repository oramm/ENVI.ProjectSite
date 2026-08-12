import { faCalendarAlt, faFolderOpen, faSitemap, faUser } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { ComponentType, useEffect, useMemo, useRef, useState } from "react";
import { Col, Container, Row } from "react-bootstrap";
import { FieldValues } from "react-hook-form";
import {
    Case,
    CaseType,
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
import ToolsDate from "../React/Tools/ToolsDate";
import RepositoryReact from "../React/RepositoryReact";
import ScrumTaskRow from "../Scrumboard/CurrentSprint/ScrumTaskRow";
import { SpecificAddNewModalButtonProps, SpecificEditModalButtonProps } from "../View/Modals/ModalsTypes";
import { ContractStatusBadge, SpinnerBootstrap } from "../View/Resultsets/CommonComponents";
import FilterableTable from "../View/Resultsets/FilterableTable/FilterableTable";
import { SectionNode } from "../View/Resultsets/FilterableTable/Section";
import { UniquenessIcon } from "../View/Modals/CommonFormComponents/BussinesObjectSelectors";
import { DEFAULT_CASE_STATUS_FILTER } from "../View/Modals/CommonFormComponents/CaseStatusFilter";
import {
    CaseAddNewInTypeFolderButton,
    CaseAddNewModalButton,
    CaseAndSubCaseAddButtonGroup,
    CaseEditModalButton,
} from "./Modals/Case/CaseModalButtons";
import { ContractEditModalButton } from "./Modals/ContractModalButtons";
import { CaseListSheetButton } from "./Modals/CaseListSheetButton";
import { MilestoneAddNewModalButton, MilestoneEditModalButton } from "./Modals/Milestone/MilestoneModalButtons";
import { ProjectAddNewModalButton, ProjectEditModalButton } from "./Modals/ProjectModalButtons";
import { ProjectCaseListSheetButton, ProjectTaskOwnersContext } from "./Modals/ProjectCaseListSheetButton";
import { TaskAddNewModalButton, TaskEditModalButton } from "./Modals/TasksGlobalModalButtons";
import CaseInlineStatusDropdown from "./CaseInlineStatusDropdown";
import MilestoneInlineStatusDropdown from "./MilestoneInlineStatusDropdown";
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
    const [scrollTrigger, setScrollTrigger] = useState(0);
    const pendingScrollIdRef = useRef<string | null>(null);
    const filterVersionRef = useRef(0);

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

    // Osoby do okna „Spis spraw" projektu — z pełnego (nieprzefiltrowanego) drzewa
    // wybranego projektu, więc filtr „osoba = X" nie okroi listy do jednej osoby.
    const projectTaskOwners = useMemo(
        () => ({
            projectId: selectedProject?.id,
            owners: collectTaskOwners(contractsWithChildren.flatMap((c) => c.milestonesWithCases || [])),
        }),
        [contractsWithChildren, selectedProject?.id]
    );

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


    useEffect(() => {
        if (!pendingScrollIdRef.current) return;
        const targetId = pendingScrollIdRef.current;
        const timeoutId = setTimeout(() => {
            const el = document.getElementById(targetId);
            if (el) {
                const navbarHeight = document.querySelector("nav.sticky-top")?.getBoundingClientRect().height ?? 0;
                const y = el.getBoundingClientRect().top + window.scrollY - navbarHeight - 8;
                window.scrollTo({ top: y, behavior: "smooth" });
                el.classList.remove("section-scroll-highlight");
                void el.offsetWidth; // force reflow so animation restarts if triggered twice
                el.classList.add("section-scroll-highlight");
                el.addEventListener("animationend", () => el.classList.remove("section-scroll-highlight"), { once: true });
            }
            pendingScrollIdRef.current = null;
        }, 100);
        return () => clearTimeout(timeoutId);
    }, [scrollTrigger]);

    async function handleSubmitTasksSections(criteria: FieldValues): Promise<SectionNode<Task>[]> {
        if (!selectedProject) return buildTree(contractsWithChildren, undefined, undefined, { caseStatuses: DEFAULT_CASE_STATUS_FILTER });

        const targetCaseId = (criteria._case as Case | undefined)?.id;
        // _case, caseStatuses i taskStatuses są obsługiwane wyłącznie frontendowo
        // (collapse/scroll, filtr drzewa) — nie trafiają do backendu
        const { _case: _unused, caseStatuses: caseStatusesRaw, taskStatuses: taskStatusesRaw, ...backendCriteria } =
            criteria;
        // Pusty wybór ⇒ powrót do domyślnego filtra (Na zaś + W trakcie), a nie "pokaż wszystko"
        const caseStatuses = (caseStatusesRaw as string[] | undefined)?.length
            ? (caseStatusesRaw as string[])
            : DEFAULT_CASE_STATUS_FILTER;
        // Domyślnie wszystkie statusy zadań — pusty/pełny wybór ⇒ brak filtrowania zadań
        const taskStatuses = (taskStatusesRaw as string[] | undefined)?.length
            ? (taskStatusesRaw as string[])
            : undefined;

        const [filteredContractsWithChildren] = await Promise.all([
            contractsWithChildrenRepository.loadItemsFromServerPOST([
                {
                    ...backendCriteria,
                    _project: selectedProject,
                    statusType: backendCriteria.statuses?.length ? undefined : "active",
                },
            ]),
        ]);

        let version: number | undefined;
        if (targetCaseId) {
            version = ++filterVersionRef.current;
            pendingScrollIdRef.current = `case${targetCaseId}_v${version}`;
            setScrollTrigger((t) => t + 1);
        }

        return buildTree(filteredContractsWithChildren as ContractsWithChildren[], targetCaseId, version, {
            caseStatuses,
            taskStatuses,
            // Lista osób w oknie "Spis spraw" musi pochodzić z pełnego drzewa projektu:
            // po filtrze "osoba = X" przefiltrowane drzewo zna już tylko tę jedną osobę.
            taskOwnersSource: contractsWithChildren,
        });
    }

    function handleResetTasksSections(): SectionNode<Task>[] {
        return buildTree(contractsWithChildren, undefined, undefined, { caseStatuses: DEFAULT_CASE_STATUS_FILTER });
    }

    return (
        <ContractProvider project={selectedProject}>
            <Container fluid>
                <Row>
                    <Col md="3">
                        <ProjectTaskOwnersContext.Provider value={projectTaskOwners}>
                            <FilterableTable<ProjectData>
                                id="projects"
                                title="Projekty"
                                repository={projectsRepository}
                                showTableHeader={false}
                                AddNewButtonComponents={[ProjectAddNewModalButton]}
                                FilterBodyComponent={ProjectsFilterBody}
                                EditButtonComponent={ProjectEditModalButton}
                                RowActionMenuComponents={projectRowActionMenuComponents}
                                tableStructure={[
                                    {
                                        header: "Nazwa",
                                        renderTdBody: (project: ProjectData) => <>{project._ourId_Alias}</>,
                                        colLg: 11,
                                    },
                                ]}
                                onRowClick={setSelectedProject}
                            />
                        </ProjectTaskOwnersContext.Provider>
                    </Col>
                    <Col md="9">
                        {!selectedProject ? (
                            <NoProjectSelectedMessage />
                        ) : !dataLoaded ? (
                            <LoadingMessage selectedProject={selectedProject} />
                        ) : (
                            <FilterableTable<Task>
                                id={`tasks_${selectedProject.id}`}
                                title="Zadania"
                                showTableHeader={false}
                                repository={tasksGlobalRepository}
                                FilterBodyComponent={TasksGlobalFilterBody}
                                EditButtonComponent={TaskEditModalButton}
                                initialSections={buildTree(contractsWithChildren, undefined, undefined, {
                                    caseStatuses: DEFAULT_CASE_STATUS_FILTER,
                                })}
                                snapshotMode="criteria-only"
                                sectionsFilterHandlers={{
                                    onSubmitSections: handleSubmitTasksSections,
                                    onResetSections: handleResetTasksSections,
                                }}
                                tableStructure={[
                                    {
                                        header: "Zadania",
                                        renderTdBody: (task: Task, isActive?: boolean) => (
                                            <ScrumTaskRow task={task} isActive={isActive} />
                                        ),
                                        colLg: 11,
                                    },
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
    // filter(Boolean): kamienie-koszyki (Oferty/Sprawy ogólne) nie mają typu — pomijamy puste człony,
    // żeby nie wyświetlać "undefined". Dla normalnych kamieni wynik jest identyczny.
    const titleText = `Kamień: ${[milestone._type._folderNumber, milestone._type.name, milestone.name]
        .filter(Boolean)
        .join(" ")}`;

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
            <div>{milestone.status && <MilestoneInlineStatusDropdown milestone={milestone} />}</div>
        </div>
    );
}

function makeCaseTitleLabel(caseItem: Case, isInTypeFolder = false) {
    const isParentCase = Boolean(caseItem._type._allowsSubCases) && !caseItem.parentCaseId;
    // W folderze typu nazwa typu jest już w nagłówku folderu — pokazujemy tylko numer i nazwę sprawy
    const label = isInTypeFolder
        ? `${caseItem._displayNumber || ""} ${caseItem.name || ""}`.trim()
        : `Sprawa: ${caseItem._typeFolderNumber_TypeName_Number_Name || ""}`;
    return (
        <div className="d-flex gap-3 align-items-center justify-content-between">
            <span>
                {label}
                <UniquenessIcon isUnique={caseItem._type.isUniquePerMilestone} />
                {isParentCase && (
                    <FontAwesomeIcon
                        icon={faSitemap}
                        className="ms-1 text-primary"
                        size="sm"
                        title="Sprawa może mieć podsprawy"
                    />
                )}
            </span>
            <div>{caseItem.status && <CaseInlineStatusDropdown caseItem={caseItem} />}</div>
        </div>
    );
}

function makeCaseTypeTitleLabel(caseType: CaseType) {
    return (
        <>
            <FontAwesomeIcon icon={faFolderOpen} className="me-2 text-warning" />
            {`${caseType.folderNumber} ${caseType.name}`}
        </>
    );
}

/** true jeśli węzeł lub którekolwiek dziecko ma przypisane zadania (leaves) */
function nodeHasTasks(node: SectionNode<Task>): boolean {
    if (node.leaves && node.leaves.length > 0) return true;
    return (node.children || []).some(nodeHasTasks);
}

/** Ustawia initialExpanded=false na gałęziach bez zadań (rekurencyjnie) */
function collapseEmptyBranches(node: SectionNode<Task>) {
    if (!nodeHasTasks(node)) node.initialExpanded = false;
    (node.children || []).forEach(collapseEmptyBranches);
}

/**
 * true jeśli sprawa spełnia filtr statusów. `caseStatuses` pominięty ⇒ brak filtrowania.
 * Sprawy bez statusu (dane sprzed migracji) są zawsze pokazywane.
 * Sprawa wskazana do nawigacji (`targetCaseId`) jest zawsze widoczna — inaczej wybór
 * zamkniętej sprawy w selektorze skutkowałby cichą nieudaną nawigacją.
 */
function caseMatchesStatusFilter(caseItem: Case, caseStatuses?: string[], targetCaseId?: number): boolean {
    if (targetCaseId !== undefined && caseItem.id === targetCaseId) return true;
    if (!caseStatuses) return true;
    if (!caseItem.status) return true;
    return caseStatuses.includes(caseItem.status);
}

/**
 * true jeśli zadanie spełnia filtr statusów. `taskStatuses` pominięty ⇒ brak filtrowania.
 * Zadania bez statusu są zawsze pokazywane.
 */
function taskMatchesStatusFilter(task: Task, taskStatuses?: string[]): boolean {
    if (!taskStatuses) return true;
    if (!task.status) return true;
    return taskStatuses.includes(task.status);
}

// Stałe tablice: nowa przy każdym renderze przerysowywałaby akcje wiersza bez powodu.
const contractRowActionMenuComponents = [CaseListSheetButton];
const projectRowActionMenuComponents = [ProjectCaseListSheetButton];

/**
 * Właściciele zadań w kontrakcie — lista osób w oknie "Spis spraw". Liczona z drzewa,
 * żeby nie dało się wybrać osoby, dla której spis i tak byłby pusty.
 */
function collectTaskOwners(milestonesWithCases: ContractsWithChildren["milestonesWithCases"]) {
    const ownersById = new Map<number, PersonData>();
    for (const { casesWithTasks } of milestonesWithCases || [])
        for (const caseWithTasks of casesWithTasks || []) {
            const taskGroups = [
                caseWithTasks.tasks,
                ...(caseWithTasks.subCasesWithTasks || []).map((s) => s.tasks),
            ];
            for (const tasks of taskGroups)
                for (const task of tasks || [])
                    if (task._owner?.id) ownersById.set(task._owner.id, task._owner);
        }
    return [...ownersById.values()].sort((a, b) =>
        `${a.surname} ${a.name}`.localeCompare(`${b.surname} ${b.name}`, "pl")
    );
}

export function buildTree(
    contractsWithChildrenInput: ContractsWithChildren[],
    targetCaseId?: number,
    version?: number,
    options?: {
        collapseEmpty?: boolean;
        leavesRepository?: RepositoryReact<Task>;
        caseStatuses?: string[];
        taskStatuses?: string[];
        /** Pełne (nieprzefiltrowane) drzewo — źródło listy osób dla okna "Spis spraw".
         *  Pominięte ⇒ osoby liczone z drzewa budowanego. */
        taskOwnersSource?: ContractsWithChildren[];
    }
): SectionNode<Task>[] {
    const caseStatuses = options?.caseStatuses;
    const taskStatuses = options?.taskStatuses;
    const sfx = version !== undefined ? `_v${version}` : "";
    const contractNodes: SectionNode<Task>[] = [];
    const allTasks: Task[] = [];

    for (const { contract, milestonesWithCases } of contractsWithChildrenInput) {
        const isOurContract = "ourId" in contract;
        const borderColor = isOurContract ? "var(--section-border-our)" : "var(--section-border-other)";

        const contractNode: SectionNode<Task> = {
            id: "contract" + contract.id + sfx,
            isInAccordion: true,
            initialExpanded: true,
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
            rowActionMenuComponents: contractRowActionMenuComponents,
        };
        const ownersSource =
            options?.taskOwnersSource?.find((c) => c.contract.id === contract.id)
                ?.milestonesWithCases ?? milestonesWithCases;
        (contract as RepositoryDataItem)._taskOwners = collectTaskOwners(ownersSource);
        contractNodes.push(contractNode);

        for (const { milestone, casesWithTasks } of milestonesWithCases || []) {
            const milestoneContainsTarget =
                !targetCaseId ||
                (casesWithTasks || []).some(
                    ({ caseItem, subCasesWithTasks }) =>
                        caseItem.id === targetCaseId ||
                        (subCasesWithTasks || []).some(({ caseItem: sc }) => sc.id === targetCaseId),
                );

            const milestoneNode = {
                id: "milestone" + milestone.id + sfx,
                isInAccordion: true,
                initialExpanded: milestoneContainsTarget,
                level: 2,
                type: "milestone",
                childrenNodesType: "case",
                repository: milestonesRepository,
                dataItem: milestone,
                title: <>{makeMilestoneTitleLabel(milestone)}</>,
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

            const allCasesWithTasks = casesWithTasks || [];

            const addCaseNode = (
                caseItem: Case,
                tasks: Task[],
                subCasesWithTasks: { caseItem: Case; tasks: Task[] }[] | undefined,
                level: number,
                parentNode: SectionNode<Task>,
                isInTypeFolder = false
            ) => {
                const canHaveSubCases = Boolean(caseItem._type._allowsSubCases);
                const caseTasks = (tasks ?? []).filter((t) => taskMatchesStatusFilter(t, taskStatuses));
                const caseNode = {
                    id: "case" + caseItem.id + sfx,
                    level,
                    type: "case",
                    repository: casesRepository,
                    dataItem: caseItem,
                    title: <>{makeCaseTitleLabel(caseItem, isInTypeFolder)}</>,
                    children: [] as SectionNode<Task>[],
                    leaves: caseTasks.length > 0 ? caseTasks : [],
                    isDeletable: true,
                    AddNewButtonComponent: (canHaveSubCases
                        ? CaseAndSubCaseAddButtonGroup
                        : TaskAddNewModalButton) as unknown as ComponentType<
                        SpecificAddNewModalButtonProps<RepositoryDataItem>
                    >,
                    EditButtonComponent: CaseEditModalButton as unknown as ComponentType<
                        SpecificEditModalButtonProps<RepositoryDataItem>
                    >,
                    editHandler: (node: SectionNode<Task>) => {
                        node.title = <>{makeCaseTitleLabel(node.dataItem as Case, isInTypeFolder)}</>;
                    },
                };
                parentNode.children.push(caseNode);
                allTasks.push(...caseTasks);

                if (canHaveSubCases) {
                    for (const { caseItem: subCase, tasks: subTasks } of subCasesWithTasks || []) {
                        if (!caseMatchesStatusFilter(subCase, caseStatuses, targetCaseId)) continue;
                        const subCaseTasks = (subTasks ?? []).filter((t) => taskMatchesStatusFilter(t, taskStatuses));
                        const subCaseWithParent = { ...subCase, _parentCase: caseItem };
                        const subCaseNode = {
                            id: "subcase" + subCase.id + sfx,
                            level: level + 1,
                            type: "subcase",
                            repository: casesRepository,
                            dataItem: subCaseWithParent,
                            title: <>{makeCaseTitleLabel(subCase, isInTypeFolder)}</>,
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
                                node.title = <>{makeCaseTitleLabel(node.dataItem as Case, isInTypeFolder)}</>;
                            },
                        };
                        caseNode.children.push(subCaseNode);
                        allTasks.push(...subCaseTasks);
                    }
                }
            };

            // Iterujemy sprawy w oryginalnej kolejności z backendu (wg folderNumber).
            // Sprawy unikatowe trafiają wprost pod kamień (poziom 3); sprawy wielokrotne — do
            // folderu typu tworzonego w miejscu PIERWSZEGO wystąpienia danego typu, dzięki czemu
            // foldery i sprawy unikatowe zachowują wspólną, alfabetyczną kolejność.
            const caseTypeFolderNodes = new Map<number, SectionNode<Task>>();
            for (const { caseItem, tasks, subCasesWithTasks } of allCasesWithTasks) {
                // Rodzica zachowujemy również, gdy sam odpada przez filtr, ale zawiera
                // podsprawę wskazaną do nawigacji — inaczej nawigacja do niej cicho zawiedzie
                // (strażnik podsprawy w addCaseNode i tak przepuści tylko właściwą podsprawę).
                const containsTargetSubCase =
                    targetCaseId !== undefined &&
                    (subCasesWithTasks || []).some(({ caseItem: sc }) => sc.id === targetCaseId);
                if (!containsTargetSubCase && !caseMatchesStatusFilter(caseItem, caseStatuses, targetCaseId))
                    continue;
                if (caseItem._type.isUniquePerMilestone) {
                    addCaseNode(caseItem, tasks, subCasesWithTasks, 3, milestoneNode);
                    continue;
                }

                const typeId = caseItem._type.id;
                let caseTypeNode = caseTypeFolderNodes.get(typeId);
                if (!caseTypeNode) {
                    caseTypeNode = {
                        id: `casetype${milestone.id}_${typeId}${sfx}`,
                        isInAccordion: true,
                        initialExpanded: true,
                        level: 3,
                        type: "casetype",
                        repository: caseTypesRepository,
                        // typ + kamień rodzic — przycisk "Dodaj sprawę" folderu potrzebuje obu
                        dataItem: { ...caseItem._type, _parentMilestone: milestone } as RepositoryDataItem,
                        title: <>{makeCaseTypeTitleLabel(caseItem._type)}</>,
                        children: [],
                        isDeletable: false,
                        AddNewButtonComponent: CaseAddNewInTypeFolderButton as unknown as ComponentType<
                            SpecificAddNewModalButtonProps<RepositoryDataItem>
                        >,
                    };
                    caseTypeFolderNodes.set(typeId, caseTypeNode);
                    milestoneNode.children.push(caseTypeNode);
                }

                addCaseNode(caseItem, tasks, subCasesWithTasks, 4, caseTypeNode, true);
            }
        }
    }
    (options?.leavesRepository ?? tasksGlobalRepository).items = allTasks;
    if (options?.collapseEmpty) contractNodes.forEach(collapseEmptyBranches);
    return contractNodes;
}
