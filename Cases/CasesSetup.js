var casesRepository;
var personsRepository;
var caseTypesRepository;
var processesInstancesStepsRepository;
var processesStepsInstancesRepository;

class CasesSetup {
    static currentMilestone = JSON.parse(sessionStorage.getItem('Milestones repository')).currentItemLocalData;
    
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
    static get processesInstancesRepository() {
        return processesInstancesRepository;
    }
    static set processesInstancesRepository(data) {
        processesInstancesRepository = data;
    }
    static get processesStepsInstancesRepository() {
        return processesStepsInstancesRepository;
    }
    static set processesStepsInstancesRepository(data) {
        processesStepsInstancesRepository = data;
    }
}