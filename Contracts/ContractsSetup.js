var contractsRepository;
var otherContractsRepository;
var personsRepository;

const statusNames = [   'Nie rozpoczęty',
                        'W trakcie',
                        'Zakończony',
                        'Archiwalny'
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
    
    static set contractsRepository(data) {
        contractsRepository = data;
    }
    
    static get otherContractsRepository() {
        return otherContractsRepository;
    }
    static set otherContractsRepository(data) {
        otherContractsRepository = data;
    }
    static get personsRepository() {
        return personsRepository;
    }
    
    static set personsRepository(data) {
        personsRepository = data;
    }
    
}