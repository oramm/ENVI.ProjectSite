var casesRepository;
var personsRepository;
var caseTypesRepository;

class CasesSetup {
    static get casesRepository() {
        return casesRepository;
    }
    static set casesRepository(data) {
        casesRepository = data;
    }
    static get personsRepository() {
        return personsRepository;
    }
    static set personsRepository(data) {
        personsRepository = data;
    }
    static get caseTypesRepository() {
        return caseTypesRepository;
    }
    
    static set caseTypesRepository(data) {
        caseTypesRepository = data;
    }
}