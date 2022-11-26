"use strict";
var caseTypesRepository;
var caseTemplatesRepository;
var CaseTypesSetup = /** @class */ (function () {
    function CaseTypesSetup() {
    }
    Object.defineProperty(CaseTypesSetup, "currentMilestoneType", {
        //static currentMilestone = JSON.parse(sessionStorage.getItem('Milestones repository')).currentItemLocalData;
        get: function () {
            return JSON.parse(sessionStorage.getItem('MilestoneTypes repository')).currentItemLocalData;
            ;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(CaseTypesSetup, "caseTypesRepository", {
        get: function () {
            return caseTypesRepository;
        },
        set: function (data) {
            caseTypesRepository = data;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(CaseTypesSetup, "caseTemplatesRepository", {
        get: function () {
            return caseTemplatesRepository;
        },
        set: function (data) {
            caseTemplatesRepository = data;
        },
        enumerable: false,
        configurable: true
    });
    return CaseTypesSetup;
}());
