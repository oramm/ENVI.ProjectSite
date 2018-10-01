var contractsRepository;
var personsRepository;

const statusNames = [   'Nie rozpoczęty',
                        'W trakcie',
                        'Zakończony'
                    ];

class ContractsSetup {
    static get statusNames() {
        return statusNames;
    }
    static get contractsRepository() {
        return contractsRepository;
    }
    static get personsRepository() {
        return personsRepository;
    }
    
}