var materialCardsRepository;
var reactionsRepository;
var contractsRepository;
var personsRepository;
var milestonesRepository;
var casesRepository;

var statusNames = ['Robocze','Do poprawy','Do akceptacji','Zatwierdzone'];

class MaterialCardsSetup {
    static get currentUser() {
        return JSON.parse(sessionStorage.getItem('Current User'));
    }
    static get materialCardsRepository() {
        return materialCardsRepository;
    }
    static set materialCardsRepository(data) {
        materialCardsRepository = data;
    }
    static get reactionsRepository() {
        return reactionsRepository;
    }
    static set reactionsRepository(data) {
        reactionsRepository = data;
    }
    static get personsRepository() {
        return personsRepository;
    }
    static set personsRepository(data) {
        personsRepository = data;
    }
    static get statusNames() {
        return statusNames;
    }
    static get contractsRepository() {
        return contractsRepository;
    }
    static set contractsRepository(data) {
        contractsRepository = data;
    }
    static set milestonesRepository(data) {
        milestonesRepository = data;
    }
    static get milestonesRepository() {
        return milestonesRepository;
    }
    static set casesRepository(data) {
        casesRepository = data;
    }
    static get casesRepository() {
        return casesRepository;
    }
}