import { Entity, OtherContract, OurContract, Project } from "../../../Typings/bussinesTypes";
import RepositoryReact from "../../React/RepositoryReact";


export default class ContractsController {
    static statusNames = [
        'Nie rozpoczęty',
        'W trakcie',
        'Zakończony',
        'Archiwalny'
    ];

    static contractsRepository = new RepositoryReact<OurContract | OtherContract>({
        actionRoutes: {
            getRoute: 'contracts',
            addNewRoute: 'contractReact',
            editRoute: 'contract',
            deleteRoute: 'contract'
        },
        name: 'contracts'
    });

    static entitiesRepository = new RepositoryReact<Entity>({
        actionRoutes: {
            getRoute: 'entities',
            addNewRoute: 'entity',
            editRoute: 'entity',
            deleteRoute: 'entity'
        },
        name: 'entities'
    });

    static projectsRepository = new RepositoryReact<Project>({
        actionRoutes: {
            getRoute: 'projects',
            addNewRoute: 'project',
            editRoute: 'project',
            deleteRoute: 'project'
        },
        name: 'projects'
    });

}