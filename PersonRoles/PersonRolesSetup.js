class PersonsSetup {


    static get personRoleAssociationsRepository() {
        return PersonsSetup._personRoleAssociationsRepository;
    }
    static set personRoleAssociationsRepository(value) {
        PersonsSetup._personRoleAssociationsRepository = value;
    }
}

PersonsSetup.personRoleAssociationsRepository;
