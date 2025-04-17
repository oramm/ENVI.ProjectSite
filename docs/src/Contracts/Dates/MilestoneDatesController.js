"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.contractsRepository = exports.projectsRepository = exports.personsRepository = exports.milestoneDatesRepository = void 0;
const RepositoryReact_1 = __importDefault(require("../../React/RepositoryReact"));
exports.milestoneDatesRepository = new RepositoryReact_1.default({
    actionRoutes: {
        getRoute: "milestoneDates",
        addNewRoute: "milestoneDate",
        editRoute: "milestoneDate",
        deleteRoute: "milestoneDate",
    },
    name: "milestoneDates",
});
exports.personsRepository = new RepositoryReact_1.default({
    actionRoutes: {
        getRoute: "persons",
        addNewRoute: "",
        editRoute: "",
        deleteRoute: "",
    },
    name: "milestoneDates-persons",
});
exports.projectsRepository = new RepositoryReact_1.default({
    actionRoutes: {
        getRoute: "projects",
        addNewRoute: "",
        editRoute: "",
        deleteRoute: "",
    },
    name: "milestoneDates-projects",
});
exports.contractsRepository = new RepositoryReact_1.default({
    actionRoutes: {
        getRoute: "contracts",
        addNewRoute: "",
        editRoute: "",
        deleteRoute: "",
    },
    name: "milestoneDates-contracts",
});
