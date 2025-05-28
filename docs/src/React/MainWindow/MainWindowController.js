"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.applicationCallsRepository = exports.invoicesRepository = exports.offersRepository = exports.casesRepository = exports.tasksRepository = exports.milestoneDatesRepository = exports.securitiesRepository = exports.contractsRepository = void 0;
const RepositoryReact_1 = __importDefault(require("../RepositoryReact"));
exports.contractsRepository = new RepositoryReact_1.default({
    actionRoutes: {
        getRoute: "contracts",
        addNewRoute: "",
        editRoute: "contract",
        deleteRoute: "",
    },
    name: "dashBoard-Contracts",
});
exports.securitiesRepository = new RepositoryReact_1.default({
    actionRoutes: {
        getRoute: "securities",
        addNewRoute: "security",
        editRoute: "security",
        deleteRoute: "security",
    },
    name: "dashBoard-securities",
});
exports.milestoneDatesRepository = new RepositoryReact_1.default({
    actionRoutes: {
        getRoute: "milestoneDates",
        addNewRoute: "milestoneDate",
        editRoute: "milestoneDate",
        deleteRoute: "milestoneDate",
    },
    name: "dashBoard-milestoneDates",
});
exports.tasksRepository = new RepositoryReact_1.default({
    actionRoutes: {
        getRoute: "tasks",
        addNewRoute: "",
        editRoute: "",
        deleteRoute: "",
    },
    name: "tasks",
});
exports.casesRepository = new RepositoryReact_1.default({
    actionRoutes: {
        getRoute: "cases",
        addNewRoute: "",
        editRoute: "",
        deleteRoute: "",
    },
    name: "cases",
});
exports.offersRepository = new RepositoryReact_1.default({
    actionRoutes: {
        getRoute: "offers",
        addNewRoute: "",
        editRoute: "offer",
        deleteRoute: "",
    },
    name: "offers-dashBoard",
});
exports.invoicesRepository = new RepositoryReact_1.default({
    actionRoutes: {
        getRoute: "invoices",
        addNewRoute: "",
        editRoute: "invoice",
        deleteRoute: "",
    },
    name: "dashBoard-invoices",
});
exports.applicationCallsRepository = new RepositoryReact_1.default({
    actionRoutes: {
        getRoute: "applicationCalls",
        addNewRoute: "",
        editRoute: "applicationCall",
        deleteRoute: "",
    },
    name: "dashBoard-applicationCalls",
});
