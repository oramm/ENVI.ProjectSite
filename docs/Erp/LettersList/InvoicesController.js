"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const RepositoryReact_1 = __importDefault(require("../../React/RepositoryReact"));
class InvoicesController {
}
exports.default = InvoicesController;
InvoicesController.statusNames = [
    'Roboczy',
    'Do wysłania',
    'Wysłany',
];
InvoicesController.invoicesRepository = new RepositoryReact_1.default({
    actionRoutes: {
        getRoute: 'invoices',
        addNewRoute: 'invoiceReact',
        editRoute: 'invoice',
        deleteRoute: 'invoice'
    },
    name: 'invoices'
});
InvoicesController.invoiceItemsRepository = new RepositoryReact_1.default({
    actionRoutes: {
        getRoute: 'invoiceItems',
        addNewRoute: 'invoiceItemReact',
        editRoute: 'invoiceItem',
        deleteRoute: 'invoiceItem'
    },
    name: 'invoiceItems'
});
InvoicesController.projectsRepository = new RepositoryReact_1.default({
    actionRoutes: {
        getRoute: 'projects',
        addNewRoute: '',
        editRoute: '',
        deleteRoute: ''
    },
    name: 'projects'
});
InvoicesController.contractsRepository = new RepositoryReact_1.default({
    actionRoutes: {
        getRoute: 'contracts',
        addNewRoute: '',
        editRoute: '',
        deleteRoute: ''
    },
    name: 'contracts'
});
InvoicesController.entitiesRepository = new RepositoryReact_1.default({
    actionRoutes: {
        getRoute: 'entities',
        addNewRoute: 'entity',
        editRoute: 'entity',
        deleteRoute: 'entity'
    },
    name: 'entities'
});
