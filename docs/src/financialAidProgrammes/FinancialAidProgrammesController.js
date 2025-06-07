"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.needsRepository = exports.clientsRepository = exports.financialAidProgrammesRepository = void 0;
const RepositoryReact_1 = __importDefault(require("../React/RepositoryReact"));
exports.financialAidProgrammesRepository = new RepositoryReact_1.default({
    actionRoutes: {
        getRoute: "financialAidProgrammes",
        addNewRoute: "financialAidProgramme",
        editRoute: "financialAidProgramme",
        deleteRoute: "financialAidProgramme",
    },
    name: "financialAidProgrammes",
});
exports.clientsRepository = new RepositoryReact_1.default({
    actionRoutes: {
        getRoute: "entities",
        addNewRoute: "entity",
        editRoute: "entity",
        deleteRoute: "entity",
    },
    name: "clients",
});
exports.needsRepository = new RepositoryReact_1.default({
    actionRoutes: {
        getRoute: "needs",
        addNewRoute: "need",
        editRoute: "need",
        deleteRoute: "need",
    },
    name: "needs",
});
