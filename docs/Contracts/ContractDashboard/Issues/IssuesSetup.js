"use strict";
var issuesRepository;
var reactionsRepository;
var statusNames = ['Nowe', 'W trakcie', 'Do akceptacji', 'Zakończone', 'Duplikat'];
class IssuesSetup {
    static get currentContract() {
        return JSON.parse(sessionStorage.getItem('Contracts repository')).currentItemLocalData;
    }
    static get issuesRepository() {
        return issuesRepository;
    }
    static set issuesRepository(data) {
        issuesRepository = data;
    }
    static get reactionsRepository() {
        return reactionsRepository;
    }
    static set reactionsRepository(data) {
        reactionsRepository = data;
    }
    static get statusNames() {
        return statusNames;
    }
}
