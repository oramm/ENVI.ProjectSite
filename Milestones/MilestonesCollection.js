class MilestonesCollection extends Collection {
    constructor(id, contractId){
        super();
        this.id = id;
        this.contractId = contractId;
        
        this.initialise(id, 
                    this.makeList()
                    );
        
    }
    
    actionsMenuInitialise(){       
        var newMilestoneButton = FormTools.createFlatButton('Dodaj kamień milowy', ()=> window.open('https://docs.google.com/forms/d/e/1FAIpQLSfUE5482J4-2odh4NkXEC8RawuHFXBHVg1uXpHXKMkOst5NEQ/viewform?usp=pp_url&entry.1995376000=' + milestonesRepository.selectedContractId +'&entry.798100984&entry.2087120541&entry.895949845&entry.556284748','_blank'));
        $('#actionsMenu').append(newMilestoneButton);

    }
    /*
     * Dodano atrybut z ContractId, żeby szybciej filtorwac widok po stronie klienra zamiast przez SELECT z db
    */
    makeList(){
        var itemsList = [];
        var item;
        for (var i=0; i<milestonesRepository.items.length; i++){
            item = {    id: milestonesRepository.items[i].id,
                        icon:   'info',
                        title:  milestonesRepository.items[i].name,
                        description:    milestonesRepository.items[i].description + '<BR>' +
                                        
                                        milestonesRepository.items[i].startDate + ' - ' + milestonesRepository.items[i].endDate + '<BR>' +
                                        milestonesRepository.items[i].status,
                        editUrl: milestonesRepository.items[i].editUrl,
                        contractId_Hidden:  milestonesRepository.items[i].contractId
                    };
            itemsList.push(item);
            }
        return itemsList.filter((item)=>item.contractId_Hidden==this.contractId);
    }
    /*
     * Krok 1 - po kliknięciu w przycisk 'usuń' 
     * Proces: this.removeTrigger >> milestonesRepository.deleteMilestone 
     *                                      >> repository.deleteItem >> collection.removeHandler[PENDING]
     *                                      >> repository.deleteItem >> collection.removeHandler[DONE]

     */
    removeTrigger(itemId){
        var milestone = search(itemId,"id",milestonesRepository.items);
        milestonesRepository.deleteMilestone(milestone, this.removeHandler, this)
            .catch(err => {
                      console.error(err);
                    });
    }
  
    selectTrigger(itemId){
        milestonesRepository.itemSelected(itemId);
        $('#iframeCases').attr('src','../Cases/CasesList.html?milestoneId=' + milestonesRepository.selectedItemId + '&contractId=' + milestonesRepository.selectedItem.contractId);
    }
    
}