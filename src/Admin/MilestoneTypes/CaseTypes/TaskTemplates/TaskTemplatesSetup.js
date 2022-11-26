var taskTemplatesRepository;

const statusNames = [   'Backlog',
                        'Nie rozpoczęty',
                        'W trakcie',
                        'Do poprawy',
                        'Oczekiwanie na odpowiedź',
                        'Zrobione'
                    ];

class TaskTemplatesSetup {
    static get currentCaseTemplate() {
        return JSON.parse(sessionStorage.getItem('CaseTemplates repository')).currentItemLocalData;;
    }
    static get statusNames() {
        return statusNames;
    }
    static get taskTemplatesRepository() {
        return taskTemplatesRepository;
    }
    static set taskTemplatesRepository(data) {
        taskTemplatesRepository = data;
    }
}