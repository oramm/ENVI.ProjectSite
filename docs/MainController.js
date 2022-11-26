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
var MainController = /** @class */ (function () {
    function MainController() {
    }
    MainController.main = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                try {
                    // Hide auth UI, then load client library.
                    mainWindowView = new MainWindowView();
                    mainWindowView.loadIframe("iframeMain", 'Dashboard/dashboard.html');
                    $("#authorize-div").hide();
                    mainWindowView.dataLoaded(false);
                    //signoutButton.style.display = 'block';
                    MainSetup.projectsRepositoryLocalData = new SimpleRepository({
                        name: 'Projects repository',
                        actionsNodeJSSetup: { addNewRoute: 'project', editRoute: 'project', deleteRoute: 'project' },
                    });
                    MainSetup.contractTypesRepositoryLocalData = new SimpleRepository('ContractTypes repository');
                    MainSetup.caseTypesRepositoryLocaData = new SimpleRepository('CaseTypes repository', 'addNewCaseType', 'editCaseType', 'deleteCaseType');
                    MainSetup.personsRepositoryLocalData = new SimpleRepository('Persons repository', 'addNewPersonInDb', 'editPersonInDb', 'deletePerson');
                    //inicjowana po wyborze projketu w MainWindowView.onProjectChosen
                    MainSetup.personsPerProjectRepositoryLocalData = new SimpleRepository('PersonsPerProject repository');
                    MainSetup.personsEnviRepositoryLocalData = new SimpleRepository('PersonsEnvi repository');
                    MainSetup.entitiesRepositoryLocalData = new SimpleRepository('Entities repository', 'addNewEntityInDb', 'editEntityInDb', 'deleteEntity');
                    MainSetup.documentTemplatesRepositoryLocalData = new SimpleRepository('DocumentTemplates repository');
                    MainSetup.personsRepositoryLocalData.initialiseNodeJS('persons/');
                    MainSetup.personsEnviRepositoryLocalData.initialiseNodeJS('persons/?systemRoleName=ENVI_EMPLOYEE|ENVI_MANAGER');
                    MainSetup.entitiesRepositoryLocalData.initialiseNodeJS('entities/');
                    MainSetup.documentTemplatesRepositoryLocalData.initialiseNodeJS('documentTemplates/');
                    MainSetup.contractTypesRepositoryLocalData.initialiseNodeJS('contractTypes/?status=ACTIVE');
                    MainSetup.projectsRepositoryLocalData.initialiseNodeJS('projects/' + MainSetup.currentUser.systemEmail)
                        .then(function () {
                        console.log("Projects initialised");
                        mainWindowView.initialise();
                        mainWindowView.dataLoaded(true);
                        iFrameResize({ log: false, heightCalculationMethod: 'taggedElement', checkOrigin: false });
                    })
                        .catch(function (err) {
                        console.error(err);
                    });
                }
                catch (error) {
                    console.error(error);
                    alert(error.message || error);
                }
                return [2 /*return*/];
            });
        });
    };
    return MainController;
}());
