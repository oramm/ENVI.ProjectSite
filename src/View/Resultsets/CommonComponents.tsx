import React, { ComponentProps, ReactNode, useCallback, useEffect, useRef, useState } from "react";
import { Spinner, Alert, Badge, Tooltip, OverlayTrigger } from "react-bootstrap";
import "react-bootstrap-typeahead/css/Typeahead.css";
import GDFolderIcon from "../../Resources/View/Google-Drive-icon.png";
import GDDocFileIcon from "../../Resources/View/Google-Docs-icon.png";
import "../../Css/styles.css";
import MainSetup from "../../React/MainSetupReact";
import { Color } from "react-bootstrap/esm/types";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCopy, faBars, IconDefinition, faPencil, faTrash } from "@fortawesome/free-solid-svg-icons";

export function ProgressBar() {
    return <progress style={{ height: "5px" }} />;
}

export function SpinnerBootstrap() {
    return <Spinner animation="border" variant="success" />;
}

export type AlertType = "success" | "danger" | "warning" | "info";

interface AlertComponentProps {
    message: string;
    type: AlertType;
    timeout?: number;
}

export const AlertComponent: React.FC<AlertComponentProps> = ({ message, type, timeout = 3000 }) => {
    const [show, setShow] = useState(true);

    useEffect(() => {
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

    return (
        <Alert variant={type} onClose={() => setShow(false)} dismissible>
            {message}
        </Alert>
    );
};

export type IconProps = {
    layout?: "horizontal" | "vertical";
    folderUrl: string;
};

export function GDFolderIconLink({ folderUrl, layout = "vertical" }: IconProps) {
    const className = layout === "vertical" ? "icon icon-vertical" : "icon icon-horizontal";
    return (
        <a href={folderUrl} target="_blank">
            <img src={GDFolderIcon} alt="Dysk Google" className={className} />
        </a>
    );
}

export function CopyIconLink({ folderUrl, layout = "vertical" }: IconProps) {
    const className = layout === "vertical" ? "icon icon-vertical" : "icon icon-horizontal";

    return (
        <a href={folderUrl} target="_blank" rel="noopener noreferrer">
            <FontAwesomeIcon icon={faCopy} className={className} />
        </a>
    );
}

export function MenuIconLink({ folderUrl, layout = "vertical" }: IconProps) {
    const className = layout === "vertical" ? "icon icon-vertical" : "icon icon-horizontal";
    return (
        <a href={folderUrl} target="_blank" rel="noopener noreferrer">
            <FontAwesomeIcon icon={faBars} className={className} />
        </a>
    );
}

export function GDDocFileIconLink({ folderUrl, layout = "vertical" }: IconProps) {
    const className = layout === "vertical" ? "icon icon-vertical" : "icon icon-horizontal";
    return (
        <a href={folderUrl} target="_blank">
            <img src={GDDocFileIcon} alt="Dysk Google" className={className} />
        </a>
    );
}

type GeneralIconButtonProps = SpecificIconButtonProps & {
    icon: IconDefinition;
    className: string;
};

export type SpecificIconButtonProps = {
    layout: "horizontal" | "vertical";
    onClick: () => void;
};

function IconButton({ icon, layout, onClick, className }: GeneralIconButtonProps) {
    className += layout === "vertical" ? " icon icon-vertical" : " icon icon-horizontal";

    return (
        <span
            onClick={(e) => {
                e.preventDefault();
                onClick();
            }}
            className={`${className}`}
            style={{ cursor: "pointer" }}
        >
            <FontAwesomeIcon icon={icon} size="lg" />
        </span>
    );
}

export function EditIconButton({ layout, onClick }: SpecificIconButtonProps) {
    return <IconButton icon={faPencil} layout={layout} onClick={onClick} className="text-primary" />;
}

//delete icon button
export function DeleteIconButton({ layout, onClick }: SpecificIconButtonProps) {
    return <IconButton icon={faTrash} layout={layout} onClick={onClick} className="text-danger" />;
}

export function InvoiceStatusBadge({ status }: { status: string }) {
    let variant;
    let textMode: Color = "light";
    switch (status) {
        case MainSetup.InvoiceStatuses.FOR_LATER:
            variant = "light";
            textMode = "dark";
            break;
        case MainSetup.InvoiceStatuses.TO_DO:
            variant = "primary";
            break;
        case MainSetup.InvoiceStatuses.DONE:
            variant = "warning";
            textMode = "dark";
            break;
        case MainSetup.InvoiceStatuses.SENT:
            variant = "info";
            break;
        case MainSetup.InvoiceStatuses.PAID:
            variant = "success";
            break;
        case MainSetup.InvoiceStatuses.TO_CORRECT:
            variant = "danger";
            break;
        case MainSetup.InvoiceStatuses.WITHDRAWN:
            variant = "dark";
            break;
        default:
            variant = "secondary";
    }

    return (
        <Badge bg={variant} text={textMode}>
            {status}
        </Badge>
    );
}

export function ContractStatusBadge({ status }: { status: string }) {
    let variant;
    let textMode: Color = "light";
    switch (status) {
        case MainSetup.ContractStatuses.NOT_STARTED:
            variant = "secondary";
            break;
        case MainSetup.ContractStatuses.IN_PROGRESS:
            variant = "warning";
            textMode = "dark";
            break;
        case MainSetup.ContractStatuses.FINISHED:
            variant = "success";
            break;
        case MainSetup.ContractStatuses.ARCHIVAL:
            variant = "dark";
            break;
        default:
            variant = "secondary";
    }

    return (
        <Badge bg={variant} text={textMode}>
            {status}
        </Badge>
    );
}

export function SecurityStatusBadge({ status }: { status: string }) {
    let variant;
    let textMode: Color = "light";
    switch (status) {
        case MainSetup.SecurityStatus.NOT_ISSUED:
            variant = "secondary";
            break;
        case MainSetup.SecurityStatus.ISSUED:
            variant = "warning";
            textMode = "dark";
            break;
        case MainSetup.SecurityStatus.TO_PROLONG:
            variant = "danger";
            break;
        case MainSetup.SecurityStatus.PROLONGED:
            variant = "success";
            break;
        case MainSetup.SecurityStatus.RETURNED_1ST_PART:
            variant = "info";
            break;
        case MainSetup.SecurityStatus.RETURNED_2ND_PART:
            variant = "success";
            break;
        default:
            variant = "secondary";
    }

    return (
        <Badge bg={variant} text={textMode}>
            {status}
        </Badge>
    );
}

export function OfferStatusBadge({ status }: { status: string }) {
    let variant;
    let textMode: Color = "light";

    switch (status) {
        case MainSetup.OfferStatus.TO_DO:
            variant = "primary"; // Choose appropriate color
            break;
        case MainSetup.OfferStatus.DONE:
            variant = "info"; // Choose appropriate color
            break;
        case MainSetup.OfferStatus.AWARDED:
            variant = "success";
            break;
        case MainSetup.OfferStatus.LOST:
            variant = "danger";
            break;
        case MainSetup.OfferStatus.WITHDRAWN:
            variant = "warning";
            textMode = "dark";
            break;
        case MainSetup.OfferStatus.NOT_INTERESTED:
            variant = "secondary";
            break;
        default:
            variant = "light";
            textMode = "dark";
    }

    return (
        <Badge bg={variant} text={textMode}>
            {status}
        </Badge>
    );
}

export function TaskStatusBadge({ status }: { status: string }) {
    let variant;
    let textMode: Color = "light";
    switch (status) {
        case MainSetup.TaskStatus.BACKLOG:
            variant = "light";
            textMode = "dark";
            break;
        case MainSetup.TaskStatus.NOT_STARTED:
            variant = "secondary";
            break;
        case MainSetup.TaskStatus.IN_PROGRESS:
            variant = "warning";
            textMode = "dark";
            break;
        case MainSetup.TaskStatus.TO_CORRECT:
            variant = "danger";
            break;
        case MainSetup.TaskStatus.AWAITING_RESPONSE:
            variant = "info";
            break;
        case MainSetup.TaskStatus.DONE:
            variant = "success";
            break;
        default:
            variant = "secondary";
    }

    return (
        <Badge bg={variant} text={textMode}>
            {status}
        </Badge>
    );
}

type MyTooltipProps = {
    children: JSX.Element;
    content: string;
    rest?: ComponentProps<typeof OverlayTrigger>;
    placement?: "top" | "right" | "bottom" | "left";
};

export function MyTooltip({ children, content: tooltipContent, placement = "right", ...rest }: MyTooltipProps) {
    return (
        <OverlayTrigger
            placement={placement}
            delay={{ show: 250, hide: 400 }}
            overlay={(props) => (
                <Tooltip id="button-tooltip" {...props}>
                    {tooltipContent}
                </Tooltip>
            )}
            {...rest}
        >
            {children}
        </OverlayTrigger>
    );
}

export function DaysLeftBadge({ daysLeft }: { daysLeft: number }) {
    let variant;
    let textMode: Color = "light";
    if (daysLeft < 10) {
        variant = "danger";
    } else if (daysLeft < 20) {
        variant = "warning";
        textMode = "dark";
    } else {
        variant = "success";
    }

    return (
        <Badge bg={variant} text={textMode}>
            {daysLeft} dni
        </Badge>
    );
}
