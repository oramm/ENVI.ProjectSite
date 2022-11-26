"use strict";
var meetingsRepository;
var meetingArrangementsRepository;
var milestonesRepository;
var casesRepository;
var MeetingsSetup = /** @class */ (function () {
    function MeetingsSetup() {
    }
    Object.defineProperty(MeetingsSetup, "currentProject", {
        get: function () {
            return JSON.parse(sessionStorage.getItem('Projects repository')).currentItemLocalData;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(MeetingsSetup, "currentContract", {
        get: function () {
            return JSON.parse(sessionStorage.getItem('Contracts repository')).currentItemLocalData;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(MeetingsSetup, "meetingsRepository", {
        get: function () {
            return meetingsRepository;
        },
        set: function (data) {
            meetingsRepository = data;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(MeetingsSetup, "meetingArrangementsRepository", {
        get: function () {
            return meetingArrangementsRepository;
        },
        set: function (data) {
            meetingArrangementsRepository = data;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(MeetingsSetup, "milestonesRepository", {
        get: function () {
            return milestonesRepository;
        },
        set: function (data) {
            milestonesRepository = data;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(MeetingsSetup, "casesRepository", {
        get: function () {
            return casesRepository;
        },
        set: function (data) {
            casesRepository = data;
        },
        enumerable: false,
        configurable: true
    });
    return MeetingsSetup;
}());
