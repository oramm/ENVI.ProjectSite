import { EntityData, SystemUserData, SystemRole} from "../../../Typings/bussinesTypes";
import RepositoryReact from "../../React/RepositoryReact";

export const systemUserRepository = new RepositoryReact<SystemUserData>({
    actionRoutes: {
        getRoute: "persons",
        addNewRoute: "systemUser",
        editRoute: "user",
        deleteRoute: "person",
    },
    name: "persons",
});

export const entitiesRepository = new RepositoryReact<EntityData>({
    actionRoutes: {
        getRoute: "entities",
        addNewRoute: "entity",
        editRoute: "entity",
        deleteRoute: "entity",
    },
    name: "entities_persons",
});