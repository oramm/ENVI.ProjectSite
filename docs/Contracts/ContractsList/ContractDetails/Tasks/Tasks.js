"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importDefault(require("react"));
const react_bootstrap_1 = require("react-bootstrap");
const ToolsDate_1 = __importDefault(require("../../../../React/ToolsDate"));
const CommonComponents_1 = require("../../../../View/Resultsets/CommonComponents");
const FilterableTable_1 = __importDefault(require("../../../../View/Resultsets/FilterableTable/FilterableTable"));
const ContractContext_1 = require("../../ContractContext");
const ContractsController_1 = require("../../ContractsController");
const TaskModalButtons_1 = require("./Modals/TaskModalButtons");
const TasksFilterBody_1 = require("./TasksFilterBody");
function Tasks() {
    const { contract, caseTypes, miletonesTypes, milestones, cases, tasks, } = (0, ContractContext_1.useContract)();
    if (!contract) {
        return react_1.default.createElement("div", null,
            "\u0141aduj\u0119 dane... ",
            react_1.default.createElement(CommonComponents_1.SpinnerBootstrap, null),
            " ");
    }
    return (react_1.default.createElement(react_bootstrap_1.Card, null,
        react_1.default.createElement(react_bootstrap_1.Card.Body, null,
            tasks ?
                react_1.default.createElement(FilterableTable_1.default, { id: 'tasks', title: 'Zadania', initialObjects: tasks, repository: ContractsController_1.tasksRepository, AddNewButtonComponents: [TaskModalButtons_1.TaskAddNewModalButton], FilterBodyComponent: TasksFilterBody_1.TasksFilterBody, EditButtonComponent: TaskModalButtons_1.TaskEditModalButton, tableStructure: [
                        { header: 'Nazwa', objectAttributeToShow: 'name' },
                        { header: 'Opis', objectAttributeToShow: 'description' },
                        { header: 'Termin', objectAttributeToShow: 'deadline' },
                        { header: 'Status', renderTdBody: (task) => react_1.default.createElement(CommonComponents_1.TaskStatusBadge, { status: task.status }) },
                        { header: 'Właściciel', renderTdBody: (task) => react_1.default.createElement(react_1.default.Fragment, null, `${task._owner.name} ${task._owner.surname}`) },
                    ] })
                : react_1.default.createElement(react_1.default.Fragment, null,
                    "\"\u0141adowanie zada\u0144...\" ",
                    react_1.default.createElement(CommonComponents_1.SpinnerBootstrap, null)),
            react_1.default.createElement("p", { className: 'tekst-muted small' },
                "Koordynator(ka): ",
                `${contract._manager.name} ${contract._manager.surname}`,
                react_1.default.createElement("br", null),
                "Aktualizacja: ",
                ToolsDate_1.default.timestampToString(contract._lastUpdated)))));
}
exports.default = Tasks;
