"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.projectsRepository = exports.entitiesRepository = exports.caseTypesRepository = exports.milestoneTypesRepository = exports.tasksRepository = exports.casesRepository = exports.milestonesRepository = exports.contractsRepository = void 0;
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
