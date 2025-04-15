import { MilestoneDateData, OtherContract, OurContract, PersonData, ProjectData } from "../../../Typings/bussinesTypes";
import RepositoryReact from "../../React/RepositoryReact";

export const milestoneDatesRepository = new RepositoryReact<MilestoneDateData>({
    actionRoutes: {
        getRoute: "milestoneDates",
        addNewRoute: "milestoneDate",
        editRoute: "milestoneDate",
        deleteRoute: "milestoneDate",
    },
    name: "milestoneDates",
});

export const personsRepository = new RepositoryReact<PersonData>({
    actionRoutes: {
        getRoute: "persons",
        addNewRoute: "",
        editRoute: "",
        deleteRoute: "",
    },
    name: "milestoneDates-persons",
});

export const projectsRepository = new RepositoryReact<ProjectData>({
    actionRoutes: {
        getRoute: "projects",
        addNewRoute: "",
        editRoute: "",
        deleteRoute: "",
    },
    name: "milestoneDates-projects",
});

export const contractsRepository = new RepositoryReact<OurContract | OtherContract>({
    actionRoutes: {
        getRoute: "contracts",
        addNewRoute: "",
        editRoute: "",
        deleteRoute: "",
    },
    name: "milestoneDates-contracts",
});
