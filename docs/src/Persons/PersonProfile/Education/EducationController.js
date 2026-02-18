"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createEducationsRepository = createEducationsRepository;
const RepositoryReact_1 = __importDefault(require("../../../React/RepositoryReact"));
function createEducationsRepository(personId) {
    return new RepositoryReact_1.default({
        name: `person_${personId}_educations_temp`,
        actionRoutes: {
            getRoute: `v2/persons/${personId}/profile/educations/search`,
            addNewRoute: `v2/persons/${personId}/profile/educations`,
            editRoute: `v2/persons/${personId}/profile/educations`,
            deleteRoute: `v2/persons/${personId}/profile/educations`,
        },
    });
}
