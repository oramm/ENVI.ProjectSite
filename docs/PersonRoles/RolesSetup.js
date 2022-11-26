"use strict";
class RolesSetup {
    static get rolesRepository() {
        return RolesSetup._rolesRepository;
    }
    static set rolesRepository(value) {
        RolesSetup._rolesRepository = value;
    }
    static get roleGroupsRepository() {
        return RolesSetup._roleGroupsRepository;
    }
    static set roleGroupsRepository(value) {
        RolesSetup._roleGroupsRepository = value;
    }
    static get groups() {
        return RolesSetup._groups;
    }
}
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
