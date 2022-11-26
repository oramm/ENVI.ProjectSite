"use strict";
var milestoneTypesRepository;
var milestonesRepository;
var milestoneTypeContractTypeAssociationsRepository;
var MilestonesSetup = /** @class */ (function () {
    function MilestonesSetup() {
    }
    Object.defineProperty(MilestonesSetup, "statusNames", {
        get: function () {
            return ['Nie rozpoczęty',
                'W trakcie',
                'Zrobione',
                'Opóźnione!',
                'Termin aneksowany'
            ];
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(MilestonesSetup, "milestoneTypesRepository", {
        get: function () {
            return milestoneTypesRepository;
        },
        set: function (data) {
            milestoneTypesRepository = data;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(MilestonesSetup, "milestonesRepository", {
        get: function () {
            return milestonesRepository;
        },
        set: function (data) {
            milestonesRepository = data;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(MilestonesSetup, "milestoneTypeContractTypeAssociationsRepository", {
        get: function () {
            return milestoneTypeContractTypeAssociationsRepository;
        },
        set: function (data) {
            milestoneTypeContractTypeAssociationsRepository = data;
        },
        enumerable: false,
        configurable: true
    });
    return MilestonesSetup;
}());
