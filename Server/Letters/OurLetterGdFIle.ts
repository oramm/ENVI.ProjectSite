class OurLetterGdFile {
    public _templateGdId: string;
    public gdFile: GoogleAppsScript.Drive.File;
    private _letter: OurLetter;


    constructor(initObjectParamenter: { _templateGdId: string; _letter?: any }) {
        this._templateGdId = initObjectParamenter._templateGdId;
        this._letter = initObjectParamenter._letter;

    }
    /*
     * Tworzy zakresy nazwane w szablonie - używać przy nowych szablonach
     */
    public createNamedRangesInTemplate() {
        GDocsTools.createNamedRangesByTags(this._templateGdId, GDocsTools.getNameRangesTagsFromTemplate(this._templateGdId));
    }
    /*
     * Tworzy zakresy nazwane w szablonie - używać przy dodawaniu naszych pism
     */
    public createNamedRangesInOurLetter() {
        GDocsTools.createNamedRangesByTags(this._letter.letterGdId, GDocsTools.getNameRangesTagsFromTemplate(this._templateGdId));
    }
    /*
     * tworzy plik z szablonu w folderze pisma na GD
     */
    public create(): GoogleAppsScript.Drive.File {
        this.gdFile = Gd.createDuplicateFile(this._templateGdId, this._letter.folderGdId, this._letter.number + ' ' + this._letter.creationDate);
        this.gdFile.setShareableByEditors(true);
        this._letter.letterGdId = this.gdFile.getId();
        this._letter._documentEditUrl = this.gdFile.getUrl();
        this.createNamedRangesInOurLetter();
        
        this.fillNamedRanges();
        GDocsTools.fillNamedRange(this._letter.letterGdId, 'address', this.makeEntitiesDataLabel(this._letter._entitiesMain));
        return this.gdFile;
    }

    edit(blobEnviObjects: _blobEnviObject[]) {
        this.fillNamedRanges();
        GDocsTools.fillNamedRange(this._letter.letterGdId, 'address', this.makeEntitiesDataLabel(this._letter._entitiesMain));
    }

    fillNamedRanges() {
        var document = DocumentApp.openById(this._letter.letterGdId);
        var attribute: string;
        for (attribute in this._letter) {
            if (GDocsTools.getNamedRangeByName(document, attribute) && typeof this._letter[attribute] === 'string') {
                GDocsTools.fillNamedRange(this._letter.letterGdId, attribute, this._letter[attribute]);
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
