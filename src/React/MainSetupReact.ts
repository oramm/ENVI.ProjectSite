import RepositoryReact from "./RepositoryReact";

export default class MainSetup {
    static projectsRepository: RepositoryReact;
    static documentTemplatesRepository: RepositoryReact;
    static personsEnviRepository: RepositoryReact;
    static contractTypesRepository: RepositoryReact;
    static caseTypesRepository: RepositoryReact;

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