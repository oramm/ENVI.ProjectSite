"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.citiesRepository = exports.securitiesRepository = exports.invoicesRepository = exports.contractsSettlementRepository = exports.projectsRepository = exports.entitiesRepository = exports.caseTypesRepository = exports.milestoneTypesRepository = exports.tasksRepository = exports.casesRepository = exports.milestonesRepository = exports.contractsRepository = void 0;
const RepositoryReact_1 = __importDefault(require("../../React/RepositoryReact"));
exports.contractsRepository = new RepositoryReact_1.default({
    actionRoutes: {
        getRoute: 'contracts',
        addNewRoute: 'contractReact',
        editRoute: 'contract',
        deleteRoute: 'contract'
    },
    name: 'contracts'
});
exports.milestonesRepository = new RepositoryReact_1.default({
    actionRoutes: {
        getRoute: 'milestones',
        addNewRoute: 'milestone',
        editRoute: 'milestone',
        deleteRoute: 'milestone'
    },
    name: 'milestones'
});
exports.casesRepository = new RepositoryReact_1.default({
    actionRoutes: {
        getRoute: 'cases',
        addNewRoute: 'case',
        editRoute: 'case',
        deleteRoute: 'case'
    },
    name: 'cases'
});
exports.tasksRepository = new RepositoryReact_1.default({
    actionRoutes: {
        getRoute: 'tasks',
        addNewRoute: 'task',
        editRoute: 'task',
        deleteRoute: 'task'
    },
    name: 'tasks'
});
exports.milestoneTypesRepository = new RepositoryReact_1.default({
    actionRoutes: {
        getRoute: 'milestoneTypes',
        addNewRoute: 'milestoneType',
        editRoute: 'milestoneType',
        deleteRoute: 'milestoneType'
    },
    name: 'milestoneTypes'
});
exports.caseTypesRepository = new RepositoryReact_1.default({
    actionRoutes: {
        getRoute: 'caseTypes',
        addNewRoute: 'caseType',
        editRoute: 'caseType',
        deleteRoute: 'caseType'
    },
    name: 'caseTypes'
});
exports.entitiesRepository = new RepositoryReact_1.default({
    actionRoutes: {
        getRoute: 'entities',
        addNewRoute: 'entity',
        editRoute: 'entity',
        deleteRoute: 'entity'
    },
    name: 'entities'
});
exports.projectsRepository = new RepositoryReact_1.default({
    actionRoutes: {
        getRoute: 'projects',
        addNewRoute: 'project',
        editRoute: 'project',
        deleteRoute: 'project'
    },
    name: 'projects'
});
exports.contractsSettlementRepository = new RepositoryReact_1.default({
    actionRoutes: {
        getRoute: 'contractsSettlementData',
        addNewRoute: '',
        editRoute: '',
        deleteRoute: ''
    },
    name: 'contractsSettlement'
});
exports.invoicesRepository = new RepositoryReact_1.default({
    actionRoutes: {
        getRoute: 'invoices',
        addNewRoute: 'invoice',
        editRoute: 'invoice',
        copyRoute: 'copyInvoice',
        deleteRoute: 'invoice'
    },
    name: 'invoices'
});
exports.securitiesRepository = new RepositoryReact_1.default({
    actionRoutes: {
        getRoute: 'securities',
        addNewRoute: 'security',
        editRoute: 'security',
        deleteRoute: 'security'
    },
    name: 'securities'
});
//citiesRepository.getRoute = 'cities';
exports.citiesRepository = new RepositoryReact_1.default({
    actionRoutes: {
        getRoute: 'cities',
        addNewRoute: 'city',
        editRoute: 'city',
        deleteRoute: 'city'
    },
    name: 'cities'
});
