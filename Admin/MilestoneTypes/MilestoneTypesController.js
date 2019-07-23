class MilestoneTypesController {
    main(){
        // Hide auth UI, then load client library.
        var milestoneTypesListView = new MilestoneTypesListView();
        $("#authorize-div").hide();
        milestoneTypesListView.dataLoaded(false);
        //signoutButton.style.display = 'block';
        
       
        ContractTypesSetup.contractTypesRepository = new SimpleRepository('ContractTypes repository',
                                                                            'getContractTypesList',
                                                                            'addNewContractType',
                                                                            'editContractType',
                                                                            'deleteContractType');
        
        ContractTypesSetup.milestoneTypesRepository = new SimpleRepository('MilestoneTypes repository',
                                                                            'getMilestoneTypesList',
                                                                            'addNewMilestoneType',
                                                                            'editMilestoneType',
                                                                            'deleteMilestoneType');
        
        
        ContractTypesSetup.milestoneTemplatesRepository = new SimpleRepository('MilestoneTemplates repository',
                                                                                'getMilestoneTemplatesList',
                                                                                'addNewMilestoneTemplate',
                                                                                'editMilestoneTemplate',
                                                                                'deleteMilestoneTemplate');
        ContractTypesSetup.milestoneTypeContractTypeAssociationsRepository = new SimpleRepository('MilestoneTypeContractTypeAssociations repository',
                                                                                                'getMilestoneTypeContractTypeAssociationsList',
                                                                                                'addNewMilestoneTypeContractTypeAssociation',
                                                                                                '',
                                                                                                'deleteMilestoneTypeContractTypeAssociation'
                                                                                               );
        var promises = [];
        promises[0] = ContractTypesSetup.contractTypesRepository.initialise('ACTIVE');
        promises[1] = ContractTypesSetup.milestoneTypesRepository.initialise();
        promises[2] = ContractTypesSetup.milestoneTemplatesRepository.initialise();
        promises[3] = ContractTypesSetup.milestoneTypeContractTypeAssociationsRepository.initialise();
        
        Promise.all(promises)
            .then(()=>  {   console.log("Repositories initialised");
                            milestoneTypesListView.initialise();
                        })
            .then(  ()=>{   $('select').material_select();
                            $('.modal').modal();
                            $('.datepicker').pickadate({
                                selectMonths: true, // Creates a dropdown to control month
                                selectYears: 15, // Creates a dropdown of 15 years to control year,
                                today: 'Dzisiaj',
                                clear: 'Wyszyść',
                                close: 'Ok',
                                closeOnSelect: false, // Close upon selecting a date,
                                container: undefined, // ex. 'body' will append picker to body
                                format: 'dd-mm-yyyy'
                            });
                            ReachTextArea.reachTextAreaInit();
                            Materialize.updateTextFields();
                            $('ul.tabs').tabs();
                            iFrameResize({log:false, heightCalculationMethod:'taggedElement', checkOrigin:false});
                        }
            )
            .catch(err => {
                  console.error(err);
                });
   
    }
}