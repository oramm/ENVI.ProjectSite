"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.casesRepository = exports.tasksRepository = exports.milestonesRepository = exports.securitiesRepository = exports.contractsRepository = void 0;
const RepositoryReact_1 = __importDefault(require("../RepositoryReact"));
exports.contractsRepository = new RepositoryReact_1.default({
    actionRoutes: {
        getRoute: 'contracts',
        addNewRoute: '',
        editRoute: 'contract',
        deleteRoute: ''
    },
    name: 'contracts'
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
exports.milestonesRepository = new RepositoryReact_1.default({
    actionRoutes: {
        getRoute: 'milestones',
        addNewRoute: '',
        editRoute: '',
        deleteRoute: ''
    },
    name: 'milestones'
});
exports.tasksRepository = new RepositoryReact_1.default({
    actionRoutes: {
        getRoute: 'tasks',
        addNewRoute: '',
        editRoute: '',
        deleteRoute: ''
    },
    name: 'tasks'
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
