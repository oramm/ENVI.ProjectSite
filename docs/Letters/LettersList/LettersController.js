"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const RepositoryReact_1 = __importDefault(require("../../React/RepositoryReact"));
class LettersController {
}
exports.default = LettersController;
LettersController.statusNames = [
    'Roboczy',
    'Do wysłania',
    'Wysłany',
];
LettersController.lettersRepository = new RepositoryReact_1.default({
    actionRoutes: {
        getRoute: 'letters',
        addNewRoute: 'letterReact',
        editRoute: 'letter',
        deleteRoute: 'letter'
    },
    name: 'letters'
});
LettersController.projectsRepository = new RepositoryReact_1.default({
    actionRoutes: {
        getRoute: 'projects',
        addNewRoute: '',
        editRoute: '',
        deleteRoute: ''
    },
    name: 'projects'
});
LettersController.contractsRepository = new RepositoryReact_1.default({
    actionRoutes: {
        getRoute: 'contracts',
        addNewRoute: '',
        editRoute: '',
        deleteRoute: ''
    },
    name: 'contracts'
});
LettersController.milestonesRepository = new RepositoryReact_1.default({
    actionRoutes: {
        getRoute: 'milestones',
        addNewRoute: '',
        editRoute: '',
        deleteRoute: ''
    },
    name: 'milestones'
});
LettersController.casesRepository = new RepositoryReact_1.default({
    actionRoutes: {
        getRoute: 'cases',
        addNewRoute: '',
        editRoute: '',
        deleteRoute: ''
    },
    name: 'cases'
});
LettersController.entitiesRepository = new RepositoryReact_1.default({
    actionRoutes: {
        getRoute: 'entities',
        addNewRoute: 'entity',
        editRoute: 'entity',
        deleteRoute: 'entity'
    },
    name: 'entities'
});
