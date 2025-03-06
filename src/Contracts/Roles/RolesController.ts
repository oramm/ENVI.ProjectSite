import { PersonData, RoleData } from "../../../Typings/bussinesTypes";
import RepositoryReact from "../../React/RepositoryReact";

export const rolesRepository = new RepositoryReact<RoleData>({
    actionRoutes: {
        getRoute: "roles",
        addNewRoute: "role",
        editRoute: "role",
        deleteRoute: "role",
    },
    name: "roles",
});

export const personsRepository = new RepositoryReact<PersonData>({
    actionRoutes: {
        getRoute: "persons",
        addNewRoute: "",
        editRoute: "",
        deleteRoute: "",
    },
    name: "contractRoles-persons",
});
