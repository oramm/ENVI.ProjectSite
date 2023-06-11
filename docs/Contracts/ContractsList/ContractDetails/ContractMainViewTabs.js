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
exports.ContractMainViewTabs = void 0;
const react_1 = __importStar(require("react"));
const react_bootstrap_1 = require("react-bootstrap");
const ContractContext_1 = require("../ContractContext");
const ContractsController_1 = require("../ContractsController");
const ContractDetails_1 = __importDefault(require("./ContractDetails"));
const ContractMainHeader_1 = require("./ContractMainHeader");
const Tasks_1 = __importDefault(require("./Tasks/Tasks"));
function ContractMainViewTabs() {
    const [contract, setContract] = (0, react_1.useState)(ContractsController_1.contractsRepository.currentItems[0] || ContractsController_1.contractsRepository.getItemFromRouter());
    const [miletonesTypes, setMiletonesTypes] = (0, react_1.useState)(undefined);
    const [caseTypes, setCaseTypes] = (0, react_1.useState)(undefined);
    const [milestones, setMilestones] = (0, react_1.useState)(undefined);
    const [cases, setCases] = (0, react_1.useState)(undefined);
    const [tasks, setTasks] = (0, react_1.useState)(undefined);
    (0, react_1.useEffect)(() => {
        async function fetchData() {
            const contractIdFormData = new FormData();
            contractIdFormData.append('contractId', contract.id.toString());
            const fetchMilestonesTypes = ContractsController_1.milestoneTypesRepository.loadItemsFromServer(contractIdFormData);
            const fetchCaseTypes = ContractsController_1.caseTypesRepository.loadItemsFromServer(contractIdFormData);
            const fetchMilestones = ContractsController_1.milestonesRepository.loadItemsFromServer(contractIdFormData);
            const fetchCases = ContractsController_1.casesRepository.loadItemsFromServer(contractIdFormData);
            const fetchTasks = ContractsController_1.tasksRepository.loadItemsFromServer(contractIdFormData);
            try {
                const [milestonesTypesData, caseTypesData, milestonesData, casesData, tasksData] = await Promise.all([
                    fetchMilestonesTypes,
                    fetchCaseTypes,
                    fetchMilestones,
                    fetchCases,
                    fetchTasks
                ]);
                setMiletonesTypes(milestonesTypesData);
                setCaseTypes(caseTypesData);
                setMilestones(milestonesData);
                setCases(casesData);
                setTasks(tasksData);
            }
            catch (error) {
                console.error("Error fetching data", error);
                // Handle error as you see fit
            }
        }
        ;
        fetchData();
    }, []);
    return (react_1.default.createElement(ContractContext_1.ContractProvider, { contract: contract, setContract: setContract, caseTypes: caseTypes, setCaseTypes: setCaseTypes, miletonesTypes: miletonesTypes, setMiletonesTypes: setMiletonesTypes, milestones: milestones, setMilestones: setMilestones, cases: cases, setCases: setCases, tasks: tasks, setTasks: setTasks },
        react_1.default.createElement(react_1.default.Fragment, null,
            react_1.default.createElement(ContractMainHeader_1.MainContractDetailsHeader, null),
            react_1.default.createElement(react_bootstrap_1.Tabs, { defaultActiveKey: "general", id: "uncontrolled-tab-example" },
                react_1.default.createElement(react_bootstrap_1.Tab, { eventKey: "general", title: "Dane og\u00F3lne" },
                    react_1.default.createElement(ContractDetails_1.default, null)),
                react_1.default.createElement(react_bootstrap_1.Tab, { eventKey: "tasks", title: "Zadania" },
                    react_1.default.createElement(Tasks_1.default, null))))));
}
exports.ContractMainViewTabs = ContractMainViewTabs;
;
