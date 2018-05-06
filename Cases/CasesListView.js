class CasesListView extends Popup {
    constructor(){
        super();       
    }
    
    initialise(){
        this.setTittle("Lista spraw");
        this.actionsMenuInitialise();
        
        $('#actionsMenu').after(new CasesCollapsible('contratsCollapsible'));  
        this.dataLoaded(true);
    }


    actionsMenuInitialise(){
        var newCaseButton = FormTools.createFlatButton('Dodaj sprawę', ()=> window.open('https://docs.google.com/forms/d/e/1FAIpQLSf6sZpZeZMwwqvAZ1oAQSWIwOPpG_ZXV8E3XigQcTes4VAi3g/viewform?usp=pp_url&entry.804066860='+ casesRepository.milestoneId));
        $('#actionsMenu').append(newCaseButton);

    }
}