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
const CommonComponents_1 = require("../View/Resultsets/CommonComponents");
const FilterableTable_1 = __importDefault(require("../View/Resultsets/FilterableTable/FilterableTable"));
const TasksGlobalController_1 = require("./TasksGlobalController");
const TasksGlobalFilterBody_1 = require("./TasksGlobalFilterBody");
const TasksGlobalModalButtons_1 = require("./Modals/TasksGlobalModalButtons");
const ProjectModalButtons_1 = require("./Modals/ProjectModalButtons");
const ProjectsFilterBody_1 = require("./ProjectsFilterBody");
const react_fontawesome_1 = require("@fortawesome/react-fontawesome");
const free_solid_svg_icons_1 = require("@fortawesome/free-solid-svg-icons");
const CaseModalButtons_1 = require("./Modals/Case/CaseModalButtons");
const ContractModalButtons_1 = require("./Modals/ContractModalButtons");
const ContractsController_1 = require("../Contracts/ContractsList/ContractsController");
function TasksGlobal() {
    //const [tasks, setTasks] = useState([] as Task[] | undefined); //undefined żeby pasowało do typu danych w ContractProvider
    const [contractsWithChildren, setContractsWithCildren] = (0, react_1.useState)([]);
    const [externalUpdate, setExternalUpdate] = (0, react_1.useState)(0);
    const [tasksLoaded, setDataLoaded] = (0, react_1.useState)(true);
    const [selectedProject, setSelectedProject] = (0, react_1.useState)(undefined);
    const [showProjects, setShowProjects] = (0, react_1.useState)(true);
    (0, react_1.useEffect)(() => {
        if (!selectedProject)
            return;
        async function fetchData() {
            setDataLoaded(false);
            const [contractsWithChildren] = await Promise.all([
                TasksGlobalController_1.contractsWithChildrenRepository.loadItemsFromServer({
                    _project: JSON.stringify(selectedProject),
                    statusType: 'active',
                }),
                ContractsController_1.caseTypesRepository.loadItemsFromServer(),
                ContractsController_1.milestoneTypesRepository.loadItemsFromServer(),
            ]);
            setContractsWithCildren(contractsWithChildren);
            setExternalUpdate(prevState => prevState + 1);
            setDataLoaded(true);
        }
        ;
        fetchData();
    }, [selectedProject]);
    function handleShowProjects() {
        setShowProjects(!showProjects);
        setContractsWithCildren([]);
        setExternalUpdate(prevState => prevState + 1);
    }
    function makeTaskParentsLabel(task) {
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
            tableStructure.push({ header: 'Kamień|Sprawa', renderTdBody: (task) => react_1.default.createElement(react_1.default.Fragment, null, makeTaskParentsLabel(task)) });
        }
        tableStructure.push({ header: 'Nazwa i opis', renderTdBody: (task) => react_1.default.createElement(react_1.default.Fragment, null,
                task.name,
                react_1.default.createElement("br", null),
                task.description) }, { header: 'Termin', objectAttributeToShow: 'deadline' }, { header: 'Status', renderTdBody: (task) => react_1.default.createElement(CommonComponents_1.TaskStatusBadge, { status: task.status }) }, { header: 'Właściciel', renderTdBody: (task) => react_1.default.createElement(react_1.default.Fragment, null, `${task._owner.name} ${task._owner.surname}`) });
        return tableStructure;
    }
    return (react_1.default.createElement(react_bootstrap_1.Card, null,
        react_1.default.createElement(react_bootstrap_1.Row, null,
            showProjects &&
                react_1.default.createElement(react_bootstrap_1.Col, { md: 3 },
                    react_1.default.createElement(FilterableTable_1.default, { id: 'projects', title: 'Projekty', repository: TasksGlobalController_1.projectsRepository, AddNewButtonComponents: [ProjectModalButtons_1.ProjectAddNewModalButton], FilterBodyComponent: ProjectsFilterBody_1.ProjectsFilterBody, EditButtonComponent: ProjectModalButtons_1.ProjectEditModalButton, tableStructure: [
                            { header: 'Nazwa', renderTdBody: (project) => react_1.default.createElement(react_1.default.Fragment, null, project._ourId_Alias) },
                        ], onRowClick: setSelectedProject })),
            react_1.default.createElement(react_bootstrap_1.Col, { md: showProjects ? '9' : '12' },
                react_1.default.createElement("div", { className: "d-flex justify-content-end" },
                    react_1.default.createElement("div", { onClick: handleShowProjects },
                        react_1.default.createElement(react_fontawesome_1.FontAwesomeIcon, { icon: showProjects ? free_solid_svg_icons_1.faTimes : free_solid_svg_icons_1.faBars }))),
                tasksLoaded ?
                    react_1.default.createElement(FilterableTable_1.default, { id: 'tasks', title: 'Zadania', showTableHeader: false, repository: TasksGlobalController_1.tasksRepository, FilterBodyComponent: !showProjects ? TasksGlobalFilterBody_1.TasksGlobalFilterBody : undefined, EditButtonComponent: TasksGlobalModalButtons_1.TaskEditModalButton, initialSections: buildTree(contractsWithChildren), tableStructure: makeTasksTableStructure(), externalUpdate: externalUpdate })
                    :
                        react_1.default.createElement(LoadingMessage, { selectedProject: selectedProject })))));
}
exports.default = TasksGlobal;
function LoadingMessage({ selectedProject }) {
    return (react_1.default.createElement(react_1.default.Fragment, null,
        react_1.default.createElement("p", null, " \u0141aduj\u0119 zadania dla projektu:"),
        react_1.default.createElement("h3", null, selectedProject?._ourId_Alias),
        react_1.default.createElement("p", null, selectedProject?.name),
        react_1.default.createElement(CommonComponents_1.SpinnerBootstrap, null)));
}
function makeContractTitleLabel(contract) {
    const manager = contract._manager;
    let label = 'K: ';
    label += contract.ourId ? `${contract.ourId || ''}` : `${contract._type.name} ${contract.number}`;
    if (contract.alias)
        label += ` [${contract.alias || ''}] `;
    if (manager)
        label += ` ${manager.name} ${manager.surname}`;
    return label;
}
function contractNodeEditHandler(node) {
    const contract = node.dataItem;
    node.titleLabel = makeContractTitleLabel(contract);
}
function makeMilestoneTitleLabel(milestone) {
    return `M: ${milestone._type._folderNumber} ${milestone._type.name} ${milestone.name || ''}`;
}
function makeCaseTitleLabel(caseItem) {
    return `${caseItem._typeFolderNumber_TypeName_Number_Name || ''}`;
}
function buildTree(contractsWithChildrenInput) {
    const contractNodes = [];
    for (const { contract, milestonesWithCases: milestonesWitchCases } of contractsWithChildrenInput) {
        const contractNode = {
            id: 'contract' + contract.id,
            isInAccordion: true,
            level: 1,
            type: 'contract',
            childrenNodesType: 'milestone',
            repository: TasksGlobalController_1.contractsRepository,
            dataItem: contract,
            titleLabel: makeContractTitleLabel(contract),
            children: [],
            EditButtonComponent: ContractModalButtons_1.ContractEditModalButton,
            editHandler: contractNodeEditHandler,
            isDeletable: false,
        };
        contractNodes.push(contractNode);
        for (const { milestone, casesWithTasks } of milestonesWitchCases || []) {
            const milestoneNode = {
                id: 'milestone' + milestone.id,
                isInAccordion: true,
                level: 2,
                type: 'milestone',
                childrenNodesType: 'case',
                repository: TasksGlobalController_1.milestonesRepository,
                dataItem: milestone,
                titleLabel: makeMilestoneTitleLabel(milestone),
                children: [],
                AddNewButtonComponent: CaseModalButtons_1.CaseAddNewModalButton,
                isDeletable: true,
            };
            contractNode.children.push(milestoneNode);
            for (const { caseItem, tasks } of casesWithTasks || []) {
                const caseNode = {
                    id: 'case' + caseItem.id,
                    level: 3,
                    type: 'case',
                    repository: TasksGlobalController_1.casesRepository,
                    dataItem: caseItem,
                    titleLabel: makeCaseTitleLabel(caseItem),
                    children: [],
                    leaves: [],
                    isDeletable: true,
                    AddNewButtonComponent: TasksGlobalModalButtons_1.TaskAddNewModalButton,
                    EditButtonComponent: CaseModalButtons_1.CaseEditModalButton,
                    editHandler: (node) => { node.titleLabel = makeCaseTitleLabel(node.dataItem); }, // Dostosuj do Twojej metody
                };
                milestoneNode.children.push(caseNode);
                for (const task of tasks || []) {
                    if (!caseNode.leaves)
                        caseNode.leaves = [];
                    caseNode.leaves.push(task);
                }
                TasksGlobalController_1.tasksRepository.items = [...TasksGlobalController_1.tasksRepository.items, ...caseNode.leaves];
            }
        }
    }
    console.log('contractNodes', contractNodes);
    return contractNodes;
}
