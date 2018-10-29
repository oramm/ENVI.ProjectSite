var contractsRepository;
var personsRepository;

const statusNames = [   'Nie rozpoczęty',
                        'W trakcie',
                        'Zakończony'
                    ];

const fidicTypes = [   'Nie dotyczy',
                        'Czerwony',
                        'Żółty'
                    ];
class ContractsSetup {
    static get statusNames() {
        return statusNames;
    }
    static get fidicTypes() {
        return fidicTypes;
    }
    static get contractsRepository() {
        return contractsRepository;
    }
    static get personsRepository() {
        return personsRepository;
    }
    
}