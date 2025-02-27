"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GAuth = void 0;
const MainSetupReact_1 = __importDefault(require("./MainSetupReact"));
const index_1 = require("./MainWindow/index");
class GAuth {
    static async mainWindowInitialise() {
        await google.accounts.id.initialize({
            client_id: MainSetupReact_1.default.CLIENT_ID,
            callback: this.mainWindowLoadHandler,
        });
        // Display the One Tap prompt
        google.accounts.id.prompt();
        // Display the Sign In With Google Button
        google.accounts.id.renderButton(document.getElementById("buttonDiv"), { theme: 'outline', size: 'large' });
    }
    static async mainWindowLoadHandler(response) {
        console.log("Encoded JWT ID token: %o", response);
        try {
            const myHeaders = new Headers();
            myHeaders.append("Content-Type", "application/json");
            const rawResult = await fetch(MainSetupReact_1.default.serverUrl + 'login', {
                method: 'POST',
                headers: myHeaders,
                credentials: 'include',
                body: JSON.stringify({ id_token: response.credential })
            });
            const result = await rawResult.json();
            console.log(result);
            MainSetupReact_1.default.currentUser = result.userData;
            console.log('Name: ' + MainSetupReact_1.default.currentUser.userName);
            console.log('Email: ' + MainSetupReact_1.default.currentUser.systemEmail); // This is null if the 'email' scope is not present.
            (0, index_1.renderApp)();
        }
        catch (error) {
            if (error instanceof Error) {
                alert(error.message);
                console.error(error);
            }
        }
    }
    /**
     *  On load, called to load the auth2 library and API client library on sub windows.
     *  Wywoływana na końcu sekcji body właściwego pliku index.html
     *  @param {object} windowController zawiera funkcję main() z logiką inijcjowania repozytoriów
     */
    static async handleClientLoad(windowController) {
        windowController.main();
    }
}
exports.GAuth = GAuth;
