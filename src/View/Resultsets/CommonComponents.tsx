import React, { ComponentProps, ReactNode, useCallback, useEffect, useRef, useState } from "react";
import { Spinner, Alert, Badge, Tooltip, OverlayTrigger, Toast } from "react-bootstrap";
import "react-bootstrap-typeahead/css/Typeahead.css";
import GDFolderIcon from "../../Resources/View/Google-Drive-icon.png";
import GDDocFileIcon from "../../Resources/View/Google-Docs-icon.png";
import "../../Css/styles.css";
import MainSetup from "../../React/MainSetupReact";
import { Color } from "react-bootstrap/esm/types";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faCopy,
    faBars,
    IconDefinition,
    faPencil,
    faReply,
    faTrash,
    faEllipsisV,
    faEllipsisH,
    faFileCirclePlus,
} from "@fortawesome/free-solid-svg-icons";

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

interface ToastComponentProps {
    header?: string;
    message: string;
    show: boolean;
    onClose: () => void;
}

export function SuccessToast({ header = "Sukces", message, show, onClose }: ToastComponentProps) {
    return (
        <Toast
            onClose={onClose}
            show={show}
            delay={5000}
            autohide
            style={{
                position: "absolute",
                bottom: 20,
                right: 20,
                zIndex: 9999,
            }}
        >
            <Toast.Header>
                <strong className="me-auto">{header}</strong>
            </Toast.Header>
            <Toast.Body>{message}</Toast.Body>
        </Toast>
    );
}

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

export function DeleteIconButton({ layout, onClick }: SpecificIconButtonProps) {
    return <IconButton icon={faTrash} layout={layout} onClick={onClick} className="text-danger" />;
}

export function CopyIconButton({ layout, onClick }: SpecificIconButtonProps) {
    return <IconButton icon={faCopy} layout={layout} onClick={onClick} className="text-info" />;
}

export function ReplyIconButton({ layout, onClick }: SpecificIconButtonProps) {
    return <IconButton icon={faReply} layout={layout} onClick={onClick} className="text-success" />;
}

export function UploadIconButton({ layout, onClick }: SpecificIconButtonProps) {
    return <IconButton icon={faFileCirclePlus} layout={layout} onClick={onClick} className="text-primary" />;
}

export function MenuExpandIconButton({ layout, onClick }: SpecificIconButtonProps) {
    const icon = layout === "vertical" ? faEllipsisV : faEllipsisH;
    return <IconButton icon={icon} layout={layout} onClick={onClick} className="text-secondary" />;
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
        case MainSetup.InvoiceStatuses.READY_FOR_KSEF:
            variant = "primary";
            break;
        case MainSetup.InvoiceStatuses.SENT_TO_KSEF:
            variant = "success";
            break;
        case MainSetup.InvoiceStatuses.KSEF_ERROR:
            variant = "danger";
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
        case MainSetup.InvoiceStatuses.CORRECTED:
            variant = "warning";
            textMode = "dark";
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

export function KsefStatusBadge({
    ksefNumber,
    ksefStatus,
}: {
    ksefNumber?: string | null;
    ksefStatus?: string | null;
}) {
    if (ksefNumber) {
        return (
            <OverlayTrigger placement="top" overlay={<Tooltip id="ksef-tooltip">{ksefNumber}</Tooltip>}>
                <Badge bg="success" text="light">
                    ✅ Przyjęta
                </Badge>
            </OverlayTrigger>
        );
    }

    if (ksefStatus === "PENDING") {
        return (
            <Badge bg="warning" text="dark">
                🟡 Wysłana
            </Badge>
        );
    }

    return null;
}

/**
 * SYNC-P2 — FIDman outbox status badge for a contract (see
 * ../../Contracts/ContractsList/Modals/fidmanSyncService.ts). "NONE" (never
 * enqueued, e.g. non-synced contract type) renders nothing.
 */
export function FidmanSyncBadge({
    status,
    tooltip,
}: {
    status?: "NONE" | "PENDING" | "SENT" | "FAILED" | "SKIPPED";
    tooltip?: string | null;
}) {
    if (!status || status === "NONE") return null;

    const byStatus: Record<Exclude<typeof status, "NONE">, { bg: Color; text?: Color; label: string }> = {
        SENT: { bg: "success", text: "light", label: "✅ FIDman: zsynchronizowano" },
        PENDING: { bg: "secondary", text: "light", label: "⏳ FIDman: w trakcie" },
        FAILED: { bg: "danger", text: "light", label: "⚠️ FIDman: synchronizacja do dopchnięcia" },
        SKIPPED: { bg: "warning", text: "dark", label: "🟡 FIDman: brakujące dane" },
    };
    const { bg, text, label } = byStatus[status];
    const badge = (
        <Badge bg={bg} text={text}>
            {label}
        </Badge>
    );
    if (!tooltip) return badge;
    return (
        <OverlayTrigger placement="top" overlay={<Tooltip id="fidman-sync-tooltip">{tooltip}</Tooltip>}>
            {badge}
        </OverlayTrigger>
    );
}

/**
 * Badge typu kontraktu z dwudzielnym językiem wizualnym (decyzja FID.APP.01
 * 2026-07-17 „Czerwony ryczałtowy"). Baza = kolor osi FIDIC (pierwsze słowo nazwy:
 * „Czerwony" → czerwień, „Żółty" → żółć); prawy pasek ~23% = kolor metody rozliczenia,
 * gdy niedomyślna (drugie słowo: „ryczałtowy" na czerwonym → żółty pasek; „obmiarowy"
 * na żółtym → czerwony pasek). Tekst w badge = JEDNO słowo (pierwsze); pełna nazwa w
 * tooltipie. Pasek realizowany 1 regułą CSS (hard-stop linear-gradient), bez nowego
 * komponentu-pliku. Typy spoza osi FIDIC (IK, PT, AQM…) → neutralny badge.
 */
export function ContractTypeBadge({ type }: { type: { name?: string } }) {
    const name = (type?.name ?? "").trim();
    if (!name) return null;
    const RED = "#dc3545";
    const YELLOW = "#ffc107";
    const words = name.split(/\s+/);
    const first = words[0];
    const hasModifier = words.length > 1;
    const base = first === "Czerwony" ? RED : first === "Żółty" ? YELLOW : null;
    const stripe = base === RED ? YELLOW : base === YELLOW ? RED : null;
    const isDark = base === YELLOW; // żółte tło → ciemny tekst
    const style: React.CSSProperties = base
        ? {
              // hard-stop gradient: baza 0–77%, pasek metody rozliczenia 77–100%
              background: hasModifier
                  ? `linear-gradient(90deg, ${base} 0 77%, ${stripe} 77% 100%)`
                  : base,
              color: isDark ? "#212529" : "#fff",
              paddingRight: hasModifier ? "1.4em" : undefined, // tekst nie wchodzi na pasek
          }
        : {};
    const badge = base ? (
        <Badge style={style}>{first}</Badge>
    ) : (
        <Badge bg="secondary" text="light">
            {first}
        </Badge>
    );
    if (!hasModifier) return badge;
    return (
        <OverlayTrigger placement="top" overlay={<Tooltip id="contract-type-tooltip">{name}</Tooltip>}>
            {badge}
        </OverlayTrigger>
    );
}

export function ContractStatusBadge({
    status,
    className,
    style,
}: {
    status: string;
    className?: string;
    style?: React.CSSProperties;
}) {
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
        <Badge bg={variant} text={textMode} className={className} style={style}>
            {status}
        </Badge>
    );
}

