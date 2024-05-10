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
exports.DaysLeftBadge = exports.MyTooltip = exports.ClientNeedStatusBadge = exports.ApplicationCallStatusBadge = exports.TaskStatusBadge = exports.OfferBondStatusBadge = exports.OfferStatusBadge = exports.SecurityStatusBadge = exports.ContractStatusBadge = exports.InvoiceStatusBadge = exports.MenuExpandIconButton = exports.DeleteIconButton = exports.EditIconButton = exports.GDDocFileIconLink = exports.MenuIconLink = exports.CopyIconLink = exports.GDFolderIconLink = exports.AlertComponent = exports.SpinnerBootstrap = exports.ProgressBar = void 0;
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
    return react_1.default.createElement("progress", { style: { height: "5px" } });
}
exports.ProgressBar = ProgressBar;
function SpinnerBootstrap() {
    return react_1.default.createElement(react_bootstrap_1.Spinner, { animation: "border", variant: "success" });
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
function GDFolderIconLink({ folderUrl, layout = "vertical" }) {
    const className = layout === "vertical" ? "icon icon-vertical" : "icon icon-horizontal";
    return (react_1.default.createElement("a", { href: folderUrl, target: "_blank" },
        react_1.default.createElement("img", { src: Google_Drive_icon_png_1.default, alt: "Dysk Google", className: className })));
}
exports.GDFolderIconLink = GDFolderIconLink;
function CopyIconLink({ folderUrl, layout = "vertical" }) {
    const className = layout === "vertical" ? "icon icon-vertical" : "icon icon-horizontal";
    return (react_1.default.createElement("a", { href: folderUrl, target: "_blank", rel: "noopener noreferrer" },
        react_1.default.createElement(react_fontawesome_1.FontAwesomeIcon, { icon: free_solid_svg_icons_1.faCopy, className: className })));
}
exports.CopyIconLink = CopyIconLink;
function MenuIconLink({ folderUrl, layout = "vertical" }) {
    const className = layout === "vertical" ? "icon icon-vertical" : "icon icon-horizontal";
    return (react_1.default.createElement("a", { href: folderUrl, target: "_blank", rel: "noopener noreferrer" },
        react_1.default.createElement(react_fontawesome_1.FontAwesomeIcon, { icon: free_solid_svg_icons_1.faBars, className: className })));
}
exports.MenuIconLink = MenuIconLink;
function GDDocFileIconLink({ folderUrl, layout = "vertical" }) {
    const className = layout === "vertical" ? "icon icon-vertical" : "icon icon-horizontal";
    return (react_1.default.createElement("a", { href: folderUrl, target: "_blank" },
        react_1.default.createElement("img", { src: Google_Docs_icon_png_1.default, alt: "Dysk Google", className: className })));
}
exports.GDDocFileIconLink = GDDocFileIconLink;
function IconButton({ icon, layout, onClick, className }) {
    className += layout === "vertical" ? " icon icon-vertical" : " icon icon-horizontal";
    return (react_1.default.createElement("span", { onClick: (e) => {
            e.preventDefault();
            onClick();
        }, className: `${className}`, style: { cursor: "pointer" } },
        react_1.default.createElement(react_fontawesome_1.FontAwesomeIcon, { icon: icon, size: "lg" })));
}
function EditIconButton({ layout, onClick }) {
    return react_1.default.createElement(IconButton, { icon: free_solid_svg_icons_1.faPencil, layout: layout, onClick: onClick, className: "text-primary" });
}
exports.EditIconButton = EditIconButton;
function DeleteIconButton({ layout, onClick }) {
    return react_1.default.createElement(IconButton, { icon: free_solid_svg_icons_1.faTrash, layout: layout, onClick: onClick, className: "text-danger" });
}
exports.DeleteIconButton = DeleteIconButton;
function MenuExpandIconButton({ layout, onClick }) {
    const icon = layout === "vertical" ? free_solid_svg_icons_1.faEllipsisV : free_solid_svg_icons_1.faEllipsisH;
    return react_1.default.createElement(IconButton, { icon: icon, layout: layout, onClick: onClick, className: "text-secondary" });
}
exports.MenuExpandIconButton = MenuExpandIconButton;
function InvoiceStatusBadge({ status }) {
    let variant;
    let textMode = "light";
    switch (status) {
        case MainSetupReact_1.default.InvoiceStatuses.FOR_LATER:
            variant = "light";
            textMode = "dark";
            break;
        case MainSetupReact_1.default.InvoiceStatuses.TO_DO:
            variant = "primary";
            break;
        case MainSetupReact_1.default.InvoiceStatuses.DONE:
            variant = "warning";
            textMode = "dark";
            break;
        case MainSetupReact_1.default.InvoiceStatuses.SENT:
            variant = "info";
            break;
        case MainSetupReact_1.default.InvoiceStatuses.PAID:
            variant = "success";
            break;
        case MainSetupReact_1.default.InvoiceStatuses.TO_CORRECT:
            variant = "danger";
            break;
        case MainSetupReact_1.default.InvoiceStatuses.WITHDRAWN:
            variant = "dark";
            break;
        default:
            variant = "secondary";
    }
    return (react_1.default.createElement(react_bootstrap_1.Badge, { bg: variant, text: textMode }, status));
}
exports.InvoiceStatusBadge = InvoiceStatusBadge;
function ContractStatusBadge({ status }) {
    let variant;
    let textMode = "light";
    switch (status) {
        case MainSetupReact_1.default.ContractStatuses.NOT_STARTED:
            variant = "secondary";
            break;
        case MainSetupReact_1.default.ContractStatuses.IN_PROGRESS:
            variant = "warning";
            textMode = "dark";
            break;
        case MainSetupReact_1.default.ContractStatuses.FINISHED:
            variant = "success";
            break;
        case MainSetupReact_1.default.ContractStatuses.ARCHIVAL:
            variant = "dark";
            break;
        default:
            variant = "secondary";
    }
    return (react_1.default.createElement(react_bootstrap_1.Badge, { bg: variant, text: textMode }, status));
}
exports.ContractStatusBadge = ContractStatusBadge;
function SecurityStatusBadge({ status }) {
    let variant;
    let textMode = "light";
    switch (status) {
        case MainSetupReact_1.default.SecurityStatus.NOT_ISSUED:
            variant = "secondary";
            break;
        case MainSetupReact_1.default.SecurityStatus.ISSUED:
            variant = "warning";
            textMode = "dark";
            break;
        case MainSetupReact_1.default.SecurityStatus.TO_PROLONG:
            variant = "danger";
            break;
        case MainSetupReact_1.default.SecurityStatus.PROLONGED:
            variant = "success";
            break;
        case MainSetupReact_1.default.SecurityStatus.RETURNED_1ST_PART:
            variant = "info";
            break;
        case MainSetupReact_1.default.SecurityStatus.RETURNED_2ND_PART:
            variant = "success";
            break;
        default:
            variant = "secondary";
    }
    return (react_1.default.createElement(react_bootstrap_1.Badge, { bg: variant, text: textMode }, status));
}
exports.SecurityStatusBadge = SecurityStatusBadge;
function OfferStatusBadge({ status }) {
    let variant;
    let textMode = "light";
    switch (status) {
        case MainSetupReact_1.default.OfferStatus.TO_DO:
            variant = "primary";
            break;
        case MainSetupReact_1.default.OfferStatus.DONE:
            variant = "info";
            break;
        case MainSetupReact_1.default.OfferStatus.AWARDED:
            variant = "success";
            break;
        case MainSetupReact_1.default.OfferStatus.LOST:
            variant = "secondary";
            break;
        case MainSetupReact_1.default.OfferStatus.WITHDRAWN:
            variant = "warning";
            textMode = "dark";
            break;
        case MainSetupReact_1.default.OfferStatus.NOT_INTERESTED:
            variant = "secondary";
            break;
        case MainSetupReact_1.default.OfferStatus.CANCELED:
            variant = "danger";
            break;
        default:
            variant = "light";
            textMode = "dark";
    }
    return (react_1.default.createElement(react_bootstrap_1.Badge, { bg: variant, text: textMode }, status));
}
exports.OfferStatusBadge = OfferStatusBadge;
function OfferBondStatusBadge({ status }) {
    let variant;
    let textMode = "light";
    switch (status) {
        case MainSetupReact_1.default.OfferBondStatus.TO_DO:
            variant = "primary";
            break;
        case MainSetupReact_1.default.OfferBondStatus.DONE:
            variant = "info";
            break;
        case MainSetupReact_1.default.OfferBondStatus.TO_RENEW:
            variant = "danger";
            break;
        case MainSetupReact_1.default.OfferBondStatus.TO_BE_RETURNED:
            variant = "warning";
            break;
        case MainSetupReact_1.default.OfferBondStatus.RETURNED:
            variant = "success";
            break;
        default:
            variant = "light";
            textMode = "dark";
    }
    return (react_1.default.createElement(react_bootstrap_1.Badge, { bg: variant, text: textMode }, status));
}
exports.OfferBondStatusBadge = OfferBondStatusBadge;
function TaskStatusBadge({ status }) {
    let variant;
    let textMode = "light";
    switch (status) {
        case MainSetupReact_1.default.TaskStatus.BACKLOG:
            variant = "light";
            textMode = "dark";
            break;
        case MainSetupReact_1.default.TaskStatus.NOT_STARTED:
            variant = "secondary";
            break;
        case MainSetupReact_1.default.TaskStatus.IN_PROGRESS:
            variant = "warning";
            textMode = "dark";
            break;
        case MainSetupReact_1.default.TaskStatus.TO_CORRECT:
            variant = "danger";
            break;
        case MainSetupReact_1.default.TaskStatus.AWAITING_RESPONSE:
            variant = "info";
            break;
        case MainSetupReact_1.default.TaskStatus.DONE:
            variant = "success";
            break;
        default:
            variant = "secondary";
    }
    return (react_1.default.createElement(react_bootstrap_1.Badge, { bg: variant, text: textMode }, status));
}
exports.TaskStatusBadge = TaskStatusBadge;
function ApplicationCallStatusBadge({ status }) {
    let variant;
    let textMode = "light";
    switch (status) {
        case MainSetupReact_1.default.ApplicationCallStatus.CLOSED:
            variant = "secondary";
            break;
        case MainSetupReact_1.default.ApplicationCallStatus.OPEN:
            variant = "danger";
            break;
        case MainSetupReact_1.default.ApplicationCallStatus.SCHEDULED:
            variant = "warning";
            textMode = "dark";
            break;
        case MainSetupReact_1.default.ApplicationCallStatus.UNKOWN:
            variant = "light";
            textMode = "dark";
            break;
        default:
            variant = "secondary";
    }
    return (react_1.default.createElement(react_bootstrap_1.Badge, { bg: variant, text: textMode }, status));
}
exports.ApplicationCallStatusBadge = ApplicationCallStatusBadge;
function ClientNeedStatusBadge({ status }) {
    let variant;
    let textMode = "light"; // Default text mode to light for better contrast on darker badges
    // Determine badge color and text color based on the status
    switch (status) {
        case MainSetupReact_1.default.ClientNeedStatus.URGENT:
            variant = "danger"; // Red indicates urgency
            break;
        case MainSetupReact_1.default.ClientNeedStatus.IMPORTANT:
            variant = "warning"; // Orange indicates importance
            textMode = "dark";
            break;
        case MainSetupReact_1.default.ClientNeedStatus.NICE_TO_HAVE:
            variant = "info"; // Blue indicates a nice to have but not critical
            break;
        case MainSetupReact_1.default.ClientNeedStatus.FOR_LATER:
            variant = "secondary"; // Grey indicates low priority
            break;
        case MainSetupReact_1.default.ClientNeedStatus.NOT_ACTUAL:
            variant = "dark"; // Dark to signify it's no longer relevant
            textMode = "light";
            break;
        default:
            variant = "light"; // Light for unknown or default status
            textMode = "dark";
            break;
    }
    // Return the Badge component with the appropriate styling
    return (react_1.default.createElement(react_bootstrap_1.Badge, { bg: variant, text: textMode }, status));
}
exports.ClientNeedStatusBadge = ClientNeedStatusBadge;
function MyTooltip({ children, content: tooltipContent, placement = "right", ...rest }) {
    return (react_1.default.createElement(react_bootstrap_1.OverlayTrigger, { placement: placement, delay: { show: 250, hide: 400 }, overlay: (props) => (react_1.default.createElement(react_bootstrap_1.Tooltip, { id: "button-tooltip", ...props }, tooltipContent)), ...rest }, children));
}
exports.MyTooltip = MyTooltip;
function DaysLeftBadge({ daysLeft }) {
    let variant;
    let textMode = "light";
    if (daysLeft < 10) {
        variant = "danger";
    }
    else if (daysLeft < 20) {
        variant = "warning";
        textMode = "dark";
    }
    else {
        variant = "success";
    }
    return (react_1.default.createElement(react_bootstrap_1.Badge, { bg: variant, text: textMode },
        daysLeft,
        " dni"));
}
exports.DaysLeftBadge = DaysLeftBadge;
