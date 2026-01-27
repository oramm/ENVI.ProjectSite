"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importDefault(require("react"));
const google_1 = require("@react-oauth/google");
const MainSetupReact_1 = __importDefault(require("./MainSetupReact"));
function GoogleButton({ onServerResponse }) {
    async function handleSuccess(credentialResponse) {
        const id_token = credentialResponse.credential;
        const response = await fetch(MainSetupReact_1.default.serverUrl + 'login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ id_token }),
        });
        const responseData = await response.json();
        MainSetupReact_1.default.currentUser = responseData.userData;
        onServerResponse(responseData);
    }
    ;
    // DEV MODE: Mock login for Playwright/testing (only in development with ENABLE_DEV_LOGIN=true)
    const isDevLoginEnabled = process.env.ENABLE_DEV_LOGIN === 'true';
    async function handleDevLogin() {
        console.warn('🔧 DEV MODE: Using mock authentication');
        const response = await fetch(MainSetupReact_1.default.serverUrl + 'login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({
                dev_mode: true,
                mock_user: 'playwright_test_user'
            }),
        });
        const responseData = await response.json();
        MainSetupReact_1.default.currentUser = responseData.userData;
        onServerResponse(responseData);
    }
    ;
    if (isDevLoginEnabled) {
        return (react_1.default.createElement("div", { style: { display: 'flex', flexDirection: 'column', gap: '10px' } },
            react_1.default.createElement(google_1.GoogleLogin, { onSuccess: handleSuccess, onError: () => console.log('Login Failed') }),
            react_1.default.createElement("button", { onClick: handleDevLogin, style: {
                    padding: '10px',
                    backgroundColor: '#ff9800',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontWeight: 'bold'
                } }, "\uD83D\uDD27 DEV: Mock Login (Playwright)")));
    }
    return (react_1.default.createElement(google_1.GoogleLogin, { onSuccess: handleSuccess, onError: () => console.log('Login Failed') }));
}
exports.default = GoogleButton;
