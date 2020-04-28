// Your Client ID can be retrieved from your project in the Google
// Developer Console, https://console.developers.google.com
//var CLIENT_ID = '336752284630-tljneqr745b11tuq65ktmlhnbedrph4j.apps.googleusercontent.com';
var CLIENT_ID = '386403657277-21tus25hgaoe7jdje73plc2qbgakht05.apps.googleusercontent.com'; //ENVI
//var CLIENT_ID = '369663686128-0q4ccc4crukqi6cg4iinr078k0tf6253.apps.googleusercontent.com'; /// przykłąd
var SCRIPT_ID = 'M1jCQxOsMBQ_tbMmqjqqAx23ed1cy4zrK'; //ENVI
//var SCRIPT_ID = 'M4-wFm_LvxywxkhpIO4s4WZxZ-kvETMHy'; /// przykłąd

// Array of API discovery doc URLs for APIs used by the quickstart
var DISCOVERY_DOCS = ["https://script.googleapis.com/$discovery/rest?version=v1"];

// Authorization scopes required by the API; multiple scopes can be
// included, separated by spaces.
SCOPES = 'https://www.google.com/calendar/feeds ' +
    'https://www.googleapis.com/auth/documents ' +
    'https://www.googleapis.com/auth/drive ' +
    'https://www.googleapis.com/auth/script.external_request ' +
    'https://www.googleapis.com/auth/spreadsheets ' +
    'https://www.googleapis.com/auth/userinfo.email ' +
    'https://www.googleapis.com/auth/userinfo.profile ';

var gAuth;
var mainWindowView;
var user;

class MainSetup {
    static get currentUser() {
        return JSON.parse(sessionStorage.getItem('Current User'));
    }

    static get currentProject() {
        return JSON.parse(sessionStorage.getItem('Projects repository')).currentItemLocalData;
    }
    static get currentContract() {
        return JSON.parse(sessionStorage.getItem('Contracts repository')).currentItemLocalData;
    }


    static get projectsRepository() {
        return new SimpleRepository(JSON.parse(sessionStorage.getItem('Projects repository')));
    }
    static get contractsRepository() {
        return new SimpleRepository(JSON.parse(sessionStorage.getItem('Contracts repository')));
    }
    static get entitiesRepository() {
        return new SimpleRepository(JSON.parse(sessionStorage.getItem('Entities repository')));
    }
    
    static get personsRepository() {
        return new SimpleRepository(JSON.parse(sessionStorage.getItem('Persons repository')));
    }
    static set personsRepository(data) {
        MainSetup.personsRepositoryLocalData = data;
    }
    static get personsPerProjectRepository() {
        return new SimpleRepository(JSON.parse(sessionStorage.getItem('PersonsPerProject repository')));
    }
    static set personsPerProjectRepository(data) {
        MainSetup.personsPerProjectRepositoryLocalData = data;
    }
}

MainSetup.projectsRepositoryLocalData;
MainSetup.entitiesRepositoryLocalData;

MainSetup.personsRepositoryLocalData;
MainSetup.personsPerProjectRepositoryLocalData;

