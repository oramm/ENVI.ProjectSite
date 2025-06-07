"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.citiesRepository = void 0;
const RepositoryReact_1 = __importDefault(require("../../React/RepositoryReact"));
exports.citiesRepository = new RepositoryReact_1.default({
    actionRoutes: {
        getRoute: "cities",
        addNewRoute: "city",
        editRoute: "city",
        deleteRoute: "city",
    },
    name: "cities",
});
