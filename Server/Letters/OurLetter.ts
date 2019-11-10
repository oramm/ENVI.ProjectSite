function OurLetter11(initParamObject) {
    Letter.call(this, initParamObject); // http://javascriptissexy.com/oop-in-javascript-what-you-need-to-know/
    this._super = Letter.prototype;
    this.isOur = true;
    this.number = this.id;

}
Tools.inheritPrototype(OurLetter, Letter);

OurLetter11.prototype = {
    constructor: OurLetter11,
    makeFolderName: function () {
        var folderName: string = this._super.makeFolderName.call(this);
        return folderName += ': Wychodzące'
    },

    addInDb: function () {
        this._super.addInDb.call(this);
        this.number = this.id;
    },
    /*
     * Odpalana w contollerze
     */
    createLetterGdElements: function (blobEnviObjects) {
        this.createLetterFolder(blobEnviObjects);
    },
    /*
    * Tworzy folder i plik pisma ENVI z wybranego szablonu
    * blobEnviObjects - załączniki
    */
    createLetterFolder: function (blobEnviObjects) {
        var letterFolder = this._super.createLetterFolder.call(this, blobEnviObjects);
        var ourLetterFile = Gd.createDuplicateFile(this._template.gdId, letterFolder.getId(), this.number + ' ' + this.creationDate);
        ourLetterFile.setShareableByEditors(true);
        this.letterGdId = ourLetterFile.getId();
        this._documentEditUrl = ourLetterFile.getUrl();
        return letterFolder;
    },
}