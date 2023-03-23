"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const RepositoryReact_1 = __importDefault(require("../../React/RepositoryReact"));
class ContractsController {
}
exports.default = ContractsController;
ContractsController.contractsRepository = new RepositoryReact_1.default({
    actionRoutes: {
        getRoute: 'contracts',
        addNewRoute: 'contract',
        editRoute: 'contract',
        deleteRoute: 'contract'
    },
    name: 'contracts'
});
ContractsController.entitiesRepository = new RepositoryReact_1.default({
    actionRoutes: {
        getRoute: 'entities',
        addNewRoute: 'entity',
        editRoute: 'entity',
        deleteRoute: 'entity'
    },
    name: 'entities'
});
ContractsController.projectsRepository = new RepositoryReact_1.default({
    actionRoutes: {
        getRoute: 'projects',
        addNewRoute: 'project',
        editRoute: 'project',
        deleteRoute: 'project'
    },
    name: 'projects'
});
