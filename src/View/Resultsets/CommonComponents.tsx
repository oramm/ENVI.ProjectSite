import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Spinner, Alert } from "react-bootstrap";
import 'react-bootstrap-typeahead/css/Typeahead.css';
import GDFolderIcon from '../../Resources/View/Google-Drive-icon.png';
import GDDocFileIcon from '../../Resources/View/Google-Docs-icon.png';
import '../../Css/styles.css';

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