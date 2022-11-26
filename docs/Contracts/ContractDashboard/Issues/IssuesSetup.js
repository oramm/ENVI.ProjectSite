"use strict";
var issuesRepository;
var reactionsRepository;
var statusNames = ['Nowe', 'W trakcie', 'Do akceptacji', 'Zakończone', 'Duplikat'];
var IssuesSetup = /** @class */ (function () {
    function IssuesSetup() {
    }
    Object.defineProperty(IssuesSetup, "currentContract", {
        get: function () {
            return JSON.parse(sessionStorage.getItem('Contracts repository')).currentItemLocalData;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(IssuesSetup, "issuesRepository", {
        get: function () {
            return issuesRepository;
        },
        set: function (data) {
            issuesRepository = data;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(IssuesSetup, "reactionsRepository", {
        get: function () {
            return reactionsRepository;
        },
        set: function (data) {
            reactionsRepository = data;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(IssuesSetup, "statusNames", {
        get: function () {
            return statusNames;
        },
        enumerable: false,
        configurable: true
    });
    return IssuesSetup;
}());
