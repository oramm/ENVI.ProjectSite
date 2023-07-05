import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Spinner, Alert, Badge } from "react-bootstrap";
import 'react-bootstrap-typeahead/css/Typeahead.css';
import GDFolderIcon from '../../Resources/View/Google-Drive-icon.png';
import GDDocFileIcon from '../../Resources/View/Google-Docs-icon.png';
import '../../Css/styles.css';
import MainSetup from '../../React/MainSetupReact';
import { Color } from 'react-bootstrap/esm/types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCopy, faBars } from '@fortawesome/free-solid-svg-icons';

export function ProgressBar() {
    return (
        <progress style={{ height: "5px" }} />
    );
}

export function SpinnerBootstrap() {
    return (
        <Spinner
            animation="border"
            variant="success"
        />
    );
}

export type AlertType = 'success' | 'danger' | 'warning' | 'info';

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
    layout?: 'horizontal' | 'vertical';
    folderUrl: string;
}

export function GDFolderIconLink({ folderUrl, layout = 'vertical' }: IconProps) {
    const className = layout === 'vertical' ? 'icon icon-vertical' : 'icon icon-horizontal';
    return (
        <a href={folderUrl} target="_blank">
            <img src={GDFolderIcon} alt="Dysk Google" className={className} />
        </a>
    );
}

export function CopyIconLink({ folderUrl, layout = 'vertical' }: IconProps) {
    const className = layout === 'vertical' ? 'icon icon-vertical' : 'icon icon-horizontal';

    return (
        <a href={folderUrl} target="_blank" rel="noopener noreferrer">
            <FontAwesomeIcon icon={faCopy} className={className} />
        </a>
    );
}

export function MenuIconLink({ folderUrl, layout = 'vertical' }: IconProps) {
    const className = layout === 'vertical' ? 'icon icon-vertical' : 'icon icon-horizontal';
    return (
        <a href={folderUrl} target="_blank" rel="noopener noreferrer">
            <FontAwesomeIcon icon={faBars} className={className} />
        </a>
    );
}

export function GDDocFileIconLink({ folderUrl, layout = 'vertical' }: IconProps) {
    const className = layout === 'vertical' ? 'icon icon-vertical' : 'icon icon-horizontal';
    return (
        <a href={folderUrl} target="_blank">
            <img src={GDDocFileIcon} alt="Dysk Google" className={className} />
        </a>
    );
}

export function InvoiceStatusBadge({ status }: { status: string }) {
    let variant;
    let textMode: Color = 'light';
    switch (status) {
        case MainSetup.InvoiceStatuses.FOR_LATER:
            variant = 'light';
            textMode = 'dark';
            break;
        case MainSetup.InvoiceStatuses.TO_DO:
            variant = 'primary';
            break;
        case MainSetup.InvoiceStatuses.DONE:
            variant = 'warning';
            textMode = 'dark';
            break;
        case MainSetup.InvoiceStatuses.SENT:
            variant = 'info';
            break;
        case MainSetup.InvoiceStatuses.PAID:
            variant = 'success';
            break;
        case MainSetup.InvoiceStatuses.TO_CORRECT:
            variant = 'danger';
            break;
        case MainSetup.InvoiceStatuses.WITHDRAWN:
            variant = 'dark';
            break;
        default:
            variant = 'secondary';
    }

    return (
        <Badge bg={variant} text={textMode}>
            {status}
        </Badge>
    );
}

export function ContractStatusBadge({ status }: { status: string }) {
    let variant;
    let textMode: Color = 'light';
    switch (status) {
        case MainSetup.ContractStatuses.NOT_STARTED:
            variant = 'secondary';
            break;
        case MainSetup.ContractStatuses.IN_PROGRESS:
            variant = 'warning';
            textMode = 'dark';
            break;
        case MainSetup.ContractStatuses.FINISHED:
            variant = 'success';
            break;
        case MainSetup.ContractStatuses.ARCHIVAL:
            variant = 'dark';
            break;
        default:
            variant = 'secondary';
    }

    return (
        <Badge bg={variant} text={textMode}>
            {status}
        </Badge>
    );
}

export function TaskStatusBadge({ status }: { status: string }) {
    let variant;
    let textMode: Color = 'light';
    switch (status) {
        case MainSetup.TaskStatuses.BACKLOG:
            variant = 'light';
            textMode = 'dark';
            break;
        case MainSetup.TaskStatuses.NOT_STARTED:
            variant = 'secondary';
            break;
        case MainSetup.TaskStatuses.IN_PROGRESS:
            variant = 'warning';
            textMode = 'dark';
            break;
        case MainSetup.TaskStatuses.TO_CORRECT:
            variant = 'danger';
            break;
        case MainSetup.TaskStatuses.AWAITING_RESPONSE:
            variant = 'info';
            break;
        case MainSetup.TaskStatuses.DONE:
            variant = 'success';
            break;
        default:
            variant = 'secondary';
    }

    return (
        <Badge bg={variant} text={textMode}>
            {status}
        </Badge>
    );
}