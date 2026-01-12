"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importStar(require("react"));
const react_bootstrap_1 = require("react-bootstrap");
const react_fontawesome_1 = require("@fortawesome/react-fontawesome");
const free_solid_svg_icons_1 = require("@fortawesome/free-solid-svg-icons");
const ContractContext_1 = require("../Contracts/ContractsList/ContractContext");
const ContractsController_1 = require("../Contracts/ContractsList/ContractsController");
const CommonComponents_1 = require("../View/Resultsets/CommonComponents");
const FilterableTable_1 = __importDefault(require("../View/Resultsets/FilterableTable/FilterableTable"));
const Symbols_1 = require("../View/Symbols");
const CaseModalButtons_1 = require("./Modals/Case/CaseModalButtons");
const ContractModalButtons_1 = require("./Modals/ContractModalButtons");
const MilestoneModalButtons_1 = require("./Modals/Milestone/MilestoneModalButtons");
const ProjectModalButtons_1 = require("./Modals/ProjectModalButtons");
const TasksGlobalModalButtons_1 = require("./Modals/TasksGlobalModalButtons");
const ProjectsFilterBody_1 = require("./ProjectsFilterBody");
const TasksGlobalController_1 = require("./TasksGlobalController");
const TasksGlobalFilterBody_1 = require("./TasksGlobalFilterBody");
require("./TasksGlobal.css");
const ToolsDate_1 = __importDefault(require("../React/Tools/ToolsDate"));
function TasksGlobal() {
    //const [tasks, setTasks] = useState([] as Task[] | undefined); //undefined żeby pasowało do typu danych w ContractProvider
    const [contractsWithChildren, setContractsWithCildren] = (0, react_1.useState)([]);
    const [externalUpdate, setExternalUpdate] = (0, react_1.useState)(0);
    const [dataLoaded, setDataLoaded] = (0, react_1.useState)(true);
    const [selectedProject, setSelectedProject] = (0, react_1.useState)(undefined);
    (0, react_1.useEffect)(() => {
        if (!selectedProject)
            return;
        async function fetchData() {
            setDataLoaded(false);
            const [contractsWithChildren] = await Promise.all([
                TasksGlobalController_1.contractsWithChildrenRepository.loadItemsFromServerPOST([
                    {
                        _project: selectedProject,
                        statusType: "active",
                    },
                ]),
                ContractsController_1.caseTypesRepository.loadItemsFromServerPOST(),
                ContractsController_1.milestoneTypesRepository.loadItemsFromServerPOST(),
            ]);
            setContractsWithCildren(contractsWithChildren);
            setExternalUpdate((prevState) => prevState + 1);
            setDataLoaded(true);
        }
        fetchData();
    }, [selectedProject]);
    function makeTaskParentsLabel(task) {
        const _contract = task._parent._parent._contract;
        const _milestone = task._parent._parent;
        const _case = task._parent;
        const ourId = "ourId" in _contract ? _contract.ourId : undefined;
        return (`${ourId || ""} ${_contract.alias || ""} ${_contract.number || ""} | ` +
            `${_milestone._FolderNumber_TypeName_Name || ""} |` +
            `${_case._type.name || ""} | ${_case.name || ""}`);
    }
    function renderTaskRowInCaseSection(task) {
        return (react_1.default.createElement(react_bootstrap_1.Row, null,
            react_1.default.createElement(react_bootstrap_1.Col, { md: 5 },
                task.name,
                react_1.default.createElement("br", null),
                task.description && react_1.default.createElement("span", { className: "text-secondary small" }, task.description)),
            react_1.default.createElement(react_bootstrap_1.Col, { md: 2 },
                task.deadline && `${task.deadline}`,
                " "),
            react_1.default.createElement(react_bootstrap_1.Col, { md: 2 },
                react_1.default.createElement(CommonComponents_1.TaskStatusBadge, { status: task.status })),
            react_1.default.createElement(react_bootstrap_1.Col, { md: 3 }, task._owner && `${task._owner.name} ${task._owner.surname}`)));
    }
    async function handleSubmitTasksSections(criteria) {
        if (!selectedProject)
            return buildTree(contractsWithChildren);
        const [filteredContractsWithChildren] = await Promise.all([
            TasksGlobalController_1.contractsWithChildrenRepository.loadItemsFromServerPOST([
                {
                    ...criteria,
                    _project: selectedProject,
                    statusType: criteria.statuses?.length ? undefined : "active",
                },
            ]),
        ]);
        return buildTree(filteredContractsWithChildren);
    }
    function handleResetTasksSections() {
        return buildTree(contractsWithChildren);
    }
    return (react_1.default.createElement(ContractContext_1.ContractProvider, { project: selectedProject },
        react_1.default.createElement(react_bootstrap_1.Card, null,
            react_1.default.createElement(react_bootstrap_1.Row, null,
                react_1.default.createElement(react_bootstrap_1.Col, { md: "3" },
                    react_1.default.createElement(FilterableTable_1.default, { id: "projects", title: "Projekty", repository: TasksGlobalController_1.projectsRepository, showTableHeader: false, AddNewButtonComponents: [ProjectModalButtons_1.ProjectAddNewModalButton], FilterBodyComponent: ProjectsFilterBody_1.ProjectsFilterBody, EditButtonComponent: ProjectModalButtons_1.ProjectEditModalButton, tableStructure: [
                            {
                                header: "Nazwa",
                                renderTdBody: (project) => react_1.default.createElement(react_1.default.Fragment, null, project._ourId_Alias),
                                colLg: 11,
                            },
                        ], onRowClick: setSelectedProject })),
                react_1.default.createElement(react_bootstrap_1.Col, { md: "9" }, !selectedProject ? (react_1.default.createElement(NoProjectSelectedMessage, null)) : !dataLoaded ? (react_1.default.createElement(LoadingMessage, { selectedProject: selectedProject })) : (react_1.default.createElement(FilterableTable_1.default, { id: "tasks", title: "Zadania", showTableHeader: false, repository: TasksGlobalController_1.tasksGlobalRepository, FilterBodyComponent: TasksGlobalFilterBody_1.TasksGlobalFilterBody, EditButtonComponent: TasksGlobalModalButtons_1.TaskEditModalButton, initialSections: buildTree(contractsWithChildren), snapshotMode: "criteria-only", sectionsFilterHandlers: {
                        onSubmitSections: handleSubmitTasksSections,
                        onResetSections: handleResetTasksSections,
                    }, tableStructure: [
                        { header: "Zadania", renderTdBody: renderTaskRowInCaseSection, colLg: 11 },
                    ], externalUpdate: externalUpdate })))))));
}
exports.default = TasksGlobal;
function NoProjectSelectedMessage() {
    return (react_1.default.createElement(react_1.default.Fragment, null,
        react_1.default.createElement("h3", null, "Wybierz projekt"),
        react_1.default.createElement("p", { className: "text-muted" }, "Kliknij na projekt z listy po lewej stronie, aby zobaczy\u0107 zadania.")));
}
function LoadingMessage({ selectedProject }) {
    return (react_1.default.createElement(react_1.default.Fragment, null,
        react_1.default.createElement("p", null, " \u0141aduj\u0119 zadania dla projektu:"),
        react_1.default.createElement("h3", null, selectedProject?._ourId_Alias),
        react_1.default.createElement("p", null, selectedProject?.name),
        react_1.default.createElement(CommonComponents_1.SpinnerBootstrap, null)));
}
function truncateText(text, maxLength) {
    if (!text)
        return "";
    return text.length > maxLength ? text.substring(0, maxLength) + "..." : text;
}
function makeOurContractTitleHeader(contract) {
    const contractName = truncateText(contract.name, 200);
    const hasAlias = !!contract.alias;
    const hasDates = contract.startDate || contract.endDate;
    const manager = contract._manager;
    return (react_1.default.createElement("div", { className: "d-flex flex-column gap-1" },
        react_1.default.createElement("div", { className: "d-flex align-items-center gap-2 mb-1" },
            react_1.default.createElement("span", { className: "contract-id" },
                contract.ourId,
                hasAlias && ` | ${contract.alias}`),
            react_1.default.createElement(CommonComponents_1.ContractStatusBadge, { status: contract.status, className: "contract-status-badge" })),
        react_1.default.createElement("h6", { className: "contract-title mb-1" }, contractName),
        react_1.default.createElement("div", { className: "contract-metadata d-flex flex-wrap gap-4 align-items-center" },
            hasDates && (react_1.default.createElement("div", { className: "d-flex align-items-center gap-2" },
                react_1.default.createElement(react_fontawesome_1.FontAwesomeIcon, { icon: free_solid_svg_icons_1.faCalendarAlt, className: "contract-metadata-icon" }),
                react_1.default.createElement("span", null,
                    contract.startDate ? ToolsDate_1.default.dateYMDtoDMY(contract.startDate) : "?",
                    " \u2014",
                    " ",
                    contract.endDate ? ToolsDate_1.default.dateYMDtoDMY(contract.endDate) : "?"))),
            manager && (react_1.default.createElement("div", { className: "d-flex align-items-center gap-2" },
                react_1.default.createElement(react_fontawesome_1.FontAwesomeIcon, { icon: free_solid_svg_icons_1.faUser, className: "contract-metadata-icon" }),
                react_1.default.createElement("span", null,
                    manager.name,
                    " ",
                    manager.surname))))));
}
function makeOtherContractTitleHeader(contract) {
    const ourRelatedId = contract._ourContract ? contract._ourContract.ourId : "Brak powiązania";
    const identifier = `${contract._type.name} ${contract.number} => ${ourRelatedId}`;
    const contractName = truncateText(contract.name, 200);
    const hasAlias = !!contract.alias;
    const contractors = contract._contractors;
    const hasContractors = contractors && contractors.length > 0;
    const hasDates = contract.startDate || contract.endDate;
    const manager = contract._ourContract?._manager;
    return (react_1.default.createElement("div", { className: "d-flex flex-column gap-1" },
        react_1.default.createElement("div", { className: "d-flex align-items-center gap-2 mb-1" },
            react_1.default.createElement("span", { className: "contract-id" },
                identifier,
                hasAlias && ` | ${contract.alias}`),
            react_1.default.createElement(CommonComponents_1.ContractStatusBadge, { status: contract.status, className: "contract-status-badge" })),
        react_1.default.createElement("h6", { className: "contract-title mb-1" }, contractName),
        hasContractors && (react_1.default.createElement("div", { className: "d-flex align-items-center gap-2 mb-2" },
            react_1.default.createElement("span", { className: "contract-contractors" }, contractors.map((c) => c.name).join(", ")))),
        react_1.default.createElement("div", { className: "contract-metadata d-flex flex-wrap gap-4 align-items-center" },
            hasDates && (react_1.default.createElement("div", { className: "d-flex align-items-center gap-2" },
                react_1.default.createElement(react_fontawesome_1.FontAwesomeIcon, { icon: free_solid_svg_icons_1.faCalendarAlt, className: "contract-metadata-icon" }),
                react_1.default.createElement("span", null,
                    contract.startDate ? ToolsDate_1.default.dateYMDtoDMY(contract.startDate) : "?",
                    " \u2014",
                    " ",
                    contract.endDate ? ToolsDate_1.default.dateYMDtoDMY(contract.endDate) : "?"))),
            manager && (react_1.default.createElement("div", { className: "d-flex align-items-center gap-2" },
                react_1.default.createElement(react_fontawesome_1.FontAwesomeIcon, { icon: free_solid_svg_icons_1.faUser, className: "contract-metadata-icon" }),
                react_1.default.createElement("span", null,
                    "Koordynator:",
                    " ",
                    react_1.default.createElement("strong", null,
                        manager.name,
                        " ",
                        manager.surname)))))));
}
function makeContractTitleHeader(contract) {
    const isOurContract = "ourId" in contract;
    return isOurContract
        ? makeOurContractTitleHeader(contract)
        : makeOtherContractTitleHeader(contract);
}
function contractNodeEditHandler(node) {
    console.log("contractNodeEditHandler", node);
    const contract = {
        ...node.dataItem,
    };
    node.title = makeContractTitleHeader(contract);
}
function milestoneNodeEditHandler(node) {
    console.log("milestoneNodeEditHandler", node);
    const milestone = {
        ...node.dataItem,
    };
    node.title = react_1.default.createElement(react_1.default.Fragment, null, makeMilestoneTitleLabel(milestone));
}
function makeMilestoneTitleLabel(milestone) {
    const uniqueicon = (0, Symbols_1.getSymbolByUniqueness)(milestone._type.isUniquePerContract);
    const titleText = `Kamień: ${uniqueicon} ${milestone._type._folderNumber} ${milestone._type.name} ${milestone.name || ""}`;
    return (react_1.default.createElement("div", { className: "d-flex gap-3 align-items-center justify-content-between" },
        react_1.default.createElement("div", { className: "d-flex flex-column gap-1" },
            react_1.default.createElement("span", null, titleText),
            milestone._dates && milestone._dates.length > 0 && (react_1.default.createElement("div", { className: "d-flex align-items-center gap-2 text-secondary small", style: { lineHeight: "1" } },
                react_1.default.createElement(react_fontawesome_1.FontAwesomeIcon, { icon: free_solid_svg_icons_1.faCalendarAlt, className: "text-muted" }),
                milestone._dates.map((d, index) => {
                    const startDate = d.startDate ? d.startDate.toString().split("T")[0] : "⚠️ brak daty";
                    const endDate = d.endDate ? d.endDate.toString().split("T")[0] : "⚠️ brak daty";
                    return (react_1.default.createElement("span", { key: index },
                        startDate,
                        " - ",
                        endDate));
                })))),
        react_1.default.createElement("div", null, milestone.status && react_1.default.createElement(CommonComponents_1.MilestoneStatusBadge, { status: milestone.status }))));
}
function makeCaseTitleLabel(caseItem) {
    const uniqueicon = (0, Symbols_1.getSymbolByUniqueness)(caseItem._type.isUniquePerMilestone);
    return `Sprawa: ${uniqueicon} ${caseItem._typeFolderNumber_TypeName_Number_Name || ""}`;
}
function buildTree(contractsWithChildrenInput) {
    const contractNodes = [];
    const allTasks = [];
    for (const { contract, milestonesWithCases } of contractsWithChildrenInput) {
        const isOurContract = "ourId" in contract;
        const borderColor = isOurContract ? "var(--section-border-our)" : "var(--section-border-other)";
        const contractNode = {
            id: "contract" + contract.id,
            isInAccordion: true,
            borderColor: borderColor,
            level: 1,
            type: "contract",
            childrenNodesType: "milestone",
            selectedObjectRoute: "/contract/",
            repository: TasksGlobalController_1.contractsRepository,
            dataItem: contract,
            title: makeContractTitleHeader(contract),
            children: [],
            AddNewButtonComponent: MilestoneModalButtons_1.MilestoneAddNewModalButton,
            EditButtonComponent: ContractModalButtons_1.ContractEditModalButton,
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
                repository: TasksGlobalController_1.milestonesRepository,
                dataItem: milestone,
                title: react_1.default.createElement(react_1.default.Fragment, null, makeMilestoneTitleLabel(milestone)),
                children: [],
                AddNewButtonComponent: CaseModalButtons_1.CaseAddNewModalButton,
                EditButtonComponent: MilestoneModalButtons_1.MilestoneEditModalButton,
                editHandler: milestoneNodeEditHandler,
                isDeletable: true,
            };
            contractNode.children.push(milestoneNode);
            for (const { caseItem, tasks } of casesWithTasks || []) {
                const caseNode = {
                    id: "case" + caseItem.id,
                    level: 3,
                    type: "case",
                    repository: TasksGlobalController_1.casesRepository,
                    dataItem: caseItem,
                    title: react_1.default.createElement(react_1.default.Fragment, null, makeCaseTitleLabel(caseItem)),
                    children: [],
                    leaves: [],
                    isDeletable: true,
                    AddNewButtonComponent: TasksGlobalModalButtons_1.TaskAddNewModalButton,
                    EditButtonComponent: CaseModalButtons_1.CaseEditModalButton,
                    editHandler: (node) => {
                        node.title = react_1.default.createElement(react_1.default.Fragment, null, makeCaseTitleLabel(node.dataItem));
                    }, // Dostosuj do Twojej metody
                };
                milestoneNode.children.push(caseNode);
                for (const task of tasks || []) {
                    if (!caseNode.leaves)
                        caseNode.leaves = [];
                    caseNode.leaves.push(task);
                }
                allTasks.push(...(caseNode.leaves || []));
            }
        }
    }
    TasksGlobalController_1.tasksGlobalRepository.items = allTasks;
    console.log("contractNodes", contractNodes);
    return contractNodes;
}
