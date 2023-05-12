import { Case, Contract, Entity, IncomingLetter, Milestone, OtherContract, OurContract, OurLetter, Project } from "../../../Typings/bussinesTypes";
import RepositoryReact from "../../React/RepositoryReact";


export default class LettersController {
    static statusNames = [
        'Roboczy',
        'Do wysłania',
        'Wysłany',
    ];

    static lettersRepository = new RepositoryReact<OurLetter | IncomingLetter>({
        actionRoutes: {
            getRoute: 'letters',
            addNewRoute: 'letterReact',
            editRoute: 'letter',
            deleteRoute: 'letter'
        },
        name: 'letters'
    });

    static projectsRepository = new RepositoryReact<Project>({
        actionRoutes: {
            getRoute: 'projects',
            addNewRoute: '',
            editRoute: '',
            deleteRoute: ''
        },
        name: 'projects'
    });

    static contractsRepository = new RepositoryReact<OurContract | OtherContract>({
        actionRoutes: {
            getRoute: 'contracts',
            addNewRoute: '',
            editRoute: '',
            deleteRoute: ''
        },
        name: 'contracts'
    });

    static milestonesRepository = new RepositoryReact<Milestone>({
        actionRoutes: {
            getRoute: 'milestones',
            addNewRoute: '',
            editRoute: '',
            deleteRoute: ''
        },
        name: 'milestones'
    });

    static casesRepository = new RepositoryReact<Case>({
        actionRoutes: {
            getRoute: 'cases',
            addNewRoute: '',
            editRoute: '',
            deleteRoute: ''
        },
        name: 'cases'
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
}