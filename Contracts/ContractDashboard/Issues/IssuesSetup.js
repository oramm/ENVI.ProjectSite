var issuesRepository;
var reactionsRepository;
var personsRepository;

var statusNames = ['Nowe','W trakcie','Do akceptacji','Zakończone','Duplikat'];

class IssuesSetup {
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
    static get personsRepository() {
        return personsRepository;
    }
    static set personsRepository(data) {
        personsRepository = data;
    }
    static get statusNames() {
        return statusNames;
    }
}