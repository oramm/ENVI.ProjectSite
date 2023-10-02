import { Case, Contract, Entity, IncomingLetter, Milestone, OtherContract, OurContract, OurLetter, Project, Security, Task } from "../../../Typings/bussinesTypes";

import RepositoryReact from "../RepositoryReact";



export const contractsRepository = new RepositoryReact<OurContract | OtherContract>({
    actionRoutes: {
        getRoute: 'contracts',
        addNewRoute: '',
        editRoute: '',
        deleteRoute: ''
    },
    name: 'contracts'
});

export const securitiesRepository = new RepositoryReact<Security>({
    actionRoutes: {
        getRoute: 'securities',
        addNewRoute: 'security',
        editRoute: 'security',
        deleteRoute: 'security'
    },
    name: 'securities'
});

export const milestonesRepository = new RepositoryReact<Milestone>({
    actionRoutes: {
        getRoute: 'milestones',
        addNewRoute: '',
        editRoute: '',
        deleteRoute: ''
    },
    name: 'milestones'
});

export const tasksRepository = new RepositoryReact<Task>({
    actionRoutes: {
        getRoute: 'tasks',
        addNewRoute: '',
        editRoute: '',
        deleteRoute: ''
    },
    name: 'tasks'
});

export const casesRepository = new RepositoryReact<Case>({
    actionRoutes: {
        getRoute: 'cases',
        addNewRoute: '',
        editRoute: '',
        deleteRoute: ''
    },
    name: 'cases'
});