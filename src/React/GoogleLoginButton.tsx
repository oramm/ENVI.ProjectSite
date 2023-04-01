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

    return (
        <GoogleLogin
            onSuccess={handleSuccess}
            onError={() => console.log('Login Failed')}
        />
    );
}