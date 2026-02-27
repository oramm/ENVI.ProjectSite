"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MeetingNotesFilterBody = MeetingNotesFilterBody;
const react_1 = __importDefault(require("react"));
const react_bootstrap_1 = require("react-bootstrap");
const FormContext_1 = require("../../../../View/Modals/FormContext");
function MeetingNotesFilterBody() {
    const { register } = (0, FormContext_1.useFormContext)();
    return (react_1.default.createElement(react_bootstrap_1.Row, { xl: 5, md: 3, xs: 1 },
        react_1.default.createElement(react_bootstrap_1.Form.Group, { as: react_bootstrap_1.Col },
            react_1.default.createElement(react_bootstrap_1.Form.Label, null, "Szukana fraza"),
            react_1.default.createElement(react_bootstrap_1.Form.Control, { type: "text", placeholder: "Wpisz tekst", ...register("searchText") })),
        react_1.default.createElement(react_bootstrap_1.Form.Group, { as: react_bootstrap_1.Col },
            react_1.default.createElement(react_bootstrap_1.Form.Label, null, "Data spotkania od"),
            react_1.default.createElement(react_bootstrap_1.Form.Control, { type: "date", ...register("meetingDateFrom") })),
        react_1.default.createElement(react_bootstrap_1.Form.Group, { as: react_bootstrap_1.Col },
            react_1.default.createElement(react_bootstrap_1.Form.Label, null, "Data spotkania do"),
            react_1.default.createElement(react_bootstrap_1.Form.Control, { type: "date", ...register("meetingDateTo") }))));
}
