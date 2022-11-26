"use strict";
var processesRepository;
var processStepsRepository;
var caseTypesRepository;
var ProcessesSetup = /** @class */ (function () {
    function ProcessesSetup() {
    }
    Object.defineProperty(ProcessesSetup, "processesRepository", {
        get: function () {
            return processesRepository;
        },
        set: function (data) {
            processesRepository = data;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(ProcessesSetup, "processStepsRepository", {
        get: function () {
            return processStepsRepository;
        },
        set: function (data) {
            processStepsRepository = data;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(ProcessesSetup, "caseTypesRepository", {
        get: function () {
            return caseTypesRepository;
        },
        set: function (data) {
            caseTypesRepository = data;
        },
        enumerable: false,
        configurable: true
    });
    return ProcessesSetup;
}());
