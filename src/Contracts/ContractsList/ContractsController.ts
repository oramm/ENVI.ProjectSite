import {
    Case,
    CaseType,
    City,
    ContractRangeData,
    ContractsSettlementData,
    Entity,
    Invoice,
    Milestone,
    MilestoneType,
    OtherContract,
    OurContract,
    Project,
    Security,
    Task,
} from "../../../Typings/bussinesTypes";
import RepositoryReact from "../../React/RepositoryReact";

export const contractsRepository = new RepositoryReact<OurContract | OtherContract>({
    actionRoutes: {
        getRoute: "contracts",
        addNewRoute: "contractReact",
        editRoute: "contract",
        deleteRoute: "contract",
    },
    name: "contracts",
});

export const milestonesRepository = new RepositoryReact<Milestone>({
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

export const tasksRepository = new RepositoryReact<Task>({
    actionRoutes: {
        getRoute: "tasks",
        addNewRoute: "task",
        editRoute: "task",
        deleteRoute: "task",
    },
    name: "tasks",
});

export const milestoneTypesRepository = new RepositoryReact<MilestoneType>({
    actionRoutes: {
        getRoute: "milestoneTypes",
        addNewRoute: "milestoneType",
        editRoute: "milestoneType",
        deleteRoute: "milestoneType",
    },
    name: "milestoneTypes",
});

export const caseTypesRepository = new RepositoryReact<CaseType>({
    actionRoutes: {
        getRoute: "caseTypes",
        addNewRoute: "caseType",
        editRoute: "caseType",
        deleteRoute: "caseType",
    },
    name: "caseTypes",
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

export const contractRangesRepository = new RepositoryReact<ContractRangeData>({
    actionRoutes: {
        getRoute: "contractRanges",
        addNewRoute: "",
        editRoute: "",
        deleteRoute: "",
    },
    name: "contractRanges",
});

export const projectsRepository = new RepositoryReact<Project>({
    actionRoutes: {
        getRoute: "projects",
        addNewRoute: "project",
        editRoute: "project",
        deleteRoute: "project",
    },
    name: "projects",
});

export const contractsSettlementRepository = new RepositoryReact<ContractsSettlementData>({
    actionRoutes: {
        getRoute: "contractsSettlementData",
        addNewRoute: "",
        editRoute: "",
        deleteRoute: "",
    },
    name: "contractsSettlement",
});

export const invoicesRepository = new RepositoryReact<Invoice>({
    actionRoutes: {
        getRoute: "invoices",
        addNewRoute: "invoice",
        editRoute: "invoice",
        copyRoute: "copyInvoice",
        deleteRoute: "invoice",
    },
    name: "invoices",
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

//citiesRepository.getRoute = 'cities';
export const citiesRepository = new RepositoryReact<City>({
    actionRoutes: {
        getRoute: "cities",
        addNewRoute: "city",
        editRoute: "city",
        deleteRoute: "city",
    },
    name: "cities",
});
