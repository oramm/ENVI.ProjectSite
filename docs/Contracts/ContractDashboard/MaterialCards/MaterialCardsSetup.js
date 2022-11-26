"use strict";
var materialCardsRepository;
var reactionsRepository;
var contractsRepository;
var milestonesRepository;
var casesRepository;
var statusNames = ['Robocze', 'Do poprawy', 'Do akceptacji', 'Zatwierdzone'];
var MaterialCardsSetup = /** @class */ (function () {
    function MaterialCardsSetup() {
    }
    Object.defineProperty(MaterialCardsSetup, "materialCardsRepository", {
        get: function () {
            return materialCardsRepository;
        },
        set: function (data) {
            materialCardsRepository = data;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(MaterialCardsSetup, "reactionsRepository", {
        get: function () {
            return reactionsRepository;
        },
        set: function (data) {
            reactionsRepository = data;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(MaterialCardsSetup, "statusNames", {
        get: function () {
            return statusNames;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(MaterialCardsSetup, "contractsRepository", {
        get: function () {
            return contractsRepository;
        },
        set: function (data) {
            contractsRepository = data;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(MaterialCardsSetup, "milestonesRepository", {
        get: function () {
            return milestonesRepository;
        },
        set: function (data) {
            milestonesRepository = data;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(MaterialCardsSetup, "casesRepository", {
        get: function () {
            return casesRepository;
        },
        set: function (data) {
            casesRepository = data;
        },
        enumerable: false,
        configurable: true
    });
    return MaterialCardsSetup;
}());
