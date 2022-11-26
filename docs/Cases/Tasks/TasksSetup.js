"use strict";
var tasksRepository;
var statusNames = ['Backlog',
    'Nie rozpoczęty',
    'W trakcie',
    'Do poprawy',
    'Oczekiwanie na odpowiedź',
    'Zrobione'
];
var TasksSetup = /** @class */ (function () {
    function TasksSetup() {
    }
    Object.defineProperty(TasksSetup, "statusNames", {
        get: function () {
            return statusNames;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(TasksSetup, "tasksRepository", {
        get: function () {
            return tasksRepository;
        },
        enumerable: false,
        configurable: true
    });
    return TasksSetup;
}());
