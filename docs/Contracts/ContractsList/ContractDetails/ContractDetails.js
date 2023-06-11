"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importDefault(require("react"));
const react_bootstrap_1 = require("react-bootstrap");
const ToolsDate_1 = __importDefault(require("../../../React/ToolsDate"));
const ContractContext_1 = require("../ContractContext");
function ContractDetails() {
    const { contract, setContract } = (0, ContractContext_1.useContract)();
    if (!contract)
        return react_1.default.createElement(react_bootstrap_1.Alert, { variant: 'danger' }, "Nie wybrano umowy");
    return (react_1.default.createElement(react_bootstrap_1.Card, null,
        react_1.default.createElement(react_bootstrap_1.Card.Body, null,
            react_1.default.createElement(react_bootstrap_1.Container, null,
                react_1.default.createElement(react_bootstrap_1.Row, null,
                    react_1.default.createElement(react_bootstrap_1.Col, { sm: 4, md: 2 },
                        react_1.default.createElement("div", null, "Warto\u015B\u0107 netto, z\u0142:"),
                        contract.value
                            ? react_1.default.createElement("h5", null, contract.value)
                            : 'Jeszcze nie okreśono'),
                    contract._contractors &&
                        react_1.default.createElement(react_bootstrap_1.Col, { sm: 12, md: 8 },
                            react_1.default.createElement("div", null, "Wykonawcy:"),
                            react_1.default.createElement("h5", null, contract._contractors.map((contractor) => react_1.default.createElement("span", null, contractor.name))))),
                react_1.default.createElement(react_bootstrap_1.Row, null,
                    react_1.default.createElement(react_bootstrap_1.Col, null, contract.description && react_1.default.createElement("p", null,
                        "Opis: ",
                        contract.description)))),
            react_1.default.createElement("p", { className: 'tekst-muted small' },
                "Koordynator(ka): ",
                `${contract._manager.name} ${contract._manager.surname}`,
                react_1.default.createElement("br", null),
                "Aktualizacja: ",
                ToolsDate_1.default.timestampToString(contract._lastUpdated)))));
}
exports.default = ContractDetails;
