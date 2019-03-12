var milestonesRepository;
var milestoneTypesRepository;
var otherContractsRepository;
      
class MilestonesSetup {
    static get statusNames() {
        return [   'Nie rozpoczęty',
                    'W trakcie',
                    'Zrobione',
                    'Opóźnione!',
                    'Termin aneksowany'
                ];
    }
    
    static get milestonesRepository() {
        return milestonesRepository;
    }
    
    static set milestonesRepository(data) {
        milestonesRepository = data;
    }
    
    static get milestoneTypesRepository() {
        return milestoneTypesRepository;
    }
    
    static set milestoneTypesRepository(data) {
        milestoneTypesRepository = data;
    }
    
    static get otherContractsRepository() {
        return otherContractsRepository;
    }
    
    static set otherContractsRepository(data) {
        otherContractsRepository = data;
    }
}