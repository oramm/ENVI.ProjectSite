"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.contractRangesRepository = void 0;
const RepositoryReact_1 = __importDefault(require("../../React/RepositoryReact"));
exports.contractRangesRepository = new RepositoryReact_1.default({
    actionRoutes: {
        getRoute: "contractRanges",
        addNewRoute: "contractRange",
        editRoute: "contractRange",
        deleteRoute: "contractRange",
    },
    name: "contractRanges",
});
