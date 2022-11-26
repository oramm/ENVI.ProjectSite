"use strict";
var casesRepository;
var caseTypesRepository;
var eventsRepository;
var CasesSetup = /** @class */ (function () {
    function CasesSetup() {
    }
    Object.defineProperty(CasesSetup, "currentMilestone", {
        //static currentMilestone = JSON.parse(sessionStorage.getItem('Milestones repository')).currentItemLocalData;
        get: function () {
            return JSON.parse(sessionStorage.getItem('Milestones repository')).currentItemLocalData;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(CasesSetup, "casesRepository", {
        get: function () {
            return casesRepository;
        },
        set: function (data) {
            casesRepository = data;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(CasesSetup, "caseTypesRepository", {
        get: function () {
            return caseTypesRepository;
        },
        set: function (data) {
            caseTypesRepository = data;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(CasesSetup, "eventsRepository", {
        get: function () {
            return eventsRepository;
        },
        set: function (data) {
            eventsRepository = data;
        },
        enumerable: false,
        configurable: true
    });
    return CasesSetup;
}());
