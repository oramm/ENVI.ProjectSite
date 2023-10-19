"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MainContractDetailsHeader = void 0;
const react_1 = __importDefault(require("react"));
const react_bootstrap_1 = require("react-bootstrap");
const ToolsDate_1 = __importDefault(require("../../../React/ToolsDate"));
const CommonComponents_1 = require("../../../View/Resultsets/CommonComponents");
const ContractContext_1 = require("../ContractContext");
const ContractsController_1 = require("../ContractsController");
const ContractModalBodiesPartial_1 = require("../Modals/ContractModalBodiesPartial");
const ContractModalButtons_1 = require("../Modals/ContractModalButtons");
const ContractValidationSchema_1 = require("../Modals/ContractValidationSchema");
function MainContractDetailsHeader() {
    const { contract, setContract } = (0, ContractContext_1.useContract)();
    if (!contract || !setContract)
        return react_1.default.createElement(react_bootstrap_1.Alert, { variant: 'danger' }, "Nie wybrano umowy");
    function renderEntityDetails() {
        if (!contract)
            return react_1.default.createElement(react_1.default.Fragment, null);
        if (contract.ourId) {
            return (react_1.default.createElement(react_1.default.Fragment, null,
                react_1.default.createElement("div", null, "Zamawiaj\u0105cy"),
                react_1.default.createElement("h5", null, renderEntityData(contract._employers || []))));
        }
        else
            return (react_1.default.createElement(react_1.default.Fragment, null,
                react_1.default.createElement("div", null, "Wykonawca"),
                react_1.default.createElement("h5", null, renderEntityData(contract._contractors || []))));
    }
    ;
    function renderEntityData(entities) {
        return entities.map(entity => {
            return (react_1.default.createElement("div", { key: entity.id },
                react_1.default.createElement("div", null, entity.name),
                react_1.default.createElement("div", null, entity.address),
                react_1.default.createElement("div", null, entity.nip)));
        });
    }
    return (react_1.default.createElement(react_bootstrap_1.Container, null,
        react_1.default.createElement(react_bootstrap_1.Row, { className: 'mt-3' },
            react_1.default.createElement(react_bootstrap_1.Col, { sm: 11, md: 6 }, renderEntityDetails()),
            contract.ourId &&
                react_1.default.createElement(react_bootstrap_1.Col, { sm: 4, md: 2 },
                    react_1.default.createElement("div", null, "Oznaczenie:"),
                    react_1.default.createElement("h5", null, contract.ourId)),
            react_1.default.createElement(react_bootstrap_1.Col, { sm: 4, md: 2 },
                react_1.default.createElement("div", null, "Nr umowy:"),
                react_1.default.createElement("h5", null, contract.number)),
            react_1.default.createElement(react_bootstrap_1.Col, { sm: 1 },
                react_1.default.createElement(ContractModalButtons_1.ContractPartialEditTrigger, { modalProps: {
                        initialData: contract,
                        modalTitle: 'Edycja statusu',
                        repository: ContractsController_1.contractsRepository,
                        ModalBodyComponent: ContractModalBodiesPartial_1.ContractModalBodyStatus,
                        onEdit: (contract) => { setContract(contract); },
                        fieldsToUpdate: ['status'],
                        makeValidationSchema: ContractValidationSchema_1.contractStatusValidationSchema,
                    } },
                    react_1.default.createElement(CommonComponents_1.ContractStatusBadge, { status: contract?.status }))),
            react_1.default.createElement(react_bootstrap_1.Col, { sm: 1 }, contract._gdFolderUrl && (react_1.default.createElement(CommonComponents_1.GDFolderIconLink, { folderUrl: contract._gdFolderUrl }))),
            react_1.default.createElement(react_bootstrap_1.Col, { sm: 12, md: 6 },
                react_1.default.createElement(ContractModalButtons_1.ContractPartialEditTrigger, { modalProps: {
                        initialData: contract,
                        modalTitle: 'Edycja nazwy',
                        repository: ContractsController_1.contractsRepository,
                        ModalBodyComponent: ContractModalBodiesPartial_1.ContractModalBodyName,
                        onEdit: (contract) => { setContract(contract); },
                        fieldsToUpdate: ['name'],
                        makeValidationSchema: ContractValidationSchema_1.contractNameValidationSchema,
                    } },
                    react_1.default.createElement(react_1.default.Fragment, null,
                        react_1.default.createElement("div", null, "Nazwa:"),
                        react_1.default.createElement("h5", null, contract?.name)))),
            react_1.default.createElement(react_bootstrap_1.Col, { sm: 4, md: 2 },
                react_1.default.createElement("div", null, "Data podpisania:"),
                react_1.default.createElement(DateEditTrigger, { date: contract.startDate })),
            react_1.default.createElement(react_bootstrap_1.Col, { sm: 4, md: 2 },
                react_1.default.createElement("div", null, "Termin zako\u0144czenia:"),
                react_1.default.createElement(DateEditTrigger, { date: contract.endDate })),
            react_1.default.createElement(react_bootstrap_1.Col, { sm: 4, md: 2 },
                react_1.default.createElement("div", null, "Gwarancja:"),
                react_1.default.createElement(DateEditTrigger, { date: contract.guaranteeEndDate })))));
}
exports.MainContractDetailsHeader = MainContractDetailsHeader;
function DateEditTrigger({ date }) {
    const { contract, setContract } = (0, ContractContext_1.useContract)();
    if (!contract || !setContract)
        return react_1.default.createElement(react_bootstrap_1.Alert, { variant: 'danger' }, "Nie wybrano umowy");
    return (react_1.default.createElement(ContractModalButtons_1.ContractPartialEditTrigger, { modalProps: {
            initialData: contract,
            modalTitle: 'Edycja dat',
            repository: ContractsController_1.contractsRepository,
            ModalBodyComponent: ContractModalBodiesPartial_1.ContractModalBodyDates,
            onEdit: (contract) => { setContract(contract); },
            fieldsToUpdate: ['startDate', 'endDate', 'guaranteeEndDate'],
            makeValidationSchema: ContractValidationSchema_1.contractDatesValidationSchema,
        } }, date
        ? react_1.default.createElement("h5", null, ToolsDate_1.default.dateYMDtoDMY(date))
        : react_1.default.createElement(react_1.default.Fragment, null, 'Jeszcze nie ustalono')));
}
