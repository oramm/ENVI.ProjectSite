class DocumentGdFile {
    public _template: DocumentTemplate;
    public gdFile: GoogleAppsScript.Drive.File;
    protected document: Envi.Document;


    constructor(initObjectParamenter: { _template: DocumentTemplate; document: Envi.Document }) {
        this._template = initObjectParamenter._template;
        this.document = initObjectParamenter.document;
    }
    /*
     * Tworzy zakresy nazwane w dokumencie - używać przy generowaniu doumentu na podstawie szablonu
     */
    public createNamedRanges() {
        GDocsTools.createNamedRangesByTags(this.document.documentGdId, GDocsTools.getNameRangesTagsFromTemplate(this._template.gdId));
    }
    /*
     * tworzy plik z szablonu w folderze docelowym na GD
     */
    public create(): GoogleAppsScript.Drive.File {
        this.gdFile = Gd.createDuplicateFile(this._template.gdId, this.document.folderGdId, this.document.number + ' ' + this.document.creationDate);
        this.gdFile.setShareableByEditors(true);
        this.document.documentGdId = this.gdFile.getId();
        this.document._documentEditUrl = this.gdFile.getUrl();
        this.createNamedRanges();

        this.fillNamedRanges();
        return this.gdFile;
    }

    edit() {
        this.fillNamedRanges();
    }

    fillNamedRanges() {
        var document = DocumentApp.openById(this.document.documentGdId);
        var attribute: string;
        for (attribute in this.document) {
            if (GDocsTools.getNamedRangeByName(document, attribute) && typeof this.document[attribute] === 'string') {
                GDocsTools.fillNamedRange(this.document.documentGdId, attribute, this.document[attribute]);
            }
        }
    }

}
