"use strict";
class ContractTypesListView extends Popup {
    constructor() {
        super();
    }
    initialise() {
        this.setTittle("Typy kontraktów");
        $("#title").after(new ContractTypesCollapsible('contractTypesCollapsible').$dom);
        this.dataLoaded(true);
    }
}
