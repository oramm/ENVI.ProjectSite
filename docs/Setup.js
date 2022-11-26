"use strict";
// Your Client ID can be retrieved from your project in the Google
// Developer Console, https://console.developers.google.com
//const CLIENT_ID = '386403657277-21tus25hgaoe7jdje73plc2qbgakht05.apps.googleusercontent.com'; //ENVI
var CLIENT_ID = '386403657277-9mh2cnqb9dneoh8lc6o2m339eemj24he.apps.googleusercontent.com'; //ENVI - nowy test
// Set to client ID and API key from the Developer Console
var API_KEY = 'AIzaSyC4Arjx-IGEQ1Sj99P_Om4B_dg7D7p2kPg';
var SCRIPT_ID = 'M1jCQxOsMBQ_tbMmqjqqAx23ed1cy4zrK'; //ENVI
// Array of API discovery doc URLs for APIs used by the quickstart
var DISCOVERY_DOCS = [
    'https://script.googleapis.com/$discovery/rest?version=v1',
    'https://www.googleapis.com/discovery/v1/apis/drive/v3/rest'
];
// Authorization scopes required by the API; multiple scopes can be
// included, separated by spaces.
SCOPES = 'https://www.google.com/calendar/feeds ' +
    'https://www.googleapis.com/auth/documents ' +
    'https://www.googleapis.com/auth/drive ' +
    'https://www.googleapis.com/auth/script.external_request ' +
    'https://www.googleapis.com/auth/spreadsheets ' +
    'https://www.googleapis.com/auth/userinfo.email ' +
    'https://www.googleapis.com/auth/userinfo.profile ';
var mainWindowView;
var MainSetup = /** @class */ (function () {
    function MainSetup() {
    }
    Object.defineProperty(MainSetup, "currentUser", {
        get: function () {
            return JSON.parse(sessionStorage.getItem('Current User'));
        },
        set: function (data) {
            sessionStorage.setItem('Current User', JSON.stringify(data));
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(MainSetup, "currentProject", {
        get: function () {
            return JSON.parse(sessionStorage.getItem('Projects repository')).currentItemLocalData;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(MainSetup, "currentContract", {
        get: function () {
            return JSON.parse(sessionStorage.getItem('Contracts repository')).currentItemLocalData;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(MainSetup, "projectsRepository", {
        //getterów nie używać w klasie inicjującej ten MainSetup z bazy
        get: function () {
            if (MainSetup.projectsRepositoryLocalData)
                console.log('### true: MainSetup.projectsRepositoryLocalData: ');
            if (!MainSetup.projectsRepositoryLocalData) {
                MainSetup.projectsRepositoryLocalData = new SimpleRepository(JSON.parse(sessionStorage.getItem('Projects repository')));
            }
            return MainSetup.projectsRepositoryLocalData;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(MainSetup, "entitiesRepository", {
        //getterów nie używać w klasie inicjującej ten MainSetup z bazy
        get: function () {
            if (!MainSetup.entitiesRepositoryLocalData)
                MainSetup.entitiesRepositoryLocalData = new SimpleRepository(JSON.parse(sessionStorage.getItem('Entities repository')));
            return MainSetup.entitiesRepositoryLocalData;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(MainSetup, "personsRepository", {
        //getterów nie używać w klasie inicjującej ten MainSetup z bazy
        get: function () {
            if (!MainSetup.personsRepositoryLocalData)
                MainSetup.personsRepositoryLocalData = new SimpleRepository(JSON.parse(sessionStorage.getItem('Persons repository')));
            return MainSetup.personsRepositoryLocalData;
        },
        set: function (data) {
            MainSetup.personsRepositoryLocalData = data;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(MainSetup, "personsPerProjectRepository", {
        //getterów nie używać w klasie inicjującej ten MainSetup z bazy
        get: function () {
            if (!MainSetup.personsPerProjectRepositoryLocalData)
                MainSetup.personsPerProjectRepositoryLocalData = new SimpleRepository(JSON.parse(sessionStorage.getItem('PersonsPerProject repository')));
            return MainSetup.personsPerProjectRepositoryLocalData;
        },
        set: function (data) {
            MainSetup.personsPerProjectRepositoryLocalData = data;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(MainSetup, "personsEnviRepository", {
        //getterów nie używać w klasie inicjującej ten MainSetup z bazy
        get: function () {
            if (!MainSetup.personsEnviRepositoryLocalData)
                MainSetup.personsEnviRepositoryLocalData = new SimpleRepository(JSON.parse(sessionStorage.getItem('PersonsEnvi repository')));
            return MainSetup.personsEnviRepositoryLocalData;
        },
        set: function (data) {
            MainSetup.personsEnviRepositoryLocalData = data;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(MainSetup, "documentTemplatesRepository", {
        //getterów nie używać w klasie inicjującej ten MainSetup z bazy
        get: function () {
            if (!MainSetup.documentTemplatesRepositoryLocalData)
                MainSetup.documentTemplatesRepositoryLocalData = new SimpleRepository(JSON.parse(sessionStorage.getItem('DocumentTemplates repository')));
            return MainSetup.documentTemplatesRepositoryLocalData;
        },
        set: function (data) {
            MainSetup.documentTemplatesRepositoryLocalData = data;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(MainSetup, "contractTypesRepository", {
        //getterów nie używać w klasie inicjującej ten MainSetup z bazy
        get: function () {
            if (!MainSetup.contractTypesRepositoryLocalData)
                MainSetup.contractTypesRepositoryLocalData = new SimpleRepository(JSON.parse(sessionStorage.getItem('ContractTypes repository')));
            return MainSetup.contractTypesRepositoryLocalData;
        },
        set: function (data) {
            MainSetup.contractTypesRepositoryLocalData = data;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(MainSetup, "caseTypesRepository", {
        //getterów nie używać w klasie inicjującej ten MainSetup z bazy
        get: function () {
            if (!MainSetup.caseTypesRepositoryLocalData)
                MainSetup.caseTypesRepositoryLocalData = new SimpleRepository(JSON.parse(sessionStorage.getItem('CaseTypes repository')));
            return MainSetup.caseTypesRepositoryLocalData;
        },
        set: function (data) {
            MainSetup.caseTypesRepositoryLocalData = data;
        },
        enumerable: false,
        configurable: true
    });
    MainSetup.GApi = {
        tokenClient: null //klient dla skryptu Kontakty ENVI - Gsheet
    };
    MainSetup.serverUrl = (window.location.href.includes('localhost')) ? 'http://localhost:3000/' : 'https://erp-envi.herokuapp.com/';
    MainSetup.datePickerSettings = {
        selectMonths: true,
        selectYears: 15,
        showWeekdaysShort: true,
        monthsFull: ['styczeń', 'luty', 'marzec', 'kwiecień', 'maj', 'czerwiec', 'lipiec', 'sierpień', 'wrzesień', 'październik', 'listopad', 'grudzień'],
        monthsShort: ['sty', 'lut', 'mar', 'kwi', 'maj', 'cze', 'lip', 'sie', 'wrz', 'paź', 'lis', 'gru'],
        weekdaysFull: ['niedziela', 'poniedziałek', 'wtorek', 'środa', 'czwartek', 'piątek', 'sobota'],
        weekdaysShort: ['nie', 'pon', 'wt', 'śr', 'czw', 'pi', 'sob'],
        firstDay: 1,
        today: 'Dzisiaj',
        clear: 'Wyszyść',
        close: 'Ok',
        closeOnSelect: false,
        container: undefined,
        format: 'dd-mm-yyyy',
        formatSubmit: 'yyyy-mm-dd'
    };
    return MainSetup;
}());
MainSetup.projectsRepositoryLocalData;
MainSetup.entitiesRepositoryLocalData;
MainSetup.documentTemplatesRepositoryLocalData;
MainSetup.personsRepositoryLocalData;
MainSetup.personsPerProjectRepositoryLocalData;
MainSetup.personsEnviRepositoryLocalData;
MainSetup.contractTypesRepositoryLocalData;
MainSetup.caseTypesRepositoryLocalData;
