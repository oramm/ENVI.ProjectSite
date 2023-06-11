"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class MainSetup {
    static get currentUser() {
        return JSON.parse(sessionStorage.getItem('Current User'));
    }
    static set currentUser(data) {
        sessionStorage.setItem('Current User', JSON.stringify(data));
    }
    static getCurrentUserAsPerson() {
        const currentUser = this.currentUser;
        return this.personsEnviRepository.items.find(p => `${p.name} ${p.surname}` === currentUser.userName);
    }
    static get currentProject() {
        return JSON.parse(sessionStorage.getItem('Projects repository')).currentItems[0];
    }
    static get currentContract() {
        return JSON.parse(sessionStorage.getItem('Contracts repository')).currentItems[0];
    }
}
exports.default = MainSetup;
MainSetup.CLIENT_ID = '386403657277-9mh2cnqb9dneoh8lc6o2m339eemj24he.apps.googleusercontent.com'; //ENVI - nowy test
MainSetup.serverUrl = (window.location.href.includes('localhost')) ? 'http://localhost:3000/' : 'https://erp-envi.herokuapp.com/';
MainSetup.invoiceStatusNames = [
    'Na później',
    'Do zrobienia',
    'Zrobiona',
    'Wysłana',
    'Zapłacona',
    'Do korekty',
    'Wycofana'
];
MainSetup.contractStatusNames = [
    'Nie rozpoczęty',
    'W trakcie',
    'Zakończony',
    'Archiwalny'
];
MainSetup.taskStatusNames = [
    'Backlog',
    'Nie rozpoczęty',
    'W trakcie',
    'Do poprawy',
    'Oczekiwanie na odpowiedź',
    'Zrobione'
];
