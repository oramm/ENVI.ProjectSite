class MilestoneTypeContractTypeAssociationModal extends Modal {
    constructor(id, tittle, connectedResultsetComponent, mode){
        super(id, tittle, connectedResultsetComponent, mode);
        //this.milestoneTypeSelectField = new SelectFieldBrowserDefault(this.id + 'contractTypeSelectField', 'Typ kamienia milowego', true);
        //this.milestoneTypeSelectField.initialise(ContractTypesSetup.milestonesTypesRepository);
        
        this.milestoneTypeSelectField = new SelectField(this.id + '_milestoneTypeSelectField', 'Typ kamienia milowego', true);
        var _this=this;
        this.formElements = [
            {   input: new InputTextField(this.id + 'folderNumberTextField','Numer folderu GD', undefined, true, 2),
                dataItemKeyName: 'folderNumber'
            },
            {   input: this.milestoneTypeSelectField,
                dataItemKeyName: '_milestoneType',
                refreshDataSet: function (){
                    _this.setTittle(_this.tittle + ' ' + ContractTypesSetup.contractTypesRepository.currentItem.name)
                    var currentMilestoneTypes = ContractTypesSetup.milestoneTypesRepository.items.filter(
                        item=>this.excludeAssociatedType(item)
                    );
                    this.input.initialise(currentMilestoneTypes, 'name');
                    //console.log('ContractsSetup.contractsRepository.currentItem.ourType:: ' + ContractsSetup.contractsRepository.currentItem._ourType);
                },
                //wyklucz typy już przypisane wcześniej
                excludeAssociatedType(milestoneTypeItem){
                    var test = true;
                    ContractTypesSetup.milestoneTypeContractTypeAssociationsRepository.items.map(associatedTypeItem=>{
                            if (associatedTypeItem._milestoneType.id == milestoneTypeItem.id &&
                                associatedTypeItem._contractType.id == ContractTypesSetup.contractTypesRepository.currentItem.id){
                                //jeśli edytujesz dopuść typ istniejący taki jak ten edytowany
                                if( _this.mode=='EDIT' && 
                                    ContractTypesSetup.milestoneTypeContractTypeAssociationsRepository.currentItem._milestoneType.id != associatedTypeItem._milestoneType.id ||
                                    _this.mode!='EDIT')
                                    
                                test = false;   
                            }
                        });
                    return test;
                }
            },
            
        ];
        
        this.initialise();
    }

    /*
     * Używana przy włączaniu Modala do edycji
     * @returns {undefined}
     */
    initAddNewData(){
        this.connectedResultsetComponent.connectedRepository.currentItem = { _contractType: ContractTypesSetup.contractTypesRepository.currentItem
                                                                           };
    }    
};