class ContractsCollapsible extends Collapsible {
    constructor(id){
        super();
        this.id = id;
        this.milestonesPanels=[];
        this.makeMilestonesPanels();
        return this.initialise(id, 
                               this.makeCollapsibleItemsList(), 
                               this, 
                               this.removeHandler,
                               this.selectHandler);
        
    }

    makeMilestonesPanels(){
        for(var i=0; i<contractsRepository.items.length; i++){
            var $addMilestoneButton = FormTools.createFlatButton('Dodaj kamień milowy', 
                                                                 function() {   window.open('https://docs.google.com/forms/d/e/1FAIpQLSfUE5482J4-2odh4NkXEC8RawuHFXBHVg1uXpHXKMkOst5NEQ/viewform?usp=pp_url&entry.1995376000='+ $(this).parent().attr('contractid'));}
                                                                            )

            
            var $panel = $('<div>')
                                .attr('id', 'milestonesActionsMenuForContract'+contractsRepository.items[i].id)
                                .attr('contractid',contractsRepository.items[i].id)
                                .append($addMilestoneButton)
                                .append(new MilestonesCollection('milestonesListCollection' + i, contractsRepository.items[i].id).$dom)
            
            
            this.milestonesPanels[i] = $panel;
        }
    }
    
 
    makeCollapsibleItemsList(){
        var itemsList = [];
        var item;
        for (var i=0; i<contractsRepository.items.length; i++){
            var value = new Intl.NumberFormat('pl-PL', { style: 'currency', currency: 'PLN' }).format(contractsRepository.items[i].value);
            item = {    name: contractsRepository.items[i].number + '; ' + contractsRepository.items[i].name + '; ' + value,
                        $body:   this.milestonesPanels[i],
                        editUrl: contractsRepository.items[i].editUrl
                    };
            itemsList.push(item);
            }
        return itemsList;
    }
    
    actionsMenuInitialise(){
        //var projectId = getUrlVars()["projectId"];
        var newContractButton = FormTools.createFlatButton('Dodaj kontrakt', ()=> window.open('https://docs.google.com/forms/d/e/1FAIpQLScWFEQ1FevfUD2_KeQ5ew-hyb5ZwaMv5hHai9kTy_WUk2cM2A/viewform?usp=pp_url&entry.1995376000='+ contractsRepository.projectId +'&entry.798100984&entry.2087120541&entry.325833130"'));
        $('#actionsMenu').append(newContractButton);

    }

    
    removeHandler(itemId){
        contractsRepository.deleteContract(itemId, this.contractsListCollection.removeHandler, this.contractsListCollection)
            .catch(err => {
                      console.error(err);
                    });
    }
    
    selectHandler(itemId){
        contractsRepository.itemSelected(itemId);
   
        
    }
    
}