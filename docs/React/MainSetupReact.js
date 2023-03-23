"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class MainSetup {
    static get currentUser() {
        return JSON.parse(sessionStorage.getItem('Current User'));
    }
    static set currentUser(data) {
        sessionStorage.setItem('Current User', JSON.stringify(data));
    }
    static get currentProject() {
        return JSON.parse(sessionStorage.getItem('Projects repository')).currentItems[0];
    }
    static get currentContract() {
        return JSON.parse(sessionStorage.getItem('Contracts repository')).currentItems[0];
    }
}
exports.default = MainSetup;
MainSetup.serverUrl = (window.location.href.includes('localhost')) ? 'http://localhost:3000/' : 'https://erp-envi.herokuapp.com/';
