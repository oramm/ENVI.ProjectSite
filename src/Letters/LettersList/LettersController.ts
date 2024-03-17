import {
    Case,
    Contract,
    Entity,
    IncomingLetter,
    Milestone,
    OtherContract,
    OurContract,
    OurLetter,
    Project,
} from "../../../Typings/bussinesTypes";
import RepositoryReact from "../../React/RepositoryReact";

export const lettersRepository = new RepositoryReact<OurLetter | IncomingLetter>({
    actionRoutes: {
        getRoute: "contractsLetters",
        addNewRoute: "letterReact",
        editRoute: "letter",
        deleteRoute: "letter",
    },
    name: "contractsLetters",
});

export const projectsRepository = new RepositoryReact<Project>({
    actionRoutes: {
        getRoute: "projects",
        addNewRoute: "",
        editRoute: "",
        deleteRoute: "",
    },
    name: "projects",
});

export const contractsRepository = new RepositoryReact<OurContract | OtherContract>({
    actionRoutes: {
        getRoute: "contracts",
        addNewRoute: "",
        editRoute: "",
        deleteRoute: "",
    },
    name: "contracts",
});

export const milestonesRepository = new RepositoryReact<Milestone>({
    actionRoutes: {
        getRoute: "milestones",
        addNewRoute: "",
        editRoute: "",
        deleteRoute: "",
    },
    name: "milestones",
});

export const casesRepository = new RepositoryReact<Case>({
    actionRoutes: {
        getRoute: "cases",
        addNewRoute: "",
        editRoute: "",
        deleteRoute: "",
    },
    name: "cases",
});

export const entitiesRepository = new RepositoryReact<Entity>({
    actionRoutes: {
        getRoute: "entities",
        addNewRoute: "entity",
        editRoute: "entity",
        deleteRoute: "entity",
    },
    name: "entities",
});
