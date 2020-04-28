

class LettersSetup {
    static get lettersRepository() {
        return LettersSetup._lettersRepository;
    }
    static set lettersRepository(value) {
        LettersSetup._lettersRepository = value;
    }
    
    static get letterCasesRepository() {
        return LettersSetup._letterCasesRepository;
    }
    static set letterCasesRepository(value) {
        LettersSetup._letterCasesRepository = value;
    }

    static get letterEntitiesRepository() {
        return LettersSetup._letterEntitiesRepository;
    }
    static set letterEntitiesRepository(value) {
        LettersSetup._letterEntitiesRepository = value;
    }
    
    static get contractsRepository() {
        return LettersSetup._contractsRepository;
    }
    static set contractsRepository(value) {
        LettersSetup._contractsRepository = value;
    }
    
    static get milestonesRepository() {
        return LettersSetup._milestonesRepository;
    }
    static set milestonesRepository(value) {
        LettersSetup._milestonesRepository = value;
    }
    
    static get casesRepository() {
        return LettersSetup._casesRepository;
    }
    static set casesRepository(value) {
        LettersSetup._casesRepository = value;
    }
    
    static get caseTypesRepository() {
        return LettersSetup._caseTypesRepository;
    }
    static set caseTypesRepository(value) {
        LettersSetup._caseTypesRepository = value;
    }
    
    static get personsRepository() {
        return LettersSetup._personsRepository;
    }
    static set personsRepository(value) {
        LettersSetup._personsRepository = value;
    }
    
    static get documentTemplatesRepository() {
        return LettersSetup._documentTemplatesRepository;
    }
    static set documentTemplatesRepository(value) {
        LettersSetup._documentTemplatesRepository = value;
    }
    
    static get currentProject() {
        return JSON.parse(sessionStorage.getItem('Projects repository')).currentItemLocalData;
    }

    static get currentUser() {
        return JSON.parse(sessionStorage.getItem('Current User'));
    }
}

LettersSetup._lettersRepository;
LettersSetup._letterCasesRepository;
LettersSetup._letterEntitiesRepository;    
LettersSetup._contractsRepository;
LettersSetup._milestonesRepository;
LettersSetup._casesRepository;
LettersSetup._caseTypesRepository;
LettersSetup._personsRepository;
LettersSetup._documentTemplatesRepository;
LettersSetup.entitiesRepository;
