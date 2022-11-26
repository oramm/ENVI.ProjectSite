"use strict";
var RolesSetup = /** @class */ (function () {
    function RolesSetup() {
    }
    Object.defineProperty(RolesSetup, "rolesRepository", {
        get: function () {
            return RolesSetup._rolesRepository;
        },
        set: function (value) {
            RolesSetup._rolesRepository = value;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(RolesSetup, "roleGroupsRepository", {
        get: function () {
            return RolesSetup._roleGroupsRepository;
        },
        set: function (value) {
            RolesSetup._roleGroupsRepository = value;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(RolesSetup, "groups", {
        get: function () {
            return RolesSetup._groups;
        },
        enumerable: false,
        configurable: true
    });
    return RolesSetup;
}());
RolesSetup._rolesRepository;
RolesSetup._roleGroupsRepository;
RolesSetup._groups = [
    {
        id: 'Zamawiający',
        name: 'Zamawiający'
    },
    {
        id: 'Inżynier',
        name: 'Inżynier'
    },
    {
        id: 'Wykonawca/Podwykonawcy',
        name: 'Wykonawca/Podwykonawcy'
    },
    {
        id: 'Pozostali',
        name: 'Pozostali'
    }
];
