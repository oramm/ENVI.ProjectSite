"use strict";
var taskTemplatesRepository;
var statusNames = ['Backlog',
    'Nie rozpoczęty',
    'W trakcie',
    'Do poprawy',
    'Oczekiwanie na odpowiedź',
    'Zrobione'
];
var TaskTemplatesSetup = /** @class */ (function () {
    function TaskTemplatesSetup() {
    }
    Object.defineProperty(TaskTemplatesSetup, "currentCaseTemplate", {
        get: function () {
            return JSON.parse(sessionStorage.getItem('CaseTemplates repository')).currentItemLocalData;
            ;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(TaskTemplatesSetup, "statusNames", {
        get: function () {
            return statusNames;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(TaskTemplatesSetup, "taskTemplatesRepository", {
        get: function () {
            return taskTemplatesRepository;
        },
        set: function (data) {
            taskTemplatesRepository = data;
        },
        enumerable: false,
        configurable: true
    });
    return TaskTemplatesSetup;
}());
