"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.entitiesRepository = exports.contractsRepository = exports.projectsRepository = exports.invoiceItemsRepository = exports.invoicesRepository = exports.statusNames = void 0;
const RepositoryReact_1 = __importDefault(require("../../React/RepositoryReact"));
exports.statusNames = ["Roboczy", "Do wysłania", "Wysłany"];
exports.invoicesRepository = new RepositoryReact_1.default({
    actionRoutes: {
        getRoute: "invoices",
        addNewRoute: "invoice",
        editRoute: "invoice",
        copyRoute: "copyInvoice",
        deleteRoute: "invoice",
    },
    name: "invoices",
});
exports.invoiceItemsRepository = new RepositoryReact_1.default({
    actionRoutes: {
        getRoute: "invoiceItems",
        addNewRoute: "invoiceItem",
        editRoute: "invoiceItem",
        deleteRoute: "invoiceItem",
    },
    name: "invoiceItems",
});
exports.projectsRepository = new RepositoryReact_1.default({
    actionRoutes: {
        getRoute: "projects",
        addNewRoute: "",
        editRoute: "",
        deleteRoute: "",
    },
    name: "projects",
});
exports.contractsRepository = new RepositoryReact_1.default({
    actionRoutes: {
        getRoute: "contracts",
        addNewRoute: "",
        editRoute: "",
        deleteRoute: "",
    },
    name: "contracts",
});
exports.entitiesRepository = new RepositoryReact_1.default({
    actionRoutes: {
        getRoute: "entities",
        addNewRoute: "entity",
        editRoute: "entity",
        deleteRoute: "entity",
    },
    name: "entities",
});
