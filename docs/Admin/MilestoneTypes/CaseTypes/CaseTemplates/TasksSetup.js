"use strict";
var tasksRepository;
const statusNames = ['Backlog',
    'Nie rozpoczęty',
    'W trakcie',
    'Do poprawy',
    'Oczekiwanie na odpowiedź',
    'Zrobione'
];
class TasksSetup {
    static get statusNames() {
        return statusNames;
    }
    static get tasksRepository() {
        return tasksRepository;
    }
}
