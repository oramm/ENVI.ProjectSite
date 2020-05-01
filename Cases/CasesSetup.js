var casesRepository;
var personsRepository;
var caseTypesRepository;
var eventsRepository;

class CasesSetup {
    //static currentMilestone = JSON.parse(sessionStorage.getItem('Milestones repository')).currentItemLocalData;

    static get currentMilestone() {
        return JSON.parse(sessionStorage.getItem('Milestones repository')).currentItemLocalData;
    }

    static get casesRepository() {
        return casesRepository;
    }
    static set casesRepository(data) {
        casesRepository = data;
    }

    static get caseTypesRepository() {
        return caseTypesRepository;
    }
    static set caseTypesRepository(data) {
        caseTypesRepository = data;
    }

    static set eventsRepository(data) {
        eventsRepository = data;
    }
    static get eventsRepository() {
        return eventsRepository;
    }
}