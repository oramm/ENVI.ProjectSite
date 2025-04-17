"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.applicationCallsRepository = void 0;
const RepositoryReact_1 = __importDefault(require("../../../React/RepositoryReact"));
exports.applicationCallsRepository = new RepositoryReact_1.default({
    actionRoutes: {
        getRoute: "applicationCalls",
        addNewRoute: "applicationCall",
        editRoute: "applicationCall",
        deleteRoute: "applicationCall",
    },
    name: "applicationCalls",
});
