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
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AlertComponent = void 0;
exports.ProgressBar = ProgressBar;
exports.SpinnerBootstrap = SpinnerBootstrap;
exports.SuccessToast = SuccessToast;
exports.GDFolderIconLink = GDFolderIconLink;
exports.CopyIconLink = CopyIconLink;
exports.MenuIconLink = MenuIconLink;
exports.GDDocFileIconLink = GDDocFileIconLink;
exports.EditIconButton = EditIconButton;
exports.DeleteIconButton = DeleteIconButton;
exports.CopyIconButton = CopyIconButton;
exports.MenuExpandIconButton = MenuExpandIconButton;
exports.InvoiceStatusBadge = InvoiceStatusBadge;
exports.ContractStatusBadge = ContractStatusBadge;
exports.MilestoneStatusBadge = MilestoneStatusBadge;
exports.SecurityStatusBadge = SecurityStatusBadge;
exports.OfferStatusBadge = OfferStatusBadge;
exports.OfferBondStatusBadge = OfferBondStatusBadge;
exports.OfferInvitationMailStatusBadge = OfferInvitationMailStatusBadge;
exports.TaskStatusBadge = TaskStatusBadge;
exports.ApplicationCallStatusBadge = ApplicationCallStatusBadge;
exports.ClientNeedStatusBadge = ClientNeedStatusBadge;
exports.MyTooltip = MyTooltip;
exports.DaysLeftBadge = DaysLeftBadge;
exports.LetterStatusBadge = LetterStatusBadge;
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
function SpinnerBootstrap() {
    return react_1.default.createElement(react_bootstrap_1.Spinner, { animation: "border", variant: "success" });
}
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
function SuccessToast({ header = "Sukces", message, show, onClose }) {
    return (react_1.default.createElement(react_bootstrap_1.Toast, { onClose: onClose, show: show, delay: 5000, autohide: true, style: {
            position: "absolute",
            bottom: 20,
            right: 20,
            zIndex: 9999,
        } },
        react_1.default.createElement(react_bootstrap_1.Toast.Header, null,
            react_1.default.createElement("strong", { className: "me-auto" }, header)),
        react_1.default.createElement(react_bootstrap_1.Toast.Body, null, message)));
}
function GDFolderIconLink({ folderUrl, layout = "vertical" }) {
    const className = layout === "vertical" ? "icon icon-vertical" : "icon icon-horizontal";
    return (react_1.default.createElement("a", { href: folderUrl, target: "_blank" },
        react_1.default.createElement("img", { src: Google_Drive_icon_png_1.default, alt: "Dysk Google", className: className })));
}
function CopyIconLink({ folderUrl, layout = "vertical" }) {
    const className = layout === "vertical" ? "icon icon-vertical" : "icon icon-horizontal";
    return (react_1.default.createElement("a", { href: folderUrl, target: "_blank", rel: "noopener noreferrer" },
        react_1.default.createElement(react_fontawesome_1.FontAwesomeIcon, { icon: free_solid_svg_icons_1.faCopy, className: className })));
}
function MenuIconLink({ folderUrl, layout = "vertical" }) {
    const className = layout === "vertical" ? "icon icon-vertical" : "icon icon-horizontal";
    return (react_1.default.createElement("a", { href: folderUrl, target: "_blank", rel: "noopener noreferrer" },
        react_1.default.createElement(react_fontawesome_1.FontAwesomeIcon, { icon: free_solid_svg_icons_1.faBars, className: className })));
}
function GDDocFileIconLink({ folderUrl, layout = "vertical" }) {
    const className = layout === "vertical" ? "icon icon-vertical" : "icon icon-horizontal";
    return (react_1.default.createElement("a", { href: folderUrl, target: "_blank" },
        react_1.default.createElement("img", { src: Google_Docs_icon_png_1.default, alt: "Dysk Google", className: className })));
}
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
function DeleteIconButton({ layout, onClick }) {
    return react_1.default.createElement(IconButton, { icon: free_solid_svg_icons_1.faTrash, layout: layout, onClick: onClick, className: "text-danger" });
}
function CopyIconButton({ layout, onClick }) {
    return react_1.default.createElement(IconButton, { icon: free_solid_svg_icons_1.faCopy, layout: layout, onClick: onClick, className: "text-info" });
}
function MenuExpandIconButton({ layout, onClick }) {
    const icon = layout === "vertical" ? free_solid_svg_icons_1.faEllipsisV : free_solid_svg_icons_1.faEllipsisH;
    return react_1.default.createElement(IconButton, { icon: icon, layout: layout, onClick: onClick, className: "text-secondary" });
}
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
function ContractStatusBadge({ status, className, style, }) {
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
    return (react_1.default.createElement(react_bootstrap_1.Badge, { bg: variant, text: textMode, className: className, style: style }, status));
}
function MilestoneStatusBadge({ status }) {
    let variant;
    let textMode = "light";
    switch (status) {
        case MainSetupReact_1.default.MilestoneStatus.NOT_STARTED:
            variant = "secondary";
            break;
        case MainSetupReact_1.default.MilestoneStatus.IN_PROGRESS:
            variant = "warning";
            textMode = "dark";
            break;
        case MainSetupReact_1.default.MilestoneStatus.FINISHED:
            variant = "success";
            break;
        case MainSetupReact_1.default.MilestoneStatus.ARCHIVAL:
            variant = "dark";
            break;
        default:
            variant = "secondary";
    }
    return (react_1.default.createElement(react_bootstrap_1.Badge, { bg: variant, text: textMode }, status));
}
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
function OfferStatusBadge({ status }) {
    let variant;
    let textMode = "light";
    switch (status) {
        //DECISION_PENDING: 'Składamy czy nie?',
        case MainSetupReact_1.default.OfferStatus.DECISION_PENDING:
            variant = "warning";
            textMode = "dark";
            break;
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
function OfferBondStatusBadge({ status }) {
    let variant;
    let textMode = "light";
    switch (status) {
        case MainSetupReact_1.default.OfferBondStatus.TO_PAY:
            variant = "primary";
            break;
        case MainSetupReact_1.default.OfferBondStatus.PAID:
            variant = "light";
            textMode = "success";
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
function OfferInvitationMailStatusBadge({ status }) {
    let variant;
    let textMode = "light";
    switch (status) {
        case MainSetupReact_1.default.OfferInvitationMailStatus.NEW:
            variant = "warning";
            textMode = "dark";
            break;
        case MainSetupReact_1.default.OfferInvitationMailStatus.TO_OFFER:
            variant = "danger";
            break;
        case MainSetupReact_1.default.OfferInvitationMailStatus.DONE:
            variant = "success";
            break;
        case MainSetupReact_1.default.OfferInvitationMailStatus.REJECTED:
            variant = "secondary";
            break;
        default:
            variant = "light";
            textMode = "dark";
    }
    return (react_1.default.createElement(react_bootstrap_1.Badge, { bg: variant, text: textMode }, status));
}
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
function MyTooltip({ children, content: tooltipContent, placement = "right", ...rest }) {
    return (react_1.default.createElement(react_bootstrap_1.OverlayTrigger, { placement: placement, delay: { show: 250, hide: 400 }, overlay: (props) => (react_1.default.createElement(react_bootstrap_1.Tooltip, { id: "button-tooltip", ...props }, tooltipContent)), ...rest }, children));
}
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
function LetterStatusBadge({ status }) {
    let variant;
    let textMode = "light";
    switch (status) {
        case MainSetupReact_1.default.OurLetterStatus.CREATED:
            variant = "secondary";
            break;
        case MainSetupReact_1.default.OurLetterStatus.TO_CORRECT:
            variant = "warning";
            textMode = "dark";
            break;
        case MainSetupReact_1.default.OurLetterStatus.CHANGED:
            variant = "info";
            break;
        case MainSetupReact_1.default.OurLetterStatus.APPROVED:
            variant = "success";
            break;
        case MainSetupReact_1.default.OurLetterStatus.SENT:
            variant = "primary";
            break;
        case MainSetupReact_1.default.IncomingLetterStatus.REGISTERED:
            variant = "secondary";
            break;
        case MainSetupReact_1.default.IncomingLetterStatus.RESPONSE_SENT:
            variant = "success";
            break;
        case MainSetupReact_1.default.IncomingLetterStatus.RESPONSE_REQUIRED:
            variant = "danger";
            break;
        case MainSetupReact_1.default.IncomingLetterStatus.NO_RESPONSE_REQUIRED:
            variant = "info";
            break;
        default:
            variant = "light";
            textMode = "dark";
            break;
    }
    return (react_1.default.createElement(react_bootstrap_1.Badge, { bg: variant, text: textMode }, status));
}
