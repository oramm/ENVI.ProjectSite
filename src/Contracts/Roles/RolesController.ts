import {
    ContractRoleData,
    OtherContract,
    OurContract,
    PersonData,
    ProjectData,
    ProjectRoleData,
} from "../../../Typings/bussinesTypes";
import RepositoryReact from "../../React/RepositoryReact";

export const rolesRepository = new RepositoryReact<ContractRoleData | ProjectRoleData>({
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

export function isProjectRole(role: ContractRoleData | ProjectRoleData): role is ProjectRoleData {
    if (!(role as ProjectRoleData)._project?.ourId && !(role as ContractRoleData)._contract?.id)
        console.error("RoleData is not a ProjectRoleData nor ContractRoleData");
    return (role as ProjectRoleData)._project !== undefined;
}
