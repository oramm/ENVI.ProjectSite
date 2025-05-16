import {
    Case,
    MilestoneData,
    MilestoneDateData,
    OtherContract,
    OurContract,
    Security,
    Task,
} from "../../../Typings/bussinesTypes";

import RepositoryReact from "../RepositoryReact";

export const contractsRepository = new RepositoryReact<OurContract | OtherContract>({
    actionRoutes: {
        getRoute: "contracts",
        addNewRoute: "",
        editRoute: "contract",
        deleteRoute: "",
    },
    name: "dashboardContracts",
});

export const securitiesRepository = new RepositoryReact<Security>({
    actionRoutes: {
        getRoute: "securities",
        addNewRoute: "security",
        editRoute: "security",
        deleteRoute: "security",
    },
    name: "securities",
});

export const milestoneDatesRepository = new RepositoryReact<MilestoneDateData>({
    actionRoutes: {
        getRoute: "milestoneDates",
        addNewRoute: "milestoneDate",
        editRoute: "milestoneDate",
        deleteRoute: "milestoneDate",
    },
    name: "milestoneDates",
});

export const tasksRepository = new RepositoryReact<Task>({
    actionRoutes: {
        getRoute: "tasks",
        addNewRoute: "",
        editRoute: "",
        deleteRoute: "",
    },
    name: "tasks",
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
