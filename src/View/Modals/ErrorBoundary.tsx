import React, { useEffect, useReducer } from 'react';

interface ErrorBoundaryProps {
    children: React.ReactNode;
    fallback?: React.ReactNode;
}

const defaultFallback = <h1>Wystąpił błąd.</h1>;

interface State {
    error: Error | null;
}

type Action = { type: 'SET_ERROR'; payload: Error } | { type: 'RESET_ERROR' };

function reducer(state: State, action: Action): State {
    switch (action.type) {
        case 'SET_ERROR':
            return { error: action.payload };
        case 'RESET_ERROR':
            return { error: null };
        default:
            return state;
    }
}

export default function ErrorBoundary({ children, fallback = defaultFallback }: ErrorBoundaryProps) {
    const [{ error }, dispatch] = useReducer(reducer, { error: null });

    useEffect(() => {
        if (error) {
            console.error(error);
        }
    }, [error]);

    useEffect(() => {
        const handleUncaughtError = (e: ErrorEvent) => {
            dispatch({ type: 'SET_ERROR', payload: e.error });
        };

        window.addEventListener('error', handleUncaughtError);

        return () => {
            window.removeEventListener('error', handleUncaughtError);
        };
    }, []);

    if (error) {
        return <>{fallback}</>;
    }

    return <React.Fragment>{children}</React.Fragment>;
}
