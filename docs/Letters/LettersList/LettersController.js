"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.entitiesRepository = exports.casesRepository = exports.milestonesRepository = exports.contractsRepository = exports.projectsRepository = exports.lettersRepository = void 0;
const RepositoryReact_1 = __importDefault(require("../../React/RepositoryReact"));
exports.lettersRepository = new RepositoryReact_1.default({
    actionRoutes: {
        getRoute: 'letters',
        addNewRoute: 'letterReact',
        editRoute: 'letter',
        deleteRoute: 'letter'
    },
    name: 'letters'
});
exports.projectsRepository = new RepositoryReact_1.default({
    actionRoutes: {
        getRoute: 'projects',
        addNewRoute: '',
        editRoute: '',
        deleteRoute: ''
    },
    name: 'projects'
});
exports.contractsRepository = new RepositoryReact_1.default({
    actionRoutes: {
        getRoute: 'contracts',
        addNewRoute: '',
        editRoute: '',
        deleteRoute: ''
    },
    name: 'contracts'
});
exports.milestonesRepository = new RepositoryReact_1.default({
    actionRoutes: {
        getRoute: 'milestones',
        addNewRoute: '',
        editRoute: '',
        deleteRoute: ''
    },
    name: 'milestones'
});
exports.casesRepository = new RepositoryReact_1.default({
    actionRoutes: {
        getRoute: 'cases',
        addNewRoute: '',
        editRoute: '',
        deleteRoute: ''
    },
    name: 'cases'
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
