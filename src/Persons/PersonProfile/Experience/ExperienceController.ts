import { PersonProfileExperienceV2Record } from "../../../../Typings/bussinesTypes";
import RepositoryReact from "../../../React/RepositoryReact";

export function createExperienceRepository(personId: number) {
    return new RepositoryReact<PersonProfileExperienceV2Record>({
        name: `person_${personId}_experiences_temp`,
        actionRoutes: {
            getRoute: `v2/persons/${personId}/profile/experiences/search`,
            addNewRoute: `v2/persons/${personId}/profile/experiences`,
            editRoute: `v2/persons/${personId}/profile/experiences`,
            deleteRoute: `v2/persons/${personId}/profile/experiences`,
        },
    });
}
