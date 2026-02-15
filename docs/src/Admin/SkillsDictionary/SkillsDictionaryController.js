"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.skillsDictionaryRepository = void 0;
const RepositoryReact_1 = __importDefault(require("../../React/RepositoryReact"));
exports.skillsDictionaryRepository = new RepositoryReact_1.default({
    actionRoutes: {
        getRoute: "v2/skills/search",
        addNewRoute: "v2/skills",
        editRoute: "v2/skills",
        deleteRoute: "v2/skills",
    },
    name: "skillsDictionary",
});
