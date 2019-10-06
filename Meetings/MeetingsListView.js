class MeetingsListView extends Popup {
    constructor(){
        super();
        this.$contractsPanel;
        this.$casesPanel;
        this.$meetingsPanel;
    }
    
    initialise(){
        //this.setTittle("Spotkania");
        this.buidDom();
        this.dataLoaded(true);
        
    }

    buidDom(){
        this.$contractsPanel = $('<div class="col s12 m4 l3"></div>');
        this.$casesPanel = $('<div class="col s12 m4 l3"></div>');
        this.$meetingsPanel = $('<div class="col s12 m4 l6"></div>');
    
    $("#content").find('.row')
        .append(this.$contractsPanel)
        .append(this.$casesPanel)
        .append(this.$meetingsPanel);
    
    this.$contractsPanel
        .append(this.makeSubTittle('Wybierz kamień milowy'))
        .append(new ContractsCollapsible('contractsCollapsible', this.$casesPanel).$dom)
    
    this.$casesPanel
        .append(this.makeSubTittle('Wybierz sprawę'))
        .append('<div id="casesCollapsible_container"></div>')
    
    this.$meetingsPanel
        .append(this.makeSubTittle('Spotkania'))
        .append(new MeetingsCollapsible('meetingsCollapsible').$dom);
    }
    
}