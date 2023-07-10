import { CaseType, ContractType, DocumentTemplate, Person, Project, User } from "../../Typings/bussinesTypes";
import RepositoryReact from "./RepositoryReact";
import ToolsDate from "./ToolsDate";

export default class MainSetup {
    static projectsRepository: RepositoryReact<Project>;
    static documentTemplatesRepository: RepositoryReact<DocumentTemplate>;
    static personsEnviRepository: RepositoryReact<Person>;
    static contractTypesRepository: RepositoryReact<ContractType>;

    static CLIENT_ID = '386403657277-9mh2cnqb9dneoh8lc6o2m339eemj24he.apps.googleusercontent.com'; //ENVI - nowy test

    static serverUrl = (window.location.href.includes('localhost')) ? 'http://localhost:3000/' : 'https://erp-envi.herokuapp.com/';

    static get currentUser() {
        return JSON.parse(<string>sessionStorage.getItem('Current User')) as User;
    }

    static set currentUser(data) {
        sessionStorage.setItem('Current User', JSON.stringify(data));
    }

    static getCurrentUserAsPerson() {
        const currentUser = this.currentUser;
        return this.personsEnviRepository.items.find(p => `${p.name} ${p.surname}` === currentUser.userName);
    }

    static get currentProject() {
        return JSON.parse(<string>sessionStorage.getItem('Projects repository')).currentItems[0];
    }
    static get currentContract() {
        return JSON.parse(<string>sessionStorage.getItem('Contracts repository')).currentItems[0];
    }

    static InvoiceStatuses = {
        FOR_LATER: 'Na później',
        TO_DO: 'Do zrobienia',
        DONE: 'Zrobiona',
        SENT: 'Wysłana',
        PAID: 'Zapłacona',
        TO_CORRECT: 'Do korekty',
        WITHDRAWN: 'Wycofana',
    };

    static ProjectStatuses = {
        NOT_STARTED: 'Nie rozpoczęty',
        IN_PROGRESS: 'W trakcie',
        FINISHED: 'Zakończony',
    };

    static ContractStatuses = {
        NOT_STARTED: 'Nie rozpoczęty',
        IN_PROGRESS: 'W trakcie',
        FINISHED: 'Zakończony',
        ARCHIVAL: 'Archiwalny',
    };


    static TaskStatuses = {
        BACKLOG: 'Backlog',
        NOT_STARTED: 'Nie rozpoczęty',
        IN_PROGRESS: 'W trakcie',
        TO_CORRECT: 'Do poprawy',
        AWAITING_RESPONSE: 'Oczekiwanie na odpowiedź',
        DONE: 'Zrobione',
    };

    static InvoicesFilterInitState = {
        ISSUE_DATE_FROM: ToolsDate.addDays(new Date(), -90).toISOString().slice(0, 10),
        ISSUE_DATE_TO: ToolsDate.addDays(new Date(), +10).toISOString().slice(0, 10),
    }

    static LettersFilterInitState = {
        CREATION_DATE_FROM: ToolsDate.addDays(new Date(), -365).toISOString().slice(0, 10),
        CREATION_DATE_TO: ToolsDate.addDays(new Date(), +5).toISOString().slice(0, 10),
    }
}