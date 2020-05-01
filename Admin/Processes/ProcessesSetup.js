var processesRepository;
var processStepsRepository;
var caseTypesRepository;

class ProcessesSetup {
    static get processesRepository() {
        return processesRepository;
    }
    
    static set processesRepository(data) {
        processesRepository = data;
    }
    
    static get processStepsRepository() {
        return processStepsRepository;
    }
    
    static set processStepsRepository(data) {
        processStepsRepository = data;
    }
    
    static get caseTypesRepository() {
        return caseTypesRepository;
    }
    
    static set caseTypesRepository(data) {
        caseTypesRepository = data;
    }
}