import { CaseType, ContractType, Person, Project } from "../../Typings/bussinesTypes";
import RepositoryReact from "./RepositoryReact";

export default class MainSetup {
    static projectsRepository: RepositoryReact<Project>;
    static documentTemplatesRepository: RepositoryReact;
    static personsEnviRepository: RepositoryReact<Person>;
    static contractTypesRepository: RepositoryReact<ContractType>;
    static caseTypesRepository: RepositoryReact<CaseType>;

    static CLIENT_ID = '386403657277-9mh2cnqb9dneoh8lc6o2m339eemj24he.apps.googleusercontent.com'; //ENVI - nowy test

    static serverUrl = (window.location.href.includes('localhost')) ? 'http://localhost:3000/' : 'https://erp-envi.herokuapp.com/';

    static get currentUser() {
        return JSON.parse(<string>sessionStorage.getItem('Current User'));
    }

    static set currentUser(data) {
        sessionStorage.setItem('Current User', JSON.stringify(data));
    }

    static get currentProject() {
        return JSON.parse(<string>sessionStorage.getItem('Projects repository')).currentItems[0];
    }
    static get currentContract() {
        return JSON.parse(<string>sessionStorage.getItem('Contracts repository')).currentItems[0];
    }
}