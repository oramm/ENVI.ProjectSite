var milestoneTypesRepository;
var milestonesRepository;
var milestoneTypeContractTypeAssociationsRepository;
      
class MilestonesSetup {
    static get statusNames() {
        return [   'Nie rozpoczęty',
                    'W trakcie',
                    'Zrobione',
                    'Opóźnione!',
                    'Termin aneksowany'
                ];
    }
    
    static get milestoneTypesRepository() {
        return milestoneTypesRepository;
    }
    
    static set milestoneTypesRepository(data) {
        milestoneTypesRepository = data;
    }
    
    static get milestonesRepository() {
        return milestonesRepository;
    }
    
    static set milestonesRepository(data) {
        milestonesRepository = data;
    }
    static get milestoneTypeContractTypeAssociationsRepository() {
        return milestoneTypeContractTypeAssociationsRepository;
    }
    
    static set milestoneTypeContractTypeAssociationsRepository(data) {
        milestoneTypeContractTypeAssociationsRepository = data;
    }
}