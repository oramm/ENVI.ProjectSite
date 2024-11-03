import { EntityData, PersonData } from "../../Typings/bussinesTypes";
import RepositoryReact from "../React/RepositoryReact";

export const personsRepository = new RepositoryReact<PersonData>({
    actionRoutes: {
        getRoute: "persons",
        addNewRoute: "person",
        editRoute: "person",
        deleteRoute: "person",
    },
    name: "persons",
});

//Entuties
export const entitiesRepository = new RepositoryReact<EntityData>({
    actionRoutes: {
        getRoute: "entities",
        addNewRoute: "entity",
        editRoute: "entity",
        deleteRoute: "entity",
    },
    name: "entities_persons",
});
