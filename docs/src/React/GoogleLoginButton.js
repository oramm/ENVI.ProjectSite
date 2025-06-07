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
    return (react_1.default.createElement(google_1.GoogleLogin, { onSuccess: handleSuccess, onError: () => console.log('Login Failed') }));
}
exports.default = GoogleButton;
