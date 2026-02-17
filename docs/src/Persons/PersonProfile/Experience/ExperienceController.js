"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createExperienceRepository = void 0;
const RepositoryReact_1 = __importDefault(require("../../../React/RepositoryReact"));
function createExperienceRepository(personId) {
    return new RepositoryReact_1.default({
        name: `person_${personId}_experiences_temp`,
        actionRoutes: {
            getRoute: `v2/persons/${personId}/profile/experiences/search`,
            addNewRoute: `v2/persons/${personId}/profile/experiences`,
            editRoute: `v2/persons/${personId}/profile/experiences`,
            deleteRoute: `v2/persons/${personId}/profile/experiences`,
        },
    });
}
exports.createExperienceRepository = createExperienceRepository;
