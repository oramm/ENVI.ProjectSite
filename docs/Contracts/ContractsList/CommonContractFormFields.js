"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommonFormFields = void 0;
const react_bootstrap_1 = require("react-bootstrap");
const react_1 = __importDefault(require("react"));
const CommonComponents_1 = require("../../View/Resultsets/CommonComponents");
const ContractsController_1 = __importDefault(require("./ContractsController"));
function CommonFormFields({ typeId, setTypeId, name, setName, alias, setAlias, comment, setComment, valueInPLN, setValueInPLN, startDate, setStartDate, endDate, setEndDate, status, setStatus, isEditing }) {
    return (react_1.default.createElement(react_1.default.Fragment, null,
        (isEditing) ?
            react_1.default.createElement(CommonComponents_1.ContractTypeSelectFormElement, { value: typeId, onChange: (e) => {
                    setTypeId(parseInt(e.target.value));
                    console.log(e.target.value);
                } })
            : null,
        react_1.default.createElement(react_bootstrap_1.Form.Group, { controlId: "name" },
            react_1.default.createElement(react_bootstrap_1.Form.Label, null, "Nazwa kontraktu"),
            react_1.default.createElement(react_bootstrap_1.Form.Control, { type: "text", name: "name", placeholder: "Podaj nazw\u0119", value: name, onChange: (e) => setName(e.target.value) })),
        react_1.default.createElement(react_bootstrap_1.Form.Group, { controlId: "alias" },
            react_1.default.createElement(react_bootstrap_1.Form.Label, null, "Alias"),
            react_1.default.createElement(react_bootstrap_1.Form.Control, { type: "text", name: 'alias', placeholder: "Podaj alias", value: alias, onChange: (e) => setAlias(e.target.value) })),
        react_1.default.createElement(react_bootstrap_1.Form.Group, { controlId: "comment" },
            react_1.default.createElement(react_bootstrap_1.Form.Label, null, "Opis"),
            react_1.default.createElement(react_bootstrap_1.Form.Control, { as: "textarea", name: "comment", rows: 3, placeholder: "Podaj opis", value: comment, onChange: (e) => setComment(e.target.value) })),
        react_1.default.createElement(react_bootstrap_1.Form.Group, { controlId: "valueInPLN" },
            react_1.default.createElement(react_bootstrap_1.Form.Label, null, "Warto\u015B\u0107 netto w PLN"),
            react_1.default.createElement(CommonComponents_1.ValueInPLNInput, { onChange: setValueInPLN, value: valueInPLN })),
        react_1.default.createElement(react_bootstrap_1.Form.Group, { controlId: "startDate" },
            react_1.default.createElement(react_bootstrap_1.Form.Label, null, "Pocz\u0105tek"),
            react_1.default.createElement(react_bootstrap_1.Form.Control, { type: "date", name: "startDate", value: startDate, onChange: (e) => setStartDate(e.target.value) })),
        react_1.default.createElement(react_bootstrap_1.Form.Group, { controlId: "endDate" },
            react_1.default.createElement(react_bootstrap_1.Form.Label, null, "Zako\u0144czenie"),
            react_1.default.createElement(react_bootstrap_1.Form.Control, { type: "date", name: "endDate", value: endDate, onChange: (e) => setEndDate(e.target.value) })),
        react_1.default.createElement(react_bootstrap_1.Form.Group, { controlId: "status" },
            react_1.default.createElement(react_bootstrap_1.Form.Label, null, "Status"),
            react_1.default.createElement(react_bootstrap_1.Form.Control, { as: "select", name: "status", onChange: (e) => setStatus(e.target.value), value: status },
                react_1.default.createElement("option", { value: "" }, "-- Wybierz opcj\u0119 --"),
                ContractsController_1.default.statusNames.map((statusName, index) => (react_1.default.createElement("option", { key: index, value: statusName }, statusName)))))));
}
exports.CommonFormFields = CommonFormFields;
