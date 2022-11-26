"use strict";
var processesInstancesRepository;
var processesInstancesStepsRepository;
var processesStepsInstancesRepository;
var ProcessesInstancesSetup = /** @class */ (function () {
    function ProcessesInstancesSetup() {
    }
    Object.defineProperty(ProcessesInstancesSetup, "processesInstancesRepository", {
        get: function () {
            return processesInstancesRepository;
        },
        set: function (data) {
            processesInstancesRepository = data;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(ProcessesInstancesSetup, "processesStepsInstancesRepository", {
        get: function () {
            return processesStepsInstancesRepository;
        },
        set: function (data) {
            processesStepsInstancesRepository = data;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(ProcessesInstancesSetup, "processesStepsInstancesStatusNames", {
        get: function () {
            return ['Nie rozpoczęte',
                'W trakcie',
                'Zrobione'
            ];
        },
        enumerable: false,
        configurable: true
    });
    return ProcessesInstancesSetup;
}());
