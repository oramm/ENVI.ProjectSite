class LettersListView extends Popup {
    constructor(){
        super();
        this.$contractsPanel;
        this.$casesPanel;
        this.$lettersPanel;
    }
    
    initialise(){
        this.setTittle("Pisma");
        $("#tittle").after(new LettersCollapsible('lettersCollapsible').$dom);
        this.dataLoaded(true); 
    }
}