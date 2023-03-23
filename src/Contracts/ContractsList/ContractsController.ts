import RepositoryReact from "../../React/RepositoryReact";


export default class ContractsController {
    static contractsRepository = new RepositoryReact({
        actionRoutes: {
            getRoute: 'contracts',
            addNewRoute: 'contract',
            editRoute: 'contract',
            deleteRoute: 'contract'
        },
        name: 'contracts'
    });

    static entitiesRepository = new RepositoryReact({
        actionRoutes: {
            getRoute: 'entities',
            addNewRoute: 'entity',
            editRoute: 'entity',
            deleteRoute: 'entity'
        },
        name: 'entities'
    });

    static projectsRepository = new RepositoryReact({
        actionRoutes: {
            getRoute: 'projects',
            addNewRoute: 'project',
            editRoute: 'project',
            deleteRoute: 'project'
        },
        name: 'projects'
    });

}