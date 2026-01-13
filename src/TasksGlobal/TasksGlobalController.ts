import {
    Case,
    EntityData,
    MilestoneData,
    OtherContract,
    OurContract,
    ProjectData,
    Task,
} from "../../Typings/bussinesTypes";
import RepositoryReact from "../React/RepositoryReact";
import { ContractsWithChildren } from "./TasksGlobalTypes";

export const contractsWithChildrenRepository = new RepositoryReact<ContractsWithChildren>({
    actionRoutes: {
        getRoute: "contractsWithChildren",
        addNewRoute: "",
        editRoute: "",
        deleteRoute: "",
    },
    name: "contractsWithChildren",
});

export const contractsRepository = new RepositoryReact<OurContract | OtherContract>({
    actionRoutes: {
        getRoute: "contractsWithChildren",
        addNewRoute: "contractReact",
        editRoute: "contract",
        deleteRoute: "contract",
    },
    name: "contracts",
});

export const milestonesRepository = new RepositoryReact<MilestoneData>({
    actionRoutes: {
        getRoute: "milestones",
        addNewRoute: "milestone",
        editRoute: "milestone",
        deleteRoute: "milestone",
    },
    name: "milestones",
});

export const casesRepository = new RepositoryReact<Case>({
    actionRoutes: {
        getRoute: "cases",
        addNewRoute: "case",
        editRoute: "case",
        deleteRoute: "case",
    },
    name: "cases",
});

/** do przegladania zadań w widoku płaskim */
export const tasksRepository = new RepositoryReact<Task>({
    actionRoutes: {
        getRoute: "tasks",
        addNewRoute: "task",
        editRoute: "task",
        deleteRoute: "task",
    },
    name: "tasks",
});

/**
 * do przegladania zadań w widoku hierarchicznym
 */
export const tasksGlobalRepository = new RepositoryReact<Task>({
    actionRoutes: {
        getRoute: "tasks",
        addNewRoute: "task",
        editRoute: "task",
        deleteRoute: "task",
    },
    name: "tasks",
});

export const entitiesRepository = new RepositoryReact<EntityData>({
    actionRoutes: {
        getRoute: "entities",
        addNewRoute: "entity",
        editRoute: "entity",
        deleteRoute: "entity",
    },
    name: "entities",
});

export const projectsRepository = new RepositoryReact<ProjectData>({
    actionRoutes: {
        getRoute: "projects",
        addNewRoute: "project",
        editRoute: "project",
        deleteRoute: "project",
    },
    name: "projects",
});
