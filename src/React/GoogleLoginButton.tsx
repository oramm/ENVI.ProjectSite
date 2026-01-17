import React from 'react';
import { GoogleLogin } from '@react-oauth/google';
import MainSetup from './MainSetupReact';

interface Props {
    onServerResponse: (response: any) => void;
}

export default function GoogleButton({ onServerResponse }: Props) {

    async function handleSuccess(credentialResponse: any) {
        const id_token = credentialResponse.credential;

        const response = await fetch(MainSetup.serverUrl + 'login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ id_token }),
        });
        const responseData = await response.json();
        MainSetup.currentUser = responseData.userData;
        onServerResponse(responseData);
    };

    // DEV MODE: Mock login for Playwright/testing (only in development with ENABLE_DEV_LOGIN=true)
    const isDevLoginEnabled = process.env.ENABLE_DEV_LOGIN === 'true';

    async function handleDevLogin() {
        console.warn('🔧 DEV MODE: Using mock authentication');
        const response = await fetch(MainSetup.serverUrl + 'login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({
                dev_mode: true,
                mock_user: 'playwright_test_user'
            }),
        });
        const responseData = await response.json();
        MainSetup.currentUser = responseData.userData;
        onServerResponse(responseData);
    };

    if (isDevLoginEnabled) {
        return (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <GoogleLogin
                    onSuccess={handleSuccess}
                    onError={() => console.log('Login Failed')}
                />
                <button
                    onClick={handleDevLogin}
                    style={{
                        padding: '10px',
                        backgroundColor: '#ff9800',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontWeight: 'bold'
                    }}
                >
                    🔧 DEV: Mock Login (Playwright)
                </button>
            </div>
        );
    }

    return (
        <GoogleLogin
            onSuccess={handleSuccess}
            onError={() => console.log('Login Failed')}
        />
    );
}