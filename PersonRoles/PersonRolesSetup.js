class PersonsSetup {
    static get personsRepository() {
        return PersonsSetup._personsRepository;
    }
    static set personsRepository(value) {
        PersonsSetup._personsRepository = value;
    }

    static get personRoleAssociationsRepository() {
        return PersonsSetup._personRoleAssociationsRepository;
    }
    static set personRoleAssociationsRepository(value) {
        PersonsSetup._personRoleAssociationsRepository = value;
    }
}

PersonsSetup._personsRepository;
PersonsSetup.personRoleAssociationsRepository;
