"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PersonsFilterBody = void 0;
const react_1 = __importDefault(require("react"));
const react_bootstrap_1 = require("react-bootstrap");
const FormContext_1 = require("../View/Modals/FormContext");
const PersonsController_1 = require("./PersonsController");
const GenericComponents_1 = require("../View/Modals/CommonFormComponents/GenericComponents");
function PersonsFilterBody() {
    const { register, formState: { errors }, } = (0, FormContext_1.useFormContext)();
    return (react_1.default.createElement(react_bootstrap_1.Row, { xl: 12, md: 6, xs: 12 },
        react_1.default.createElement(react_bootstrap_1.Form.Group, { as: react_bootstrap_1.Col, md: 4 },
            react_1.default.createElement(react_bootstrap_1.Form.Label, null, "Szukana fraza"),
            react_1.default.createElement(react_bootstrap_1.Form.Control, { type: "text", placeholder: "Wpisz tekst", ...register("searchText") })),
        react_1.default.createElement(react_bootstrap_1.Form.Group, { as: react_bootstrap_1.Col, md: 8 },
            react_1.default.createElement(react_bootstrap_1.Form.Label, null, "Podmiot"),
            react_1.default.createElement(GenericComponents_1.MyAsyncTypeahead, { name: "_entities", labelKey: "name", repository: PersonsController_1.entitiesRepository, multiple: true, showValidationInfo: false }),
            react_1.default.createElement(GenericComponents_1.ErrorMessage, { errors: errors, name: "_entities" }))));
}
exports.PersonsFilterBody = PersonsFilterBody;
