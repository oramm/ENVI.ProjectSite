import { Case, CaseType, Entity, Milestone, MilestoneType, OtherContract, OurContract, Project, Task } from "../../Typings/bussinesTypes";
import RepositoryReact from "../React/RepositoryReact";

export const contractsRepository = new RepositoryReact<OurContract | OtherContract>({
    actionRoutes: {
        getRoute: 'contracts',
        addNewRoute: 'contractReact',
        editRoute: 'contract',
        deleteRoute: 'contract'
    },
    name: 'contracts'
});

export const milestonesRepository = new RepositoryReact<Milestone>({
    actionRoutes: {
        getRoute: 'milestones',
        addNewRoute: 'milestone',
        editRoute: 'milestone',
        deleteRoute: 'milestone'
    },
    name: 'milestones'
});

export const casesRepository = new RepositoryReact<Case>({
    actionRoutes: {
        getRoute: 'cases',
        addNewRoute: 'case',
        editRoute: 'case',
        deleteRoute: 'case'
    },
    name: 'cases'
});

export const tasksRepository = new RepositoryReact<Task>({
    actionRoutes: {
        getRoute: 'tasks',
        addNewRoute: 'task',
        editRoute: 'task',
        deleteRoute: 'task'
    },
    name: 'tasks'
});

export const milestoneTypesRepository = new RepositoryReact<MilestoneType>({
    actionRoutes: {
        getRoute: 'milestoneTypes',
        addNewRoute: 'milestoneType',
        editRoute: 'milestoneType',
        deleteRoute: 'milestoneType'
    },
    name: 'milestoneTypes'
});

export const caseTypesRepository = new RepositoryReact<CaseType>({
    actionRoutes: {
        getRoute: 'caseTypes',
        addNewRoute: 'caseType',
        editRoute: 'caseType',
        deleteRoute: 'caseType'
    },
    name: 'caseTypes'
});

export const entitiesRepository = new RepositoryReact<Entity>({
    actionRoutes: {
        getRoute: 'entities',
        addNewRoute: 'entity',
        editRoute: 'entity',
        deleteRoute: 'entity'
    },
    name: 'entities'
});

export const projectsRepository = new RepositoryReact<Project>({
    actionRoutes: {
        getRoute: 'projects',
        addNewRoute: 'project',
        editRoute: 'project',
        deleteRoute: 'project'
    },
    name: 'projects'
});
