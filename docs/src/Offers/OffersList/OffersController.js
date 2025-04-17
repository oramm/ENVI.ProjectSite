"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.personsRepository = exports.entitiesRepository = exports.offerBondsRepository = exports.mailInvitationsRepository = exports.mailsToCheckRepository = exports.offersRepository = void 0;
const RepositoryReact_1 = __importDefault(require("../../React/RepositoryReact"));
exports.offersRepository = new RepositoryReact_1.default({
    actionRoutes: {
        getRoute: "offers",
        addNewRoute: "offer",
        editRoute: "offer",
        deleteRoute: "offer",
    },
    name: "offers",
});
exports.mailsToCheckRepository = new RepositoryReact_1.default({
    actionRoutes: {
        getRoute: "mailsToCheck",
        addNewRoute: "mailToCheck",
        editRoute: "mailToCheck",
        deleteRoute: "mailToCheck",
    },
    name: "mailsToCheck",
});
exports.mailInvitationsRepository = new RepositoryReact_1.default({
    actionRoutes: {
        getRoute: "mailInvitations",
        addNewRoute: "mailInvitation",
        editRoute: "mailInvitation",
        deleteRoute: "mailInvitation",
    },
    name: "mailInvitations",
});
exports.offerBondsRepository = new RepositoryReact_1.default({
    actionRoutes: {
        getRoute: "offerBonds",
        addNewRoute: "offerBond",
        editRoute: "offerBond",
        deleteRoute: "offerBond",
    },
    name: "offerBonds",
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
exports.personsRepository = new RepositoryReact_1.default({
    actionRoutes: {
        getRoute: "persons",
        addNewRoute: "",
        editRoute: "",
        deleteRoute: "",
    },
    name: "offers-persons",
});
