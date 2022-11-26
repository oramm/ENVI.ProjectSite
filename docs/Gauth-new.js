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
var GAuth = /** @class */ (function () {
    function GAuth() {
    }
    GAuth.mainWindowInitialise = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, google.accounts.id.initialize({
                            client_id: CLIENT_ID,
                            callback: this.mainWindowLoadHandler,
                        })];
                    case 1:
                        _a.sent();
                        // Display the One Tap prompt
                        google.accounts.id.prompt();
                        // Display the Sign In With Google Button
                        google.accounts.id.renderButton(document.getElementById("buttonDiv"), { theme: 'outline', size: 'large' });
                        return [2 /*return*/];
                }
            });
        });
    };
    GAuth.mainWindowLoadHandler = function (response) {
        return __awaiter(this, void 0, void 0, function () {
            var myHeaders, result, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        console.log("Encoded JWT ID token: %o", response);
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 4, , 5]);
                        myHeaders = new Headers();
                        myHeaders.append("Content-Type", "application/json");
                        return [4 /*yield*/, fetch(MainSetup.serverUrl + 'login', {
                                method: 'POST',
                                headers: myHeaders,
                                credentials: 'include',
                                body: JSON.stringify({ id_token: response.credential })
                            })];
                    case 2:
                        result = _a.sent();
                        return [4 /*yield*/, result.text()];
                    case 3:
                        result = _a.sent();
                        console.log(result);
                        MainSetup.currentUser = JSON.parse(result).userData;
                        console.log('Name: ' + MainSetup.currentUser.name);
                        console.log('Email: ' + MainSetup.currentUser.systemEmail); // This is null if the 'email' scope is not present.
                        MainController.main();
                        return [3 /*break*/, 5];
                    case 4:
                        error_1 = _a.sent();
                        alert(error_1.message);
                        console.error(error_1);
                        return [3 /*break*/, 5];
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    /**
     *  On load, called to load the auth2 library and API client library on sub windows.
     *  Wywoływana na końcu sekcji body właściwego pliku index.html
     *  @param {object} windowControler zawiera funkcję main() z logiką inijcjowania repozytoriów
     */
    GAuth.handleClientLoad = function (windowController) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                windowController.main();
                return [2 /*return*/];
            });
        });
    };
    return GAuth;
}());
