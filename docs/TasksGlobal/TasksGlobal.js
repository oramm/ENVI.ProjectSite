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
const ContractContext_1 = require("../Contracts/ContractsList/ContractContext");
const CommonComponents_1 = require("../View/Resultsets/CommonComponents");
const FilterableTable_1 = __importDefault(require("../View/Resultsets/FilterableTable/FilterableTable"));
const TasksGlobalController_1 = require("./TasksGlobalController");
const TasksGlobalFilterBody_1 = require("./TasksGlobalFilterBody");
const TasksGlobalModalButtons_1 = require("./Modals/TasksGlobalModalButtons");
const ProjectModalButtons_1 = require("./Modals/ProjectModalButtons");
const ProjectsFilterBody_1 = require("./ProjectsFilterBody");
const react_fontawesome_1 = require("@fortawesome/react-fontawesome");
const free_solid_svg_icons_1 = require("@fortawesome/free-solid-svg-icons");
function TasksGlobal() {
    const [tasks, setTasks] = (0, react_1.useState)([]); //undefined żeby pasowało do typu danych w ContractProvider
    const [externalTasksUpdate, setExternalTasksUpdate] = (0, react_1.useState)(0);
    const [tasksLoaded, setTasksLoaded] = (0, react_1.useState)(true);
    const [selectedProject, setSelectedProject] = (0, react_1.useState)(undefined);
    const [showProjects, setShowProjects] = (0, react_1.useState)(true);
    (0, react_1.useEffect)(() => {
        if (!selectedProject)
            return;
        async function fetchData() {
            setTasksLoaded(false);
            const [tasks] = await Promise.all([
                TasksGlobalController_1.tasksRepository.loadItemsFromServer({
                    _project: JSON.stringify(selectedProject)
                })
            ]);
            setTasks(tasks);
            setExternalTasksUpdate(prevState => prevState + 1);
            setTasksLoaded(true);
        }
        ;
        fetchData();
    }, [selectedProject]);
    function handleShowProjects() {
        setShowProjects(!showProjects);
        setTasks([]);
        setExternalTasksUpdate(prevState => prevState + 1);
    }
    function makeTaskParentsLabel(task) {
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
            tableStructure.push({ header: 'Kamień|Sprawa', renderTdBody: (task) => react_1.default.createElement(react_1.default.Fragment, null, makeTaskParentsLabel(task)) });
        }
        tableStructure.push({ header: 'Nazwa i opis', renderTdBody: (task) => react_1.default.createElement(react_1.default.Fragment, null,
                task.name,
                react_1.default.createElement("br", null),
                task.description) }, { header: 'Termin', objectAttributeToShow: 'deadline' }, { header: 'Status', renderTdBody: (task) => react_1.default.createElement(CommonComponents_1.TaskStatusBadge, { status: task.status }) }, { header: 'Właściciel', renderTdBody: (task) => react_1.default.createElement(react_1.default.Fragment, null, `${task._owner.name} ${task._owner.surname}`) });
        return tableStructure;
    }
    return (react_1.default.createElement(ContractContext_1.ContractProvider, { tasks: tasks, setTasks: setTasks },
        react_1.default.createElement(react_bootstrap_1.Card, null,
            react_1.default.createElement(react_bootstrap_1.Row, null,
                showProjects &&
                    react_1.default.createElement(react_bootstrap_1.Col, { md: 3 },
                        react_1.default.createElement(FilterableTable_1.default, { title: 'Projekty', repository: TasksGlobalController_1.projectsRepository, AddNewButtonComponents: [ProjectModalButtons_1.ProjectAddNewModalButton], FilterBodyComponent: ProjectsFilterBody_1.ProjectsFilterBody, EditButtonComponent: ProjectModalButtons_1.ProjectEditModalButton, tableStructure: [
                                { header: 'Nazwa', renderTdBody: (project) => react_1.default.createElement(react_1.default.Fragment, null, project._ourId_Alias) },
                            ], onRowClick: setSelectedProject })),
                react_1.default.createElement(react_bootstrap_1.Col, { md: showProjects ? '9' : '12' },
                    react_1.default.createElement("div", { className: "d-flex justify-content-end" },
                        react_1.default.createElement("div", { onClick: handleShowProjects },
                            react_1.default.createElement(react_fontawesome_1.FontAwesomeIcon, { icon: showProjects ? free_solid_svg_icons_1.faTimes : free_solid_svg_icons_1.faBars }))),
                    tasksLoaded ?
                        react_1.default.createElement(FilterableTable_1.default, { title: 'Zadania', showTableHeader: false, initialObjects: tasks, repository: TasksGlobalController_1.tasksRepository, AddNewButtonComponents: [TasksGlobalModalButtons_1.TaskAddNewModalButton], FilterBodyComponent: !showProjects ? TasksGlobalFilterBody_1.TasksGlobalFilterBody : undefined, EditButtonComponent: TasksGlobalModalButtons_1.TaskEditModalButton, sections: buildTree(tasks || []), tableStructure: makeTableStructure(), externalUpdate: externalTasksUpdate })
                        :
                            react_1.default.createElement(react_1.default.Fragment, null,
                                react_1.default.createElement("p", null, "\u0141aduj\u0119 zadania dla projektu:"),
                                react_1.default.createElement("h3", null, selectedProject?._ourId_Alias),
                                react_1.default.createElement("p", null, selectedProject?.name),
                                react_1.default.createElement(CommonComponents_1.SpinnerBootstrap, null)))))));
}
exports.default = TasksGlobal;
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
function buildTree(tasks) {
    const contracts = [];
    for (const task of tasks) {
        const contract = task._parent._parent._parent;
        const milestone = task._parent._parent;
        const caseItem = task._parent;
        let contractNode = contracts.find(c => c.dataItem.id === contract.id);
        if (!contractNode) {
            contractNode = {
                id: contract.id,
                isInAccordion: true,
                level: 1,
                name: 'contract',
                repository: TasksGlobalController_1.contractsRepository,
                dataItem: contract,
                titleLabel: makeContractTitleLabel(contract),
                children: [],
            };
            contracts.push(contractNode);
        }
        let milestoneNode = contractNode.children.find(m => m.id === milestone.id);
        if (!milestoneNode) {
            milestoneNode = {
                id: milestone.id,
                isInAccordion: true,
                level: 2,
                name: 'milestone',
                repository: TasksGlobalController_1.milestonesRepository,
                dataItem: milestone,
                titleLabel: `M: ${milestone._type._folderNumber} ${milestone._type.name} ${milestone.name || ''}`,
                children: [],
            };
            contractNode.children.push(milestoneNode);
        }
        let caseNode = milestoneNode.children.find(c => c.id === caseItem.id);
        if (!caseNode) {
            caseNode = {
                id: caseItem.id,
                level: 3,
                name: 'case',
                repository: TasksGlobalController_1.casesRepository,
                dataItem: caseItem,
                titleLabel: `S: ${caseItem._type.name} ${caseItem.name || ''}`,
                children: [],
                leafs: [],
            };
            milestoneNode.children.push(caseNode);
        }
        if (!caseNode.leafs)
            caseNode.leafs = [];
        caseNode.leafs.push(task);
    }
    return contracts;
}
