"use strict";
var risksRepository;
var reactionsRepository;
var contractsRepository;
var milestonesRepository;
var casesRepository;
var probabilityRates = [1, 2, 3, 4];
var overallImpactRates = probabilityRates;
var RisksSetup = /** @class */ (function () {
    function RisksSetup() {
    }
    Object.defineProperty(RisksSetup, "risksRepository", {
        get: function () {
            return risksRepository;
        },
        set: function (data) {
            risksRepository = data;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(RisksSetup, "reactionsRepository", {
        get: function () {
            return reactionsRepository;
        },
        set: function (data) {
            reactionsRepository = data;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(RisksSetup, "contractsRepository", {
        get: function () {
            return contractsRepository;
        },
        set: function (data) {
            contractsRepository = data;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(RisksSetup, "milestonesRepository", {
        get: function () {
            return milestonesRepository;
        },
        set: function (data) {
            milestonesRepository = data;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(RisksSetup, "probabilityRates", {
        get: function () {
            return probabilityRates;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(RisksSetup, "overallImpactRates", {
        get: function () {
            return overallImpactRates;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(RisksSetup, "casesRepository", {
        get: function () {
            return casesRepository;
        },
        set: function (data) {
            casesRepository = data;
        },
        enumerable: false,
        configurable: true
    });
    return RisksSetup;
}());
