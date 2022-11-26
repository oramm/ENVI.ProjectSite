"use strict";
class TaskTemplatesListView extends Popup {
    constructor() {
        super();
    }
    initialise() {
        this.setTittle("Lista szablonów zadań");
        this.actionsMenuInitialise();
        $('#actionsMenu').after(new TaskTemplatesCollection('taskTemplatesCollection').$dom);
        this.dataLoaded(true);
    }
    actionsMenuInitialise() {
    }
}
