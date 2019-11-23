class OurLetterGdFile {
    public _templateGdId: string;
    public gdFile: GoogleAppsScript.Drive.File;
    private _letter: OurLetter;


    constructor(initObjectParamenter: { _templateGdId: string; _letter?: OurLetter }) {
        this._templateGdId = initObjectParamenter._templateGdId;
        this._letter = Tools.cloneOfObject(initObjectParamenter._letter);

    }
    /*
     * Tworzy zakresy nazwane w szablonie - używać jednorazowo
     */
    public createNamedRanges() {
        GDocsTools.createNamedRangesByTags(this._templateGdId, GDocsTools.getNameRangesTagsFromTemplate(this._templateGdId));
    }

    public createOnGd(): GoogleAppsScript.Drive.File {
        //var this.gdFile = Gd.createDuplicateFile(this._protocolTemplateId, this._contract.meetingProtocolsGdFolderId, 'Notatka ze spotkania - ' + this.date);
        this.gdFile = Gd.createDuplicateFile(this._templateGdId, this._letter.folderGdId, this._letter.number + ' ' + this._letter.creationDate);
        this.gdFile.setShareableByEditors(true);
        this._letter.letterGdId = this.gdFile.getId();
        this._letter._documentEditUrl = this.gdFile.getUrl();
        this.fillNamedRanges();
        return this.gdFile;
    }

    fillNamedRanges() {
        var document = DocumentApp.openById(this.gdFile.getId());

        for (var attribute in this._letter) {
            if (GDocsTools.getNamedRangeByName(document, attribute) && typeof this[attribute] === 'string') {
                GDocsTools.fillNamedRange(this.gdFile.getId(), attribute, this._letter[attribute]);
            }
        }
    }

    /*
     * tworzy etykietę z danymi address
     */
    private makeEntitiesDataLabel(entities: any[]) {
        var label = '';
        for (var i = 0; i < entities.length; i++) {
            label += entities[i].name
            if (entities[i].address)
                label += '\n' + entities[i].address;
            if (i < entities.length - 1)
                label += '\n'
        }
        return label;
    }

}

function test_createNamedRanges() {
    GDocsTools.getNameRangesTagsFromTemplate('1hkBgKLNW56XzNnj7EwHfxd6givKjiawAPHs5wdsaAo4');
    var letter = new OurLetterGdFile({ _templateGdId: '1hkBgKLNW56XzNnj7EwHfxd6givKjiawAPHs5wdsaAo4' })
    letter.createNamedRanges();
}