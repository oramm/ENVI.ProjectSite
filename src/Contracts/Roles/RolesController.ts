import { OtherContract, OurContract, PersonData, ProjectData, RoleData } from "../../../Typings/bussinesTypes";
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

export const projectsRepository = new RepositoryReact<ProjectData>({
    actionRoutes: {
        getRoute: "projects",
        addNewRoute: "",
        editRoute: "",
        deleteRoute: "",
    },
    name: "contractRoles-projects",
});

export const contractsRepository = new RepositoryReact<OurContract | OtherContract>({
    actionRoutes: {
        getRoute: "contracts",
        addNewRoute: "",
        editRoute: "",
        deleteRoute: "",
    },
    name: "contractRoles-contracts",
});
