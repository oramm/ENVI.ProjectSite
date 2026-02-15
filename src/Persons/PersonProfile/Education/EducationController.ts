import { PersonProfileEducationV2Record } from "../../../../Typings/bussinesTypes";
import RepositoryReact from "../../../React/RepositoryReact";

export function createEducationsRepository(personId: number) {
    return new RepositoryReact<PersonProfileEducationV2Record>({
        name: `person_${personId}_educations_temp`,
        actionRoutes: {
            getRoute: `v2/persons/${personId}/profile/educations/search`,
            addNewRoute: `v2/persons/${personId}/profile/educations`,
            editRoute: `v2/persons/${personId}/profile/educations`,
            deleteRoute: `v2/persons/${personId}/profile/educations`,
        },
    });
}
