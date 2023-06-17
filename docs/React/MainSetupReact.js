"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ToolsDate_1 = __importDefault(require("./ToolsDate"));
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
MainSetup.InvoiceStatuses = {
    FOR_LATER: 'Na później',
    TO_DO: 'Do zrobienia',
    DONE: 'Zrobiona',
    SENT: 'Wysłana',
    PAID: 'Zapłacona',
    TO_CORRECT: 'Do korekty',
    WITHDRAWN: 'Wycofana',
};
MainSetup.ProjectStatuses = {
    NOT_STARTED: 'Nie rozpoczęty',
    IN_PROGRESS: 'W trakcie',
    FINISHED: 'Zakończony',
};
MainSetup.ContractStatuses = {
    NOT_STARTED: 'Nie rozpoczęty',
    IN_PROGRESS: 'W trakcie',
    FINISHED: 'Zakończony',
    ARCHIVAL: 'Archiwalny',
};
MainSetup.TaskStatuses = {
    BACKLOG: 'Backlog',
    NOT_STARTED: 'Nie rozpoczęty',
    IN_PROGRESS: 'W trakcie',
    TO_CORRECT: 'Do poprawy',
    AWAITING_RESPONSE: 'Oczekiwanie na odpowiedź',
    DONE: 'Zrobione',
};
MainSetup.InvoicesFilterInitState = {
    ISSUE_DATE_FROM: ToolsDate_1.default.addDays(new Date(), -90).toISOString().slice(0, 10),
    ISSUE_DATE_TO: ToolsDate_1.default.addDays(new Date(), +10).toISOString().slice(0, 10),
};
MainSetup.LettersFilterInitState = {
    CREATION_DATE_FROM: ToolsDate_1.default.addDays(new Date(), -365).toISOString().slice(0, 10),
    CREATION_DATE_TO: ToolsDate_1.default.addDays(new Date(), +5).toISOString().slice(0, 10),
};
