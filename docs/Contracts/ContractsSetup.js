"use strict";
var contractsRepository;
var otherContractsRepository;
var statusNames = ['Nie rozpoczęty',
    'W trakcie',
    'Zakończony',
    'Archiwalny'
];
var ContractsSetup = /** @class */ (function () {
    function ContractsSetup() {
    }
    Object.defineProperty(ContractsSetup, "personsPerContractRepository", {
        //getterów nie używać w klasie inicjującej ten MainSetup z bazy
        get: function () {
            if (!ContractsSetup.personsRepositoryLocalData)
                ContractsSetup.personsPerContractRepositoryLocalData = new SimpleRepository(JSON.parse(sessionStorage.getItem('PersonsPerContract repository')));
            return ContractsSetup.personsPerContractRepositoryLocalData;
        },
        set: function (data) {
            ContractsSetup.personsPerContractRepositoryLocalData = data;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(ContractsSetup, "statusNames", {
        get: function () {
            return statusNames;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(ContractsSetup, "contractsRepository", {
        get: function () {
            return contractsRepository;
        },
        set: function (data) {
            contractsRepository = data;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(ContractsSetup, "otherContractsRepository", {
        get: function () {
            return otherContractsRepository;
        },
        set: function (data) {
            otherContractsRepository = data;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(ContractsSetup, "personsRepository", {
        get: function () {
            return ContractsSetuppersonsRepository;
        },
        set: function (data) {
            personsRepository = data;
        },
        enumerable: false,
        configurable: true
    });
    return ContractsSetup;
}());
ContractsSetup.personsPerContractRepositoryLocalData;
