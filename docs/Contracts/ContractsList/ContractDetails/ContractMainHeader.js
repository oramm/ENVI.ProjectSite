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
function MainContractDetailsHeader() {
    const { contract } = (0, ContractContext_1.useContract)();
    if (!contract)
        return react_1.default.createElement(react_bootstrap_1.Alert, { variant: 'danger' }, "Nie wybrano umowy");
    return (react_1.default.createElement(react_bootstrap_1.Container, null,
        react_1.default.createElement(react_bootstrap_1.Row, null,
            react_1.default.createElement(react_bootstrap_1.Col, { sm: 1, lg: '1' }, contract._gdFolderUrl && (react_1.default.createElement(CommonComponents_1.GDFolderIconLink, { folderUrl: contract._gdFolderUrl }))),
            react_1.default.createElement(react_bootstrap_1.Col, { sm: 4, md: 2 },
                react_1.default.createElement("div", null, "Nr umowy:"),
                react_1.default.createElement("h5", null, contract.number)),
            react_1.default.createElement(react_bootstrap_1.Col, { sm: 'auto' }, contract.name),
            react_1.default.createElement(react_bootstrap_1.Col, { sm: 4, md: 2 },
                react_1.default.createElement("div", null, "Data podpisania:"),
                contract.startDate
                    ? react_1.default.createElement("h5", null,
                        ToolsDate_1.default.dateYMDtoDMY(contract.startDate),
                        " ")
                    : 'Jeszcze nie podpisano'),
            react_1.default.createElement(react_bootstrap_1.Col, { sm: 4, md: 2 },
                react_1.default.createElement("div", null, "Termin zako\u0144czenia:"),
                contract.endDate
                    ? react_1.default.createElement("h5", null, ToolsDate_1.default.dateYMDtoDMY(contract.endDate))
                    : 'Jeszcze nie ustalono'),
            react_1.default.createElement(react_bootstrap_1.Col, { sm: 1 },
                react_1.default.createElement(CommonComponents_1.ContractStatusBadge, { status: contract.status })))));
}
exports.MainContractDetailsHeader = MainContractDetailsHeader;
