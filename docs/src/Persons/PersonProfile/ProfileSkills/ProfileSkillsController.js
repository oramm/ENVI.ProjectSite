"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createProfileSkillsRepository = void 0;
const RepositoryReact_1 = __importDefault(require("../../../React/RepositoryReact"));
function createProfileSkillsRepository(personId) {
    return new RepositoryReact_1.default({
        name: `person_${personId}_skills_temp`,
        actionRoutes: {
            getRoute: `v2/persons/${personId}/profile/skills/search`,
            addNewRoute: `v2/persons/${personId}/profile/skills`,
            editRoute: `v2/persons/${personId}/profile/skills`,
            deleteRoute: `v2/persons/${personId}/profile/skills`,
        },
    });
}
exports.createProfileSkillsRepository = createProfileSkillsRepository;
