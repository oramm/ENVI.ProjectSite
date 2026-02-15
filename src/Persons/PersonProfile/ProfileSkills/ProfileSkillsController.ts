import { PersonProfileSkillV2Record } from "../../../../Typings/bussinesTypes";
import RepositoryReact from "../../../React/RepositoryReact";

export function createProfileSkillsRepository(personId: number) {
    return new RepositoryReact<PersonProfileSkillV2Record>({
        name: `person_${personId}_skills_temp`,
        actionRoutes: {
            getRoute: `v2/persons/${personId}/profile/skills/search`,
            addNewRoute: `v2/persons/${personId}/profile/skills`,
            editRoute: `v2/persons/${personId}/profile/skills`,
            deleteRoute: `v2/persons/${personId}/profile/skills`,
        },
    });
}
