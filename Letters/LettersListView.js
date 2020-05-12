class LettersListView extends Popup {
    constructor(){
        super();       
    }
    
    initialise(){
        this.setTittle("Pisma");
        $("#tittle").after(new LettersCollapsible('lettersCollapsible').$dom);
        this.dataLoaded(true); 
    }
}