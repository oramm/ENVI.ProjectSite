"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TasksGlobalFilterBody = void 0;
const react_1 = __importDefault(require("react"));
const react_bootstrap_1 = require("react-bootstrap");
const FormContext_1 = require("../View/Modals/FormContext");
const TasksFilterBodyCommonFields_1 = require("../Contracts/ContractsList/ContractDetails/Tasks/TasksFilterBodyCommonFields");
const ContractContext_1 = require("../Contracts/ContractsList/ContractContext");
const CommonFormComponents_1 = require("../View/Modals/CommonFormComponents");
const TasksGlobalController_1 = require("./TasksGlobalController");
function TasksGlobalFilterBody({}) {
    const { register } = (0, FormContext_1.useFormContext)();
    const { project } = (0, ContractContext_1.useContract)();
    return (react_1.default.createElement(react_1.default.Fragment, null,
        react_1.default.createElement(TasksFilterBodyCommonFields_1.TasksFilterBodyCommonFields, null),
        react_1.default.createElement(react_bootstrap_1.Row, { xl: 5, md: 3, xs: 1 }, !project &&
            react_1.default.createElement(react_bootstrap_1.Col, null,
                react_1.default.createElement(CommonFormComponents_1.ProjectSelector, { repository: TasksGlobalController_1.projectsRepository, name: '_project', showValidationInfo: false }),
                react_1.default.createElement(CommonFormComponents_1.ContractSelectFormElement, { repository: TasksGlobalController_1.contractsRepository, showValidationInfo: false, _project: project })))));
}
exports.TasksGlobalFilterBody = TasksGlobalFilterBody;
