"use strict";
var contractTypesRepository;
var milestoneTemplatesRepository;
var milestoneTypesRepository;
var milestoneTypeContractTypeAssociationsRepository;
var ContractTypesSetup = /** @class */ (function () {
    function ContractTypesSetup() {
    }
    Object.defineProperty(ContractTypesSetup, "contractTypesRepository", {
        get: function () {
            return contractTypesRepository;
        },
        set: function (data) {
            contractTypesRepository = data;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(ContractTypesSetup, "milestoneTypesRepository", {
        get: function () {
            return milestoneTypesRepository;
        },
        set: function (data) {
            milestoneTypesRepository = data;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(ContractTypesSetup, "milestoneTemplatesRepository", {
        get: function () {
            return milestoneTemplatesRepository;
        },
        set: function (data) {
            milestoneTemplatesRepository = data;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(ContractTypesSetup, "milestoneTypeContractTypeAssociationsRepository", {
        get: function () {
            return milestoneTypeContractTypeAssociationsRepository;
        },
        set: function (data) {
            milestoneTypeContractTypeAssociationsRepository = data;
        },
        enumerable: false,
        configurable: true
    });
    return ContractTypesSetup;
}());
