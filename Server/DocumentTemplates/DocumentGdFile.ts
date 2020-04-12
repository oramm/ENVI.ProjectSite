class DocumentTemplateGdFile {
    public _templateGdId: string;
    public gdFile?: GoogleAppsScript.Drive.File;
    protected dataObject: any;


    constructor(initObjectParamenter: { _templateGdId: string; dataObject?: any }) {
        this._templateGdId = initObjectParamenter._templateGdId;
        this.dataObject = initObjectParamenter.dataObject;
    }
    /*
     * Tworzy zakresy nazwane w dokumencie - używać przy generowaniu doumentu na podstawie szablonu
     */
    public createNamedRanges() {
        GDocsTools.createNamedRangesByTags(this.dataObject.documentGdId, GDocsTools.getNameRangesTagsFromTemplate(this._templateGdId));
    }
    /*
     * tworzy plik z szablonu w folderze docelowym na GD
     */
    public create(): GoogleAppsScript.Drive.File {
        this.gdFile = Gd.createDuplicateFile(this._templateGdId, this.dataObject.folderGdId, this.dataObject.number + ' ' + this.dataObject.creationDate);
        this.gdFile.setShareableByEditors(true);
        this.dataObject.documentGdId = this.gdFile.getId();
        this.dataObject._documentEditUrl = this.gdFile.getUrl();
        this.createNamedRanges();
        
        this.fillNamedRanges();
        return this.gdFile;
    }

    edit() {
        this.fillNamedRanges();
    }

    fillNamedRanges() {
        var document = DocumentApp.openById(this.dataObject.documentGdId);
        var attribute: string;
        for (attribute in this.dataObject) {
            if (GDocsTools.getNamedRangeByName(document, attribute) && typeof this.dataObject[attribute] === 'string') {
                GDocsTools.fillNamedRange(this.dataObject.documentGdId, attribute, this.dataObject[attribute]);
            }
        }
    }

}
