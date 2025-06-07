import { EntityData } from "../../Typings/bussinesTypes";
import RepositoryReact from "../React/RepositoryReact";

export const entitiesRepository = new RepositoryReact<EntityData>({
    actionRoutes: {
        getRoute: "entities",
        addNewRoute: "entity",
        editRoute: "entity",
        deleteRoute: "entity",
    },
    name: "entities",
});
