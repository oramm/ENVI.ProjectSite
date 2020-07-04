class MeetingsListView extends Popup {
    constructor() {
        super();
        this.$meetingsPanel;
    }

    initialise() {
        //this.setTittle("Spotkania");
        this.buidDom();
        this.dataLoaded(true);
    }

    buidDom() {
        $("#content").find('.row')
            .append(new MeetingsCollapsible('meetingsCollapsible').$dom);
    }
}