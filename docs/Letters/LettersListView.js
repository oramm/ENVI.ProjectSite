"use strict";
class LettersListView extends Popup {
    constructor() {
        super();
    }
    initialise() {
        this.setTittle("Pisma");
        $("#title").after(new LettersCollapsible('lettersCollapsible').$dom);
        this.dataLoaded(true);
    }
}
