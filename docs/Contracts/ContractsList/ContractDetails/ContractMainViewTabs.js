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
const RepositoryReact_1 = __importDefault(require("../../../React/RepositoryReact"));
const CommonComponents_1 = require("../../../View/Resultsets/CommonComponents");
const ContractDetailsContext_1 = require("./ContractDetailsContext");
const ContractMainHeader_1 = require("./ContractMainHeader");
const ContractOtherDetails_1 = __importDefault(require("./ContractOtherDetails"));
const ContractOurDetails_1 = __importDefault(require("./ContractOurDetails"));
const Tasks_1 = __importDefault(require("./Tasks/Tasks"));
function ContractMainViewTabs() {
    const location = (0, react_router_dom_1.useLocation)();
    const contractsRepository = createContractRepository();
    const [contract, setContract] = (0, react_1.useState)(undefined);
    let { id } = (0, react_router_dom_1.useParams)();
    (0, react_1.useEffect)(() => {
        console.log(`ContractMainViewTabs: useEffect(() => { id: ${contract?.id}`);
    }, [contract]);
    (0, react_1.useEffect)(() => {
        async function fetchData() {
            if (!id)
                throw new Error('Nie znaleziono id w adresie url');
            const idNumber = Number(id);
            const contractData = (await contractsRepository.loadItemsFromServerPOST([{ id }]))[0];
            setContract(contractData);
            initContractRepository(contractData);
            document.title = `Umowa ${contractData.ourId || contractData.number || idNumber}`;
        }
        ;
        fetchData();
    }, []);
    function createContractRepository() {
        const repository = new RepositoryReact_1.default({
            actionRoutes: {
                getRoute: 'contracts',
                addNewRoute: 'contractReact',
                editRoute: 'contract',
                deleteRoute: 'contract'
            },
            name: 'contracts',
        });
        let repositoryDataFromRoute = location?.state?.repository;
        if (repositoryDataFromRoute) {
            repository.items = repositoryDataFromRoute.items;
            repository.currentItems = repositoryDataFromRoute.currentItems;
        }
        return repository;
    }
    function initContractRepository(contractData) {
        if (!contractsRepository.currentItems.find(c => c.id === contractData.id))
            contractsRepository.items.push(contractData);
        contractsRepository.addToCurrentItems(contractData.id);
    }
    if (!contract) {
        return react_1.default.createElement("div", null,
            "\u0141aduj\u0119 dane... ",
            react_1.default.createElement(CommonComponents_1.SpinnerBootstrap, null),
            " ");
    }
    else
        return (react_1.default.createElement(ContractDetailsContext_1.ContractDetailsProvider, { contract: contract, setContract: setContract, contractsRepository: contractsRepository },
            react_1.default.createElement(react_1.default.Fragment, null,
                react_1.default.createElement(ContractMainHeader_1.ContractMainHeader, null),
                react_1.default.createElement(react_bootstrap_1.Tabs, { defaultActiveKey: "general", id: "uncontrolled-tab-example" },
                    react_1.default.createElement(react_bootstrap_1.Tab, { eventKey: "general", title: "Dane og\u00F3lne" }, contract.ourId
                        ? react_1.default.createElement(ContractOurDetails_1.default, null)
                        : react_1.default.createElement(ContractOtherDetails_1.default, null)),
                    react_1.default.createElement(react_bootstrap_1.Tab, { eventKey: "tasks", title: "Zadania" },
                        react_1.default.createElement(Tasks_1.default, null))))));
}
exports.ContractMainViewTabs = ContractMainViewTabs;
;
