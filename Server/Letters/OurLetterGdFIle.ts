class OurLetterGdFile extends DocumentTemplateGdFile {
    constructor(initObjectParamenter: { _templateGdId: string; dataObject?: any }) {
        super(initObjectParamenter)
    }
    /*
     * Tworzy zakresy nazwane w szablonie - używać przy dodawaniu naszych pism
     */
    public createNamedRanges() {
        GDocsTools.createNamedRangesByTags(this.dataObject.documentGdId, GDocsTools.getNameRangesTagsFromTemplate(this._templateGdId));
    }
    /*
     * tworzy plik z szablonu w folderze pisma na GD
     */
    public create(): GoogleAppsScript.Drive.File {
        super.create();
        GDocsTools.fillNamedRange(this.dataObject.documentGdId, 'address', this.makeEntitiesDataLabel(this.dataObject._entitiesMain));
        return this.gdFile;
    }

    edit(blobEnviObjects: _blobEnviObject[]) {
        super.edit(blobEnviObjects);
        GDocsTools.fillNamedRange(this.dataObject.documentGdId, 'address', this.makeEntitiesDataLabel(this.dataObject._entitiesMain));
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
