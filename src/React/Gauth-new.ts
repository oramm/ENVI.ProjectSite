import MainSetup from "./MainSetupReact";
import { renderApp } from "./MainWindow/index";

declare const google: any;

export class GAuth {
    static async mainWindowInitialise(): Promise<void> {
        await google.accounts.id.initialize({
            client_id: MainSetup.CLIENT_ID,
            callback: this.mainWindowLoadHandler,
        });

        // Display the One Tap prompt
        google.accounts.id.prompt();

        // Display the Sign In With Google Button
        google.accounts.id.renderButton(
            document.getElementById("buttonDiv"),
            { theme: 'outline', size: 'large' }
        );
    }

    static async mainWindowLoadHandler(response: any): Promise<void> {
        console.log("Encoded JWT ID token: %o", response);

        try {
            const myHeaders = new Headers();
            myHeaders.append("Content-Type", "application/json");

            const rawResult = await fetch(MainSetup.serverUrl + 'login', {
                method: 'POST',
                headers: myHeaders,
                credentials: 'include',
                body: JSON.stringify({ id_token: response.credential })
            })
            const result = await rawResult.json();

            console.log(result);
            MainSetup.currentUser = result.userData;
            console.log('Name: ' + MainSetup.currentUser.userName);
            console.log('Email: ' + MainSetup.currentUser.systemEmail); // This is null if the 'email' scope is not present.
            renderApp();
        } catch (error) {
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
    static async handleClientLoad(windowController: { main: () => void }): Promise<void> {
        windowController.main();
    }
}
