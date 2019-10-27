var lettersRepository;
var contractsRepository;
var milestonesRepository;
var casesRepository;
var caseTypesRepository;
var personsRepository;
var documentTemplatesRepository;
var entitiesRepository;

class LettersSetup {
    static get currentProject() {
        return JSON.parse(sessionStorage.getItem('Projects repository')).currentItemLocalData;
    }
    
    static get currentUser() {
        return JSON.parse(sessionStorage.getItem('Current User'));
    }
    
    static get lettersRepository() {
        return lettersRepository;
    }
    static set lettersRepository(data) {
        lettersRepository = data;
    }
    
    static get contractsRepository() {
        return contractsRepository;
    }    
    static set contractsRepository(data) {
        contractsRepository = data;
    }
    
    static get milestonesRepository() {
        return milestonesRepository;
    }    
    static set milestonesRepository(data) {
        milestonesRepository = data;
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
    
    static get personsRepository() {
        return personsRepository;
    }
    static set personsRepository(data) {
        personsRepository = data;
    }
    
    static get documentTemplatesRepository() {
        return documentTemplatesRepository;
    }
    static set documentTemplatesRepository(data) {
        documentTemplatesRepository = data;
    }
    
    static get entitiesRepository() {
        return entitiesRepository;
    }
    static set entitiesRepository(data) {
        entitiesRepository = data;
    }
}