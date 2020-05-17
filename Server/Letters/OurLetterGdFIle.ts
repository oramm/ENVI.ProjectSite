class OurLetterGdFile extends DocumentGdFile {
    constructor(initObjectParamenter: { _template: DocumentTemplate, document: OurLetter }) {
        super(initObjectParamenter)
    }
    /*
     * Tworzy zakresy nazwane w szablonie - używać przy dodawaniu naszych pism
     */
    public createNamedRanges() {
        GDocsTools.createNamedRangesByTags(this.document.documentGdId, GDocsTools.getNameRangesTagsFromTemplate(this._template.gdId));
    }
    /*
     * tworzy plik z szablonu w folderze pisma na GD
     */
    public create(): GoogleAppsScript.Drive.File {
        super.create();
        GDocsTools.fillNamedRange(this.document.documentGdId, 'address', this.makeEntitiesDataLabel(this.document._entitiesMain));
        return this.gdFile;
    }

    edit() {
        super.edit();
        GDocsTools.fillNamedRange(this.document.documentGdId, 'address', this.makeEntitiesDataLabel(this.document._entitiesMain));
        var description = this.document._project.ourId + ': ' + this.makeCasesList() + '. ' + this.document.description
        GDocsTools.fillNamedRange(this.document.documentGdId, 'description', description);
    }

    private makeCasesList(): string {
        let casesLabel : string = '';
        for(const item of this.document._cases)
            casesLabel += item._typeFolderNumber_TypeName_Number_Name + ', '
        return casesLabel.substring(0, casesLabel.length-2)
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
