var risksRepository;
var reactionsRepository;
var contractsRepository;
var personsRepository;
var milestonesRepository;
const probabilityRates = [1,2,3,4];
const overallImpactRates = probabilityRates;

class RisksSetup {
    static get risksRepository() {
        return risksRepository;
    }
    static set risksRepository(data) {
        risksRepository = data;
    }
    static get reactionsRepository() {
        return reactionsRepository;
    }
    static set reactionsRepository(data) {
        reactionsRepository = data;
    }
    static get personsRepository() {
        return personsRepository;
    }
    static set personsRepository(data) {
        personsRepository = data;
    }
    static get contractsRepository() {
        return contractsRepository;
    }
    static set contractsRepository(data) {
        contractsRepository = data;
    }
    static get milestonesRepository() {
        return milestonesRepository;
    }
    static set milestonesRepository(data) {
        milestonesRepository = data;
    }
    static get probabilityRates() {
        return probabilityRates;
    }
    static get overallImpactRates() {
        return overallImpactRates;
    }
}