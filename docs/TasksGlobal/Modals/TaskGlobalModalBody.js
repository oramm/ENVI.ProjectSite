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
exports.TaskGlobalModalBody = void 0;
const react_1 = __importStar(require("react"));
const TaskModalBody_1 = require("../../Contracts/ContractsList/ContractDetails/Tasks/Modals/TaskModalBody");
const MainSetupReact_1 = __importDefault(require("../../React/MainSetupReact"));
const FormContext_1 = require("../../View/Modals/FormContext");
function TaskGlobalModalBody({ isEditing, initialData }) {
    const { register, reset, setValue, watch, formState: { dirtyFields, errors, isValid }, trigger } = (0, FormContext_1.useFormContext)();
    const _contract = watch('_contract');
    const _case = watch('_case');
    (0, react_1.useEffect)(() => {
        console.log('TaskModalBody useEffect', initialData);
        const resetData = {
            _contract: initialData?._contract,
            name: initialData?.name,
            description: initialData?.description || '',
            deadline: initialData?.deadline || new Date().toISOString().slice(0, 10),
            daysToPay: initialData?.daysToPay,
            status: initialData?.status || MainSetupReact_1.default.TaskStatuses.BACKLOG,
            _owner: initialData?._owner || MainSetupReact_1.default.getCurrentUserAsPerson(),
        };
        reset(resetData);
        trigger();
    }, [initialData, reset]);
    return (react_1.default.createElement(react_1.default.Fragment, null,
        !isEditing &&
            react_1.default.createElement(react_1.default.Fragment, null),
        react_1.default.createElement(TaskModalBody_1.TaskModalBody, { isEditing: isEditing, initialData: initialData })));
}
exports.TaskGlobalModalBody = TaskGlobalModalBody;
