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
exports.projectsRepository = exports.entitiesRepository = exports.contractsRepository = void 0;
const react_1 = __importStar(require("react"));
const react_bootstrap_1 = require("react-bootstrap");
const FilterableTable_1 = __importDefault(require("../../View/Resultsets/FilterableTable"));
const ContractsController_1 = __importDefault(require("./ContractsController"));
const MainSetupReact_1 = __importDefault(require("../../React/MainSetupReact"));
const CommonComponents_1 = require("../../View/Resultsets/CommonComponents");
const ToolsDate_1 = __importDefault(require("../../React/ToolsDate"));
const ContractModalBody_1 = require("./ContractModalBody");
exports.contractsRepository = ContractsController_1.default.contractsRepository;
exports.entitiesRepository = ContractsController_1.default.entitiesRepository;
exports.projectsRepository = ContractsController_1.default.projectsRepository;
function ContractsSearch({ title }) {
    const [objects, setObjects] = (0, react_1.useState)([]);
    const [searchText, setSearchText] = (0, react_1.useState)('');
    const [isReady, setIsReady] = (0, react_1.useState)(true);
    const [activeRowId, setActiveRowId] = (0, react_1.useState)(0);
    const [projects, setProjects] = (0, react_1.useState)([]);
    const [type, setType] = (0, react_1.useState)();
    const filters = [
        react_1.default.createElement(react_bootstrap_1.Form.Group, null,
            react_1.default.createElement(react_bootstrap_1.Form.Label, null, "Szukana fraza"),
            react_1.default.createElement(react_bootstrap_1.Form.Control, { type: "text", placeholder: "Wpisz tekst", name: "searchText", value: searchText, onChange: e => setSearchText(e.target.value) })),
        react_1.default.createElement(react_bootstrap_1.Form.Group, null,
            react_1.default.createElement(react_bootstrap_1.Form.Label, null, "Pocz\u0105tek od"),
            react_1.default.createElement(react_bootstrap_1.Form.Control, { name: 'startDate', type: "date", defaultValue: ToolsDate_1.default.addDays(new Date(), -365).toISOString().slice(0, 10) })),
        react_1.default.createElement(react_bootstrap_1.Form.Group, null,
            react_1.default.createElement(react_bootstrap_1.Form.Label, null, "Pocz\u0105tek do"),
            react_1.default.createElement(react_bootstrap_1.Form.Control, { name: 'endDate', type: "date", defaultValue: ToolsDate_1.default.addDays(new Date(), +600).toISOString().slice(0, 10) })),
        react_1.default.createElement(react_bootstrap_1.Form.Group, null,
            react_1.default.createElement(react_bootstrap_1.Form.Label, null, "Projekt"),
            react_1.default.createElement(CommonComponents_1.MyAsyncTypeahead, { name: '_parent', labelKey: 'ourId', repository: exports.projectsRepository, 
                //selectedRepositoryItems={projects}
                //onChange={(currentSelectedItems) => setProjects(currentSelectedItems)}
                specialSerwerSearchActionRoute: 'projects/' + MainSetupReact_1.default.currentUser.systemEmail })),
        react_1.default.createElement(CommonComponents_1.ContractTypeSelectFormElement
        //selectedRepositoryItems={type ? [type] : []}
        , { 
            //selectedRepositoryItems={type ? [type] : []}
            showValidationInfo: false })
    ];
    function handleEditObject(object) {
        setObjects(objects.map((o) => o.id === object.id ? object : o));
    }
    function handleAddObject(object) {
        setObjects([...objects, object]);
    }
    function handleDeleteObject(objectId) {
        setObjects(objects.filter((o) => o.id !== objectId));
    }
    function handleRowClick(id) {
        console.log('handleRowClick', id);
        setActiveRowId(id);
        exports.contractsRepository.addToCurrentItems(id);
    }
    return (react_1.default.createElement(FilterableTable_1.default, { objects: objects, onSubmitSearch: () => undefined, onAddNew: handleAddObject, onEdit: handleEditObject, onDelete: handleDeleteObject, onIsReadyChange: setIsReady, filters: filters, title: title, isReady: isReady, activeRowId: activeRowId, onRowClick: handleRowClick, tableHeaders: ['Oznaczenie', 'Numer', 'Nazwa', 'Data początku', 'Data końca'], rowRenderer: (props) => react_1.default.createElement(ContractSearchTableRow, { ...props }), repository: exports.contractsRepository }));
}
exports.default = ContractsSearch;
function ContractSearchTableRow({ dataObject, isActive, onEdit, onDelete, onIsReadyChange }) {
    if (!onIsReadyChange)
        throw new Error('onIsReadyChange is not defined');
    return react_1.default.createElement(react_1.default.Fragment, null,
        react_1.default.createElement("td", null, dataObject.ourId),
        react_1.default.createElement("td", null, dataObject.number),
        react_1.default.createElement("td", null, dataObject.name),
        react_1.default.createElement("td", null, dataObject.startDate),
        react_1.default.createElement("td", null, dataObject.endDate),
        isActive && (react_1.default.createElement("td", null,
            onEdit && (react_1.default.createElement(ContractModalBody_1.ContractEditModalButton, { modalProps: { onEdit, onIsReadyChange, initialData: dataObject, }, isOurContract: dataObject.ourId.length > 1 })),
            onDelete && (react_1.default.createElement(ContractModalBody_1.ContractDeleteModalButton, { modalProps: { onDelete, initialData: dataObject } })))));
}
