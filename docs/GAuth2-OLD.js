"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var GAuth2 = /** @class */ (function () {
    function GAuth2() {
        this.initParams = {
            discoveryDocs: DISCOVERY_DOCS,
            clientId: CLIENT_ID,
            scope: SCOPES,
            immediate: false
        };
    }
    /**
     *  On load, called to load the auth2 library and API client library on the main window.
     */
    GAuth2.prototype.handleClientLoadMainWindow = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _this_1 = this;
            return __generator(this, function (_a) {
                gapi.load('client:auth2', function () { return _this_1.initClientMainWindow(_this_1); });
                return [2 /*return*/];
            });
        });
    };
    /**
     *  On load, called to load the auth2 library and API client library on sub windows.
     *  Wywoływana na końcu sekcji body właściwego pliku index.html
     *  @param {object} windowControler zawiera funkcję main() z logiką inijcjowania repozytoriów
     */
    GAuth2.prototype.handleClientLoad = function (windowController) {
        return __awaiter(this, void 0, void 0, function () {
            var _this_1 = this;
            return __generator(this, function (_a) {
                gapi.load('client:auth2', function () { return _this_1.initClient(_this_1, windowController); });
                return [2 /*return*/];
            });
        });
    };
    /**
     *  Initializes the API client library and sets up sign-in state
     *  listeners.
     */
    GAuth2.prototype.initClientMainWindow = function (_this) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        (_this == undefined) ? _this = this : true;
                        return [4 /*yield*/, gapi.client.init(_this.initParams)
                            // Listen for sign-in state changes.
                        ];
                    case 1:
                        _a.sent();
                        // Listen for sign-in state changes.
                        gapi.auth2.getAuthInstance().isSignedIn.listen(_this.updateSigninStatus);
                        // Handle the initial sign-in state.
                        _this.updateSigninStatus(gapi.auth2.getAuthInstance().isSignedIn.get());
                        return [2 /*return*/];
                }
            });
        });
    };
    GAuth2.prototype.initClient = function (_this, windowController) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        (_this == undefined) ? _this = this : true;
                        return [4 /*yield*/, gapi.client.init(_this.initParams)];
                    case 1:
                        _a.sent();
                        windowController.main();
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     *  Called only in main Window
     *  Called when the signed in status changes, to update the UI
     *  appropriately. After a sign-in, the API is called.
     */
    GAuth2.prototype.updateSigninStatus = function (isSignedIn) {
        return __awaiter(this, void 0, void 0, function () {
            var _this, mainController, loginButton;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _this = this;
                        if (!isSignedIn) return [3 /*break*/, 2];
                        return [4 /*yield*/, _this.onSignIn(gapi.auth2.getAuthInstance().currentUser.get())];
                    case 1:
                        _a.sent();
                        mainController = new MainController();
                        mainController.main();
                        return [3 /*break*/, 3];
                    case 2:
                        $("#content").hide();
                        $("#authorize-div").show();
                        loginButton = new RaisedButton('Zaloguj się', function () { return _this.handleAuthClick(event); }).$dom;
                        $("#authorize-div .row").append(loginButton);
                        _a.label = 3;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /*
     * https://developers.google.com/identity/sign-in/web/sign-in
     * @param {type} googleUser - gapi.auth2.getAuthInstance().currentUser.get().getBasicProfile()
     */
    GAuth2.prototype.onSignIn = function (googleUser) {
        return __awaiter(this, void 0, void 0, function () {
            var profile, id_token, myHeaders, result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        profile = googleUser.getBasicProfile();
                        MainSetup.currentUser = {
                            name: profile.getGivenName(),
                            surname: profile.getFamilyName(),
                            systemEmail: profile.getEmail(),
                            googleImage: profile.getImageUrl(),
                            googleId: profile.getId() // Do not send to your backend! Use an ID token instead.
                        };
                        id_token = googleUser.getAuthResponse().id_token;
                        myHeaders = new Headers();
                        myHeaders.append("Content-Type", "application/json");
                        return [4 /*yield*/, fetch(MainSetup.serverUrl + 'login', {
                                method: 'POST',
                                headers: myHeaders,
                                credentials: 'include',
                                body: JSON.stringify({ id_token: id_token })
                            })];
                    case 1:
                        result = _a.sent();
                        return [4 /*yield*/, result.text()];
                    case 2:
                        result = _a.sent();
                        console.log(result);
                        console.log('ID: ' + MainSetup.currentUser.googleId); // Do not send to your backend! Use an ID token instead.
                        console.log('Name: ' + MainSetup.currentUser.name);
                        console.log('Image URL: ' + MainSetup.currentUser.googleImage);
                        console.log('Email: ' + MainSetup.currentUser.systemEmail); // This is null if the 'email' scope is not present.
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     *  Sign in the user upon button click.
     */
    GAuth2.prototype.handleAuthClick = function (event) {
        gapi.auth2.getAuthInstance().signIn()
            //dodano na podsktawie:https://stackoverflow.com/questions/45624572/detect-error-popup-blocked-by-browser-for-google-auth2-in-javascript
            .then(function () { }, function (error) {
            if (error)
                alert('Odblokuj wyskakujące okienko, żeby się zalogować (w pasku adresu na górze)\n\n' +
                    'Ten komunikat wyświetla z jednej z poniższych przyczyn:\n' +
                    ' 1. Wylogowałeś(łaś) się konta Google\n' +
                    ' 2. System został gruntownie zaktualizowany i wymaga Twoich zgód aby Ci nadal służyć');
        });
    };
    /**
     *  Sign out the user upon button click.
     */
    GAuth2.prototype.handleSignoutClick = function (event) {
        alert("pa pa");
        gapi.auth2.getAuthInstance().signOut();
    };
    return GAuth2;
}());
