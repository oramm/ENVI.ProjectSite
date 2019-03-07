var milestonesRepository;
var milestoneTypesRepository;
      
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
    
    static get milestoneTypesRepository() {
        return milestoneTypesRepository;
    }
}