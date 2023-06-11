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
exports.TaskStatusBadge = exports.ContractStatusBadge = exports.InvoiceStatusBadge = exports.GDDocFileIconLink = exports.GDFolderIconLink = exports.AlertComponent = exports.SpinnerBootstrap = exports.ProgressBar = void 0;
const react_1 = __importStar(require("react"));
const react_bootstrap_1 = require("react-bootstrap");
require("react-bootstrap-typeahead/css/Typeahead.css");
const Google_Drive_icon_png_1 = __importDefault(require("../../Resources/View/Google-Drive-icon.png"));
const Google_Docs_icon_png_1 = __importDefault(require("../../Resources/View/Google-Docs-icon.png"));
require("../../Css/styles.css");
const MainSetupReact_1 = __importDefault(require("../../React/MainSetupReact"));
function ProgressBar() {
    return (react_1.default.createElement("progress", { style: { height: "5px" } }));
}
exports.ProgressBar = ProgressBar;
function SpinnerBootstrap() {
    return (react_1.default.createElement(react_bootstrap_1.Spinner, { animation: "border", variant: "success" }));
}
exports.SpinnerBootstrap = SpinnerBootstrap;
const AlertComponent = ({ message, type, timeout = 3000 }) => {
    const [show, setShow] = (0, react_1.useState)(true);
    (0, react_1.useEffect)(() => {
        const timer = setTimeout(() => {
            setShow(false);
        }, timeout);
        return () => {
            clearTimeout(timer);
        };
    }, [timeout]);
    if (!show) {
        return null;
    }
    return (react_1.default.createElement(react_bootstrap_1.Alert, { variant: type, onClose: () => setShow(false), dismissible: true }, message));
};
exports.AlertComponent = AlertComponent;
function GDFolderIconLink({ folderUrl }) {
    return (react_1.default.createElement("a", { href: folderUrl, target: "_blank" },
        react_1.default.createElement("img", { src: Google_Drive_icon_png_1.default, alt: "Dysk Google", className: 'icon-vertical' })));
}
exports.GDFolderIconLink = GDFolderIconLink;
function GDDocFileIconLink({ folderUrl }) {
    return (react_1.default.createElement("a", { href: folderUrl, target: "_blank" },
        react_1.default.createElement("img", { src: Google_Docs_icon_png_1.default, alt: "Dysk Google", className: 'icon-vertical' })));
}
exports.GDDocFileIconLink = GDDocFileIconLink;
function InvoiceStatusBadge({ status }) {
    let variant;
    let textMode = 'light';
    switch (status) {
        case MainSetupReact_1.default.invoiceStatusNames[0]: //'Na później'
            variant = 'light';
            textMode = 'dark';
            break;
        case MainSetupReact_1.default.invoiceStatusNames[1]: //'Do zrobienia'
            variant = 'primary';
            break;
        case MainSetupReact_1.default.invoiceStatusNames[2]: //'Zrobiona'
            variant = 'warning';
            textMode = 'dark';
            break;
        case MainSetupReact_1.default.invoiceStatusNames[3]: //'Wysłana'
            variant = 'info';
            break;
        case MainSetupReact_1.default.invoiceStatusNames[4]: //'Zapłacona'
            variant = 'success';
            break;
        case MainSetupReact_1.default.invoiceStatusNames[5]: //'Do korekty'
            variant = 'danger';
            break;
        case MainSetupReact_1.default.invoiceStatusNames[6]: //'Wycofana'
            variant = 'dark';
            break;
        default:
            variant = 'secondary';
    }
    return (react_1.default.createElement(react_bootstrap_1.Badge, { bg: variant, text: textMode }, status));
}
exports.InvoiceStatusBadge = InvoiceStatusBadge;
function ContractStatusBadge({ status }) {
    let variant;
    let textMode = 'light';
    switch (status) {
        case MainSetupReact_1.default.contractStatusNames[0]: //'Na później'
            variant = 'light';
            textMode = 'dark';
            break;
        case MainSetupReact_1.default.contractStatusNames[1]: //'Do zrobienia'
            variant = 'primary';
            break;
        case MainSetupReact_1.default.contractStatusNames[2]: //'Zrobiona'
            variant = 'warning';
            textMode = 'dark';
            break;
        case MainSetupReact_1.default.contractStatusNames[3]: //'Wysłana'
            variant = 'info';
            break;
        case MainSetupReact_1.default.contractStatusNames[4]: //'Zapłacona'
            variant = 'success';
            break;
        case MainSetupReact_1.default.contractStatusNames[5]: //'Do korekty'
            variant = 'danger';
            break;
        case MainSetupReact_1.default.contractStatusNames[6]: //'Wycofana'
            variant = 'dark';
            break;
        default:
            variant = 'secondary';
    }
    return (react_1.default.createElement(react_bootstrap_1.Badge, { bg: variant, text: textMode }, status));
}
exports.ContractStatusBadge = ContractStatusBadge;
function TaskStatusBadge({ status }) {
    let variant;
    let textMode = 'light';
    switch (status) {
        case MainSetupReact_1.default.taskStatusNames[0]: //'Backlog'
            variant = 'light';
            textMode = 'dark';
            break;
        case MainSetupReact_1.default.taskStatusNames[1]: //'Nie rozpoczęty'
            variant = 'secondary';
            break;
        case MainSetupReact_1.default.taskStatusNames[2]: //'W trakcie'
            variant = 'warning';
            textMode = 'dark';
            break;
        case MainSetupReact_1.default.taskStatusNames[3]: //'Do poprawy'
            variant = 'danger';
            break;
        case MainSetupReact_1.default.taskStatusNames[4]: //'Oczekiwanie na odpowiedź'
            variant = 'info';
            break;
        case MainSetupReact_1.default.taskStatusNames[5]: //'Zrobione'
            variant = 'success';
            break;
        default:
            variant = 'secondary';
    }
    return (react_1.default.createElement(react_bootstrap_1.Badge, { bg: variant, text: textMode }, status));
}
exports.TaskStatusBadge = TaskStatusBadge;
