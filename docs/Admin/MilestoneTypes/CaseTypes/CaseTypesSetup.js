var caseTypesRepository;
var caseTemplatesRepository;

class CaseTypesSetup {
    //static currentMilestone = JSON.parse(sessionStorage.getItem('Milestones repository')).currentItemLocalData;
    
    static get currentMilestoneType() {
        return JSON.parse(sessionStorage.getItem('MilestoneTypes repository')).currentItemLocalData;;
    }
    static get caseTypesRepository() {
        return caseTypesRepository;
    }
    static set caseTypesRepository(data) {
        caseTypesRepository = data;
    }
    
    static get caseTemplatesRepository() {
        return caseTemplatesRepository;
    }
    static set caseTemplatesRepository(data) {
        caseTemplatesRepository = data;
    }
}