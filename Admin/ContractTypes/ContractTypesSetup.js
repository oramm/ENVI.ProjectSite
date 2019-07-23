var contractTypesRepository;
var milestoneTemplatesRepository;
var milestoneTypesRepository;
var milestoneTypeContractTypeAssociationsRepository;

class ContractTypesSetup {
    static get contractTypesRepository() {
        return contractTypesRepository;
    }
    
    static set contractTypesRepository(data) {
        contractTypesRepository = data;
    }
    
    static get milestoneTypesRepository() {
        return milestoneTypesRepository;
    }
    
    static set milestoneTypesRepository(data) {
        milestoneTypesRepository = data;
    }
    
    static get milestoneTemplatesRepository() {
        return milestoneTemplatesRepository;
    }
    
    static set milestoneTemplatesRepository(data) {
        milestoneTemplatesRepository = data;
    }
    
    static get milestoneTypeContractTypeAssociationsRepository() {
        return milestoneTypeContractTypeAssociationsRepository;
    }
    
    static set milestoneTypeContractTypeAssociationsRepository(data) {
        milestoneTypeContractTypeAssociationsRepository = data;
    }
}