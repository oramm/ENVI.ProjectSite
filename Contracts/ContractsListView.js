class ContractsListView extends Popup {
    constructor(){
        super();       
    }
    
    initialise(){
        this.setTittle("Lista kontratów");
        this.actionsMenuInitialise();
        
        $('#actionsMenu').after(new ContractsCollapsible('contratsCollapsible'));  
        this.dataLoaded(true);
    }


    actionsMenuInitialise(){
        var newContractButton = FormTools.createFlatButton('Dodaj kontrakt', ()=> window.open('https://docs.google.com/forms/d/e/1FAIpQLScWFEQ1FevfUD2_KeQ5ew-hyb5ZwaMv5hHai9kTy_WUk2cM2A/viewform?usp=pp_url&entry.1995376000='+ contractsRepository.projectId +'&entry.798100984&entry.2087120541&entry.325833130"'));
        $('#actionsMenu').append(newContractButton);

    }
}