function OurLetter(initParamObject) {
    Letter.call(this, initParamObject); // http://javascriptissexy.com/oop-in-javascript-what-you-need-to-know/
    this._super = Letter.prototype;
    this.isOur = true;
    this.number = this.id;

}
Tools.inheritPrototype(OurLetter, Letter);

OurLetter.prototype = {
    constructor: OurLetter,
    addInDb: function () {
        this._super.addInDb.call(this);
        this.number = this.id;
    },
/*
   * Tworzy folder i plik pisma ENVI z wybranego szablonu
   * blobEnviObjects - załączniki
   */
  createOurLetter: function (blobEnviObjects) {
        var letterFolder = this.createLetterFolder(blobEnviObjects);
        var ourLetterFile = Gd.createDuplicateFile(this._template.gdId, letterFolder.getId(), this.number + ' ' + this.creationDate);
        ourLetterFile.setShareableByEditors(true);
        this.letterGdId = ourLetterFile.getId();
        this._documentEditUrl = ourLetterFile.getUrl();
        return letterFolder;
    },
}