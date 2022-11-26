"use strict";
class MaterialCardsListView extends Popup {
    constructor() {
        super();
    }
    initialise() {
        this.setTittle("Wnioski materiałowe");
        this.actionsMenuInitialise();
        $('#actionsMenu').after(new MaterialCardsCollapsible('materialCardsCollapsible').$dom);
        this.dataLoaded(true);
    }
    actionsMenuInitialise() {
    }
}
