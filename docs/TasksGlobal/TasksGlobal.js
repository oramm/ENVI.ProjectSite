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
const FilterableTable_1 = __importDefault(require("../View/Resultsets/FilterableTable"));
const TasksGlobalController_1 = require("./TasksGlobalController");
const TasksGlobalFilterBody_1 = require("./TasksGlobalFilterBody");
const TasksGlobalModalButtons_1 = require("./TasksGlobalModalButtons");
function TasksGlobal() {
    const [tasks, setTasks] = (0, react_1.useState)([]);
    const [showLeftCol, setShowLeftCol] = (0, react_1.useState)(true);
    const handleToggle = () => {
        setShowLeftCol(!showLeftCol);
    };
    return (react_1.default.createElement(ContractContext_1.ContractProvider, { tasks: tasks, setTasks: setTasks },
        react_1.default.createElement(react_bootstrap_1.Card, null,
            react_1.default.createElement(react_bootstrap_1.Row, null,
                showLeftCol && (react_1.default.createElement(react_bootstrap_1.Col, { md: 3 }, "Projekty")),
                react_1.default.createElement(react_bootstrap_1.Col, { md: showLeftCol ? 9 : 12 }, tasks ?
                    react_1.default.createElement(FilterableTable_1.default, { title: 'Zadania', initialObjects: tasks, repository: TasksGlobalController_1.tasksRepository, AddNewButtonComponents: [TasksGlobalModalButtons_1.TaskAddNewModalButton], FilterBodyComponent: TasksGlobalFilterBody_1.TasksGlobalFilterBody, EditButtonComponent: TasksGlobalModalButtons_1.TaskEditModalButton, tableStructure: [
                            { header: 'Nazwa', objectAttributeToShow: 'name' },
                            { header: 'Opis', objectAttributeToShow: 'description' },
                            { header: 'Termin', objectAttributeToShow: 'deadline' },
                            { header: 'Status', renderTdBody: (task) => react_1.default.createElement(CommonComponents_1.TaskStatusBadge, { status: task.status }) },
                            { header: 'Właściciel', renderTdBody: (task) => react_1.default.createElement(react_1.default.Fragment, null, `${task._owner.name} ${task._owner.surname}`) },
                        ] })
                    : react_1.default.createElement(react_1.default.Fragment, null,
                        "\"\u0141adowanie zada\u0144...\" ",
                        react_1.default.createElement(CommonComponents_1.SpinnerBootstrap, null)))),
            react_1.default.createElement(react_bootstrap_1.Button, { onClick: handleToggle },
                showLeftCol ? 'Ukryj' : 'Pokaż',
                " Projekty"))));
}
exports.default = TasksGlobal;
