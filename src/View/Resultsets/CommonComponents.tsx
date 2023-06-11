import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Spinner, Alert, Badge } from "react-bootstrap";
import 'react-bootstrap-typeahead/css/Typeahead.css';
import GDFolderIcon from '../../Resources/View/Google-Drive-icon.png';
import GDDocFileIcon from '../../Resources/View/Google-Docs-icon.png';
import '../../Css/styles.css';
import MainSetup from '../../React/MainSetupReact';
import { Color } from 'react-bootstrap/esm/types';

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


export function GDFolderIconLink({ folderUrl }: { folderUrl: string }) {
    return (
        <a href={folderUrl} target="_blank">
            <img src={GDFolderIcon} alt="Dysk Google" className='icon-vertical' />
        </a>
    );
}

export function GDDocFileIconLink({ folderUrl }: { folderUrl: string }) {
    return (
        <a href={folderUrl} target="_blank">
            <img src={GDDocFileIcon} alt="Dysk Google" className='icon-vertical' />
        </a>
    );
}

export function InvoiceStatusBadge({ status }: { status: string }) {
    let variant;
    let textMode: Color = 'light';
    switch (status) {
        case MainSetup.invoiceStatusNames[0]: //'Na później'
            variant = 'light';
            textMode = 'dark';
            break;
        case MainSetup.invoiceStatusNames[1]: //'Do zrobienia'
            variant = 'primary';
            break;
        case MainSetup.invoiceStatusNames[2]: //'Zrobiona'
            variant = 'warning';
            textMode = 'dark';
            break;
        case MainSetup.invoiceStatusNames[3]: //'Wysłana'
            variant = 'info';
            break;
        case MainSetup.invoiceStatusNames[4]: //'Zapłacona'
            variant = 'success';
            break;
        case MainSetup.invoiceStatusNames[5]: //'Do korekty'
            variant = 'danger';
            break;
        case MainSetup.invoiceStatusNames[6]: //'Wycofana'
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
        case MainSetup.contractStatusNames[0]: //'Na później'
            variant = 'light';
            textMode = 'dark';
            break;
        case MainSetup.contractStatusNames[1]: //'Do zrobienia'
            variant = 'primary';
            break;
        case MainSetup.contractStatusNames[2]: //'Zrobiona'
            variant = 'warning';
            textMode = 'dark';
            break;
        case MainSetup.contractStatusNames[3]: //'Wysłana'
            variant = 'info';
            break;
        case MainSetup.contractStatusNames[4]: //'Zapłacona'
            variant = 'success';
            break;
        case MainSetup.contractStatusNames[5]: //'Do korekty'
            variant = 'danger';
            break;
        case MainSetup.contractStatusNames[6]: //'Wycofana'
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
        case MainSetup.taskStatusNames[0]: //'Backlog'
            variant = 'light';
            textMode = 'dark';
            break;
        case MainSetup.taskStatusNames[1]: //'Nie rozpoczęty'
            variant = 'secondary';
            break;
        case MainSetup.taskStatusNames[2]: //'W trakcie'
            variant = 'warning';
            textMode = 'dark';
            break;
        case MainSetup.taskStatusNames[3]: //'Do poprawy'
            variant = 'danger';
            break;
        case MainSetup.taskStatusNames[4]: //'Oczekiwanie na odpowiedź'
            variant = 'info';
            break;
        case MainSetup.taskStatusNames[5]: //'Zrobione'
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