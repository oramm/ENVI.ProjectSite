var contractsRepository;
var otherContractsRepository;

const statusNames = ['Nie rozpoczęty',
    'W trakcie',
    'Zakończony',
    'Archiwalny'
];

class ContractsSetup {
    //getterów nie używać w klasie inicjującej ten MainSetup z bazy
    static get personsPerContractRepository() {
        if (!ContractsSetup.personsRepositoryLocalData)
            ContractsSetup.personsPerContractRepositoryLocalData = new SimpleRepository(JSON.parse(sessionStorage.getItem('PersonsPerContract repository')));
        return ContractsSetup.personsPerContractRepositoryLocalData;
    }
    static set personsPerContractRepository(data) {
        ContractsSetup.personsPerContractRepositoryLocalData = data;
    }

    static get statusNames() {
        return statusNames;
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
        return ContractsSetuppersonsRepository;
    }
    static set personsRepository(data) {
        personsRepository = data;
    }

}

ContractsSetup.personsPerContractRepositoryLocalData;