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
const react_router_dom_1 = require("react-router-dom");
const CommonComponents_1 = require("../../../View/Resultsets/CommonComponents");
const ContractContext_1 = require("../ContractContext");
const ContractsController_1 = require("../ContractsController");
const ContractMainHeader_1 = require("./ContractMainHeader");
const ContractOtherDetails_1 = __importDefault(require("./ContractOtherDetails"));
const ContractOurDetails_1 = __importDefault(require("./ContractOurDetails"));
const Tasks_1 = __importDefault(require("./Tasks/Tasks"));
function ContractMainViewTabs() {
    const [contract, setContract] = (0, react_1.useState)(ContractsController_1.contractsRepository.currentItems[0]);
    const [miletonesTypes, setMiletonesTypes] = (0, react_1.useState)(undefined);
    const [caseTypes, setCaseTypes] = (0, react_1.useState)(undefined);
    const [milestones, setMilestones] = (0, react_1.useState)(undefined);
    const [cases, setCases] = (0, react_1.useState)(undefined);
    const [tasks, setTasks] = (0, react_1.useState)(undefined);
    let { id } = (0, react_router_dom_1.useParams)();
    (0, react_1.useEffect)(() => {
        async function fetchData() {
            if (!id)
                throw new Error('Nie znaleziono id w adresie url');
            const idNumber = Number(id);
            const params = { contractId: id };
            const fetchContract = contract ? undefined : ContractsController_1.contractsRepository.loadItemFromRouter(idNumber);
            const fetchMilestonesTypes = ContractsController_1.milestoneTypesRepository.loadItemsFromServer(params);
            const fetchCaseTypes = ContractsController_1.caseTypesRepository.loadItemsFromServer(params);
            const fetchMilestones = ContractsController_1.milestonesRepository.loadItemsFromServer(params);
            const fetchCases = ContractsController_1.casesRepository.loadItemsFromServer(params);
            const fetchTasks = ContractsController_1.tasksRepository.loadItemsFromServer(params);
            try {
                const [contractData, milestonesTypesData, caseTypesData, milestonesData, casesData, tasksData] = await Promise.all([
                    fetchContract,
                    fetchMilestonesTypes,
                    fetchCaseTypes,
                    fetchMilestones,
                    fetchCases,
                    fetchTasks
                ]);
                if (contractData) {
                    setContract(contractData);
                    initContractRepository(contractData);
                }
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
    function initContractRepository(contractData) {
        if (!ContractsController_1.contractsRepository.currentItems.find(c => c.id === contractData.id))
            ContractsController_1.contractsRepository.items.push(contractData);
        ContractsController_1.contractsRepository.addToCurrentItems(contractData.id);
    }
    if (!contract) {
        return react_1.default.createElement("div", null,
            "\u0141aduj\u0119 dane... ",
            react_1.default.createElement(CommonComponents_1.SpinnerBootstrap, null),
            " ");
    }
    return (react_1.default.createElement(ContractContext_1.ContractProvider, { contract: contract, setContract: setContract, caseTypes: caseTypes, setCaseTypes: setCaseTypes, miletonesTypes: miletonesTypes, setMiletonesTypes: setMiletonesTypes, milestones: milestones, setMilestones: setMilestones, cases: cases, setCases: setCases, tasks: tasks, setTasks: setTasks },
        react_1.default.createElement(react_1.default.Fragment, null,
            react_1.default.createElement(ContractMainHeader_1.MainContractDetailsHeader, null),
            react_1.default.createElement(react_bootstrap_1.Tabs, { defaultActiveKey: "general", id: "uncontrolled-tab-example" },
                react_1.default.createElement(react_bootstrap_1.Tab, { eventKey: "general", title: "Dane og\u00F3lne" }, contract.ourId
                    ? react_1.default.createElement(ContractOurDetails_1.default, null)
                    : react_1.default.createElement(ContractOtherDetails_1.default, null)),
                react_1.default.createElement(react_bootstrap_1.Tab, { eventKey: "tasks", title: "Zadania" },
                    react_1.default.createElement(Tasks_1.default, null))))));
}
exports.ContractMainViewTabs = ContractMainViewTabs;
;
