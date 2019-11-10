function OurOldTypeLetter11(initParamObject) {
    Letter.call(this, initParamObject); // http://javascriptissexy.com/oop-in-javascript-what-you-need-to-know/
    this._super = Letter.prototype;
    this.isOur = true;
    this.number = initParamObject.number;

}
Tools.inheritPrototype(OurOldTypeLetter11, Letter);

OurOldTypeLetter11.prototype = {
    constructor: OurOldTypeLetter11,
    makeFolderName: function () {
        var folderName: string = this._super.makeFolderName.call(this);
        return folderName += ': Wychodzące'
    },
    /*
     * Odpalana w contollerze
     */
    createLetterGdElements: function (blobEnviObjects) {
        if (blobEnviObjects.length > 1)
            var letterFolder = this.createLetterFolder(blobEnviObjects);
        else
            var letterFile = this.createLetterFile(blobEnviObjects);
    },
}