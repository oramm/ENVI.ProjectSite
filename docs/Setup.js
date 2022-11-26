"use strict";
// Your Client ID can be retrieved from your project in the Google
// Developer Console, https://console.developers.google.com
//const CLIENT_ID = '386403657277-21tus25hgaoe7jdje73plc2qbgakht05.apps.googleusercontent.com'; //ENVI
const CLIENT_ID = '386403657277-9mh2cnqb9dneoh8lc6o2m339eemj24he.apps.googleusercontent.com'; //ENVI - nowy test
// Set to client ID and API key from the Developer Console
const API_KEY = 'AIzaSyC4Arjx-IGEQ1Sj99P_Om4B_dg7D7p2kPg';
const SCRIPT_ID = 'M1jCQxOsMBQ_tbMmqjqqAx23ed1cy4zrK'; //ENVI
// Array of API discovery doc URLs for APIs used by the quickstart
const DISCOVERY_DOCS = [
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
class MainSetup {
    static get currentUser() {
        return JSON.parse(sessionStorage.getItem('Current User'));
    }
    static set currentUser(data) {
        sessionStorage.setItem('Current User', JSON.stringify(data));
    }
    static get currentProject() {
        return JSON.parse(sessionStorage.getItem('Projects repository')).currentItemLocalData;
    }
    static get currentContract() {
        return JSON.parse(sessionStorage.getItem('Contracts repository')).currentItemLocalData;
    }
    //getterów nie używać w klasie inicjującej ten MainSetup z bazy
    static get projectsRepository() {
        if (MainSetup.projectsRepositoryLocalData)
            console.log('### true: MainSetup.projectsRepositoryLocalData: ');
        if (!MainSetup.projectsRepositoryLocalData) {
            MainSetup.projectsRepositoryLocalData = new SimpleRepository(JSON.parse(sessionStorage.getItem('Projects repository')));
        }
        return MainSetup.projectsRepositoryLocalData;
    }
    //getterów nie używać w klasie inicjującej ten MainSetup z bazy
    static get entitiesRepository() {
        if (!MainSetup.entitiesRepositoryLocalData)
            MainSetup.entitiesRepositoryLocalData = new SimpleRepository(JSON.parse(sessionStorage.getItem('Entities repository')));
        return MainSetup.entitiesRepositoryLocalData;
    }
    //getterów nie używać w klasie inicjującej ten MainSetup z bazy
    static get personsRepository() {
        if (!MainSetup.personsRepositoryLocalData)
            MainSetup.personsRepositoryLocalData = new SimpleRepository(JSON.parse(sessionStorage.getItem('Persons repository')));
        return MainSetup.personsRepositoryLocalData;
    }
    static set personsRepository(data) {
        MainSetup.personsRepositoryLocalData = data;
    }
    //getterów nie używać w klasie inicjującej ten MainSetup z bazy
    static get personsPerProjectRepository() {
        if (!MainSetup.personsPerProjectRepositoryLocalData)
            MainSetup.personsPerProjectRepositoryLocalData = new SimpleRepository(JSON.parse(sessionStorage.getItem('PersonsPerProject repository')));
        return MainSetup.personsPerProjectRepositoryLocalData;
    }
    static set personsPerProjectRepository(data) {
        MainSetup.personsPerProjectRepositoryLocalData = data;
    }
    //getterów nie używać w klasie inicjującej ten MainSetup z bazy
    static get personsEnviRepository() {
        if (!MainSetup.personsEnviRepositoryLocalData)
            MainSetup.personsEnviRepositoryLocalData = new SimpleRepository(JSON.parse(sessionStorage.getItem('PersonsEnvi repository')));
        return MainSetup.personsEnviRepositoryLocalData;
    }
    static set personsEnviRepository(data) {
        MainSetup.personsEnviRepositoryLocalData = data;
    }
    //getterów nie używać w klasie inicjującej ten MainSetup z bazy
    static get documentTemplatesRepository() {
        if (!MainSetup.documentTemplatesRepositoryLocalData)
            MainSetup.documentTemplatesRepositoryLocalData = new SimpleRepository(JSON.parse(sessionStorage.getItem('DocumentTemplates repository')));
        return MainSetup.documentTemplatesRepositoryLocalData;
    }
    static set documentTemplatesRepository(data) {
        MainSetup.documentTemplatesRepositoryLocalData = data;
    }
    //getterów nie używać w klasie inicjującej ten MainSetup z bazy
    static get contractTypesRepository() {
        if (!MainSetup.contractTypesRepositoryLocalData)
            MainSetup.contractTypesRepositoryLocalData = new SimpleRepository(JSON.parse(sessionStorage.getItem('ContractTypes repository')));
        return MainSetup.contractTypesRepositoryLocalData;
    }
    static set contractTypesRepository(data) {
        MainSetup.contractTypesRepositoryLocalData = data;
    }
    //getterów nie używać w klasie inicjującej ten MainSetup z bazy
    static get caseTypesRepository() {
        if (!MainSetup.caseTypesRepositoryLocalData)
            MainSetup.caseTypesRepositoryLocalData = new SimpleRepository(JSON.parse(sessionStorage.getItem('CaseTypes repository')));
        return MainSetup.caseTypesRepositoryLocalData;
    }
    static set caseTypesRepository(data) {
        MainSetup.caseTypesRepositoryLocalData = data;
    }
}
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
MainSetup.projectsRepositoryLocalData;
MainSetup.entitiesRepositoryLocalData;
MainSetup.documentTemplatesRepositoryLocalData;
MainSetup.personsRepositoryLocalData;
MainSetup.personsPerProjectRepositoryLocalData;
MainSetup.personsEnviRepositoryLocalData;
MainSetup.contractTypesRepositoryLocalData;
MainSetup.caseTypesRepositoryLocalData;
