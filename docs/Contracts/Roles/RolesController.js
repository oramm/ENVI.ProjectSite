"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.personsRepository = exports.rolesRepository = void 0;
const RepositoryReact_1 = __importDefault(require("../../React/RepositoryReact"));
exports.rolesRepository = new RepositoryReact_1.default({
    actionRoutes: {
        getRoute: "roles",
        addNewRoute: "role",
        editRoute: "role",
        deleteRoute: "role",
    },
    name: "roles",
});
exports.personsRepository = new RepositoryReact_1.default({
    actionRoutes: {
        getRoute: "persons",
        addNewRoute: "",
        editRoute: "",
        deleteRoute: "",
    },
    name: "contractRoles-persons",
});
