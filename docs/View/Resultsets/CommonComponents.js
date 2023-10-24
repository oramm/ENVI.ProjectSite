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
exports.DaysLeftBadge = exports.MyTooltip = exports.TaskStatusBadge = exports.SecurityStatusBadge = exports.ContractStatusBadge = exports.InvoiceStatusBadge = exports.DeleteIconButton = exports.EditIconButton = exports.GDDocFileIconLink = exports.MenuIconLink = exports.CopyIconLink = exports.GDFolderIconLink = exports.AlertComponent = exports.SpinnerBootstrap = exports.ProgressBar = void 0;
const react_1 = __importStar(require("react"));
const react_bootstrap_1 = require("react-bootstrap");
require("react-bootstrap-typeahead/css/Typeahead.css");
const Google_Drive_icon_png_1 = __importDefault(require("../../Resources/View/Google-Drive-icon.png"));
const Google_Docs_icon_png_1 = __importDefault(require("../../Resources/View/Google-Docs-icon.png"));
require("../../Css/styles.css");
const MainSetupReact_1 = __importDefault(require("../../React/MainSetupReact"));
const react_fontawesome_1 = require("@fortawesome/react-fontawesome");
const free_solid_svg_icons_1 = require("@fortawesome/free-solid-svg-icons");
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
function GDFolderIconLink({ folderUrl, layout = 'vertical' }) {
    const className = layout === 'vertical' ? 'icon icon-vertical' : 'icon icon-horizontal';
    return (react_1.default.createElement("a", { href: folderUrl, target: "_blank" },
        react_1.default.createElement("img", { src: Google_Drive_icon_png_1.default, alt: "Dysk Google", className: className })));
}
exports.GDFolderIconLink = GDFolderIconLink;
function CopyIconLink({ folderUrl, layout = 'vertical' }) {
    const className = layout === 'vertical' ? 'icon icon-vertical' : 'icon icon-horizontal';
    return (react_1.default.createElement("a", { href: folderUrl, target: "_blank", rel: "noopener noreferrer" },
        react_1.default.createElement(react_fontawesome_1.FontAwesomeIcon, { icon: free_solid_svg_icons_1.faCopy, className: className })));
}
exports.CopyIconLink = CopyIconLink;
function MenuIconLink({ folderUrl, layout = 'vertical' }) {
    const className = layout === 'vertical' ? 'icon icon-vertical' : 'icon icon-horizontal';
    return (react_1.default.createElement("a", { href: folderUrl, target: "_blank", rel: "noopener noreferrer" },
        react_1.default.createElement(react_fontawesome_1.FontAwesomeIcon, { icon: free_solid_svg_icons_1.faBars, className: className })));
}
exports.MenuIconLink = MenuIconLink;
function GDDocFileIconLink({ folderUrl, layout = 'vertical' }) {
    const className = layout === 'vertical' ? 'icon icon-vertical' : 'icon icon-horizontal';
    return (react_1.default.createElement("a", { href: folderUrl, target: "_blank" },
        react_1.default.createElement("img", { src: Google_Docs_icon_png_1.default, alt: "Dysk Google", className: className })));
}
exports.GDDocFileIconLink = GDDocFileIconLink;
function IconButton({ icon, layout, onClick, className }) {
    className += layout === 'vertical' ? ' icon icon-vertical' : ' icon icon-horizontal';
    return (react_1.default.createElement("span", { onClick: (e) => {
            e.preventDefault();
            onClick();
        }, className: `${className}`, style: { cursor: 'pointer' } },
        react_1.default.createElement(react_fontawesome_1.FontAwesomeIcon, { icon: icon, size: "lg" })));
}
function EditIconButton({ layout, onClick }) {
    return react_1.default.createElement(IconButton, { icon: free_solid_svg_icons_1.faPencil, layout: layout, onClick: onClick, className: 'text-primary' });
}
exports.EditIconButton = EditIconButton;
//delete icon button
function DeleteIconButton({ layout, onClick }) {
    return react_1.default.createElement(IconButton, { icon: free_solid_svg_icons_1.faTrash, layout: layout, onClick: onClick, className: 'text-danger' });
}
exports.DeleteIconButton = DeleteIconButton;
function InvoiceStatusBadge({ status }) {
    let variant;
    let textMode = 'light';
    switch (status) {
        case MainSetupReact_1.default.InvoiceStatuses.FOR_LATER:
            variant = 'light';
            textMode = 'dark';
            break;
        case MainSetupReact_1.default.InvoiceStatuses.TO_DO:
            variant = 'primary';
            break;
        case MainSetupReact_1.default.InvoiceStatuses.DONE:
            variant = 'warning';
            textMode = 'dark';
            break;
        case MainSetupReact_1.default.InvoiceStatuses.SENT:
            variant = 'info';
            break;
        case MainSetupReact_1.default.InvoiceStatuses.PAID:
            variant = 'success';
            break;
        case MainSetupReact_1.default.InvoiceStatuses.TO_CORRECT:
            variant = 'danger';
            break;
        case MainSetupReact_1.default.InvoiceStatuses.WITHDRAWN:
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
        case MainSetupReact_1.default.ContractStatuses.NOT_STARTED:
            variant = 'secondary';
            break;
        case MainSetupReact_1.default.ContractStatuses.IN_PROGRESS:
            variant = 'warning';
            textMode = 'dark';
            break;
        case MainSetupReact_1.default.ContractStatuses.FINISHED:
            variant = 'success';
            break;
        case MainSetupReact_1.default.ContractStatuses.ARCHIVAL:
            variant = 'dark';
            break;
        default:
            variant = 'secondary';
    }
    return (react_1.default.createElement(react_bootstrap_1.Badge, { bg: variant, text: textMode }, status));
}
exports.ContractStatusBadge = ContractStatusBadge;
function SecurityStatusBadge({ status }) {
    let variant;
    let textMode = 'light';
    switch (status) {
        case MainSetupReact_1.default.SecurityStatus.NOT_ISSUED:
            variant = 'secondary';
            break;
        case MainSetupReact_1.default.SecurityStatus.ISSUED:
            variant = 'warning';
            textMode = 'dark';
            break;
        case MainSetupReact_1.default.SecurityStatus.TO_PROLONG:
            variant = 'danger';
            break;
        case MainSetupReact_1.default.SecurityStatus.PROLONGED:
            variant = 'success';
            break;
        case MainSetupReact_1.default.SecurityStatus.RETURNED_1ST_PART:
            variant = 'info';
            break;
        case MainSetupReact_1.default.SecurityStatus.RETURNED_2ND_PART:
            variant = 'success';
            break;
        default:
            variant = 'secondary';
    }
    return (react_1.default.createElement(react_bootstrap_1.Badge, { bg: variant, text: textMode }, status));
}
exports.SecurityStatusBadge = SecurityStatusBadge;
function TaskStatusBadge({ status }) {
    let variant;
    let textMode = 'light';
    switch (status) {
        case MainSetupReact_1.default.TaskStatuses.BACKLOG:
            variant = 'light';
            textMode = 'dark';
            break;
        case MainSetupReact_1.default.TaskStatuses.NOT_STARTED:
            variant = 'secondary';
            break;
        case MainSetupReact_1.default.TaskStatuses.IN_PROGRESS:
            variant = 'warning';
            textMode = 'dark';
            break;
        case MainSetupReact_1.default.TaskStatuses.TO_CORRECT:
            variant = 'danger';
            break;
        case MainSetupReact_1.default.TaskStatuses.AWAITING_RESPONSE:
            variant = 'info';
            break;
        case MainSetupReact_1.default.TaskStatuses.DONE:
            variant = 'success';
            break;
        default:
            variant = 'secondary';
    }
    return (react_1.default.createElement(react_bootstrap_1.Badge, { bg: variant, text: textMode }, status));
}
exports.TaskStatusBadge = TaskStatusBadge;
function MyTooltip({ children, content: tooltipContent, placement = 'right', ...rest }) {
    return (react_1.default.createElement(react_bootstrap_1.OverlayTrigger, { placement: placement, delay: { show: 250, hide: 400 }, overlay: (props) => react_1.default.createElement(react_bootstrap_1.Tooltip, { id: "button-tooltip", ...props }, tooltipContent), ...rest }, children));
}
exports.MyTooltip = MyTooltip;
function DaysLeftBadge({ daysLeft }) {
    let variant;
    let textMode = 'light';
    if (daysLeft < 10) {
        variant = 'danger';
    }
    else if (daysLeft < 20) {
        variant = 'warning';
        textMode = 'dark';
    }
    else {
        variant = 'success';
    }
    return (react_1.default.createElement(react_bootstrap_1.Badge, { bg: variant, text: textMode },
        daysLeft,
        " dni"));
}
exports.DaysLeftBadge = DaysLeftBadge;