export function MilestoneStatusBadge({ status }: { status: string }) {
    let variant;
    let textMode: Color = "light";
    switch (status) {
        case MainSetup.MilestoneStatus.NOT_STARTED:
            variant = "secondary";
            break;
        case MainSetup.MilestoneStatus.IN_PROGRESS:
            variant = "warning";
            textMode = "dark";
            break;
        case MainSetup.MilestoneStatus.FINISHED:
            variant = "success";
            break;
        case MainSetup.MilestoneStatus.ARCHIVAL:
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

export function CaseStatusBadge({ status }: { status: string }) {
    let variant;
    let textMode: Color = "light";
    switch (status) {
        case MainSetup.CaseStatus.FOR_LATER:
            variant = "secondary";
            break;
        case MainSetup.CaseStatus.IN_PROGRESS:
            variant = "warning";
            textMode = "dark";
            break;
        case MainSetup.CaseStatus.CLOSED:
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
        //DECISION_PENDING: 'Składamy czy nie?',
        case MainSetup.OfferStatus.DECISION_PENDING:
            variant = "warning";
            textMode = "dark";
            break;
        case MainSetup.OfferStatus.TO_DO:
            variant = "primary";
            break;
        case MainSetup.OfferStatus.DONE:
            variant = "info";
            break;
        case MainSetup.OfferStatus.AWARDED:
            variant = "success";
            break;
        case MainSetup.OfferStatus.LOST:
            variant = "secondary";
            break;
        case MainSetup.OfferStatus.WITHDRAWN:
            variant = "warning";
            textMode = "dark";
            break;
        case MainSetup.OfferStatus.NOT_INTERESTED:
            variant = "secondary";
            break;
        case MainSetup.OfferStatus.CANCELED:
            variant = "danger";
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

export function OfferBondStatusBadge({ status }: { status: string }) {
    let variant;
    let textMode: Color = "light";

    switch (status) {
        case MainSetup.OfferBondStatus.TO_PAY:
            variant = "primary";
            break;
        case MainSetup.OfferBondStatus.PAID:
            variant = "light";
            textMode = "success";
            break;
        case MainSetup.OfferBondStatus.DONE:
            variant = "info";
            break;
        case MainSetup.OfferBondStatus.TO_RENEW:
            variant = "danger";
            break;
        case MainSetup.OfferBondStatus.TO_BE_RETURNED:
            variant = "warning";
            break;
        case MainSetup.OfferBondStatus.RETURNED:
            variant = "success";
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

export function OfferInvitationMailStatusBadge({ status }: { status: string }) {
    let variant;
    let textMode: Color = "light";

    switch (status) {
        case MainSetup.OfferInvitationMailStatus.NEW:
            variant = "warning";
            textMode = "dark";
            break;
        case MainSetup.OfferInvitationMailStatus.TO_OFFER:
            variant = "danger";
            break;
        case MainSetup.OfferInvitationMailStatus.DONE:
            variant = "success";
            break;
        case MainSetup.OfferInvitationMailStatus.REJECTED:
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

export function ApplicationCallStatusBadge({ status }: { status: string }) {
    let variant;
    let textMode: Color = "light";
    switch (status) {
        case MainSetup.ApplicationCallStatus.CLOSED:
            variant = "secondary";
            break;
        case MainSetup.ApplicationCallStatus.OPEN:
            variant = "danger";
            break;
        case MainSetup.ApplicationCallStatus.SCHEDULED:
            variant = "warning";
            textMode = "dark";
            break;
        case MainSetup.ApplicationCallStatus.UNKOWN:
            variant = "light";
            textMode = "dark";
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

export function ClientNeedStatusBadge({ status }: { status: string }) {
    let variant;
    let textMode: Color = "light"; // Default text mode to light for better contrast on darker badges

    // Determine badge color and text color based on the status
    switch (status) {
        case MainSetup.ClientNeedStatus.URGENT:
            variant = "danger"; // Red indicates urgency
            break;
        case MainSetup.ClientNeedStatus.IMPORTANT:
            variant = "warning"; // Orange indicates importance
            textMode = "dark";
            break;
        case MainSetup.ClientNeedStatus.NICE_TO_HAVE:
            variant = "info"; // Blue indicates a nice to have but not critical
            break;
        case MainSetup.ClientNeedStatus.FOR_LATER:
            variant = "secondary"; // Grey indicates low priority
            break;
        case MainSetup.ClientNeedStatus.NOT_ACTUAL:
            variant = "dark"; // Dark to signify it's no longer relevant
            textMode = "light";
            break;
        default:
            variant = "light"; // Light for unknown or default status
            textMode = "dark";
            break;
    }

    // Return the Badge component with the appropriate styling
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
export function LetterStatusBadge({ status }: { status: string }) {
    let variant;
    let textMode: Color = "light";

    switch (status) {
        case MainSetup.OurLetterStatus.CREATED:
            variant = "secondary";
            break;
        case MainSetup.OurLetterStatus.TO_CORRECT:
            variant = "warning";
            textMode = "dark";
            break;
        case MainSetup.OurLetterStatus.CHANGED:
            variant = "info";
            break;
        case MainSetup.OurLetterStatus.APPROVED:
            variant = "success";
            break;
        case MainSetup.OurLetterStatus.SENT:
            variant = "primary";
            break;
        case MainSetup.IncomingLetterStatus.REGISTERED:
            variant = "secondary";
            break;
        case MainSetup.IncomingLetterStatus.RESPONSE_SENT:
            variant = "success";
            break;
        case MainSetup.IncomingLetterStatus.RESPONSE_REQUIRED:
            variant = "danger";
            break;
        case MainSetup.IncomingLetterStatus.NO_RESPONSE_REQUIRED:
            variant = "info";
            break;
        default:
            variant = "light";
            textMode = "dark";
            break;
    }

    return (
        <Badge bg={variant} text={textMode}>
            {status}
        </Badge>
    );
}
