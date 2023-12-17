"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.entitiesRepository = exports.OffersRepository = void 0;
const RepositoryReact_1 = __importDefault(require("../React/RepositoryReact"));
exports.OffersRepository = new RepositoryReact_1.default({
    actionRoutes: {
        getRoute: 'offers',
        addNewRoute: 'offer',
        editRoute: 'offer',
        deleteRoute: 'offer'
    },
    name: 'offers'
});
exports.entitiesRepository = new RepositoryReact_1.default({
    actionRoutes: {
        getRoute: 'entities',
        addNewRoute: 'entity',
        editRoute: 'entity',
        deleteRoute: 'entity'
    },
    name: 'entities'
});
