class OurLetter extends Letter {
    private _letterGdFile: OurLetterGdFile;
    _templateGdId: string;

    constructor(initParamObject: any) {
        super(initParamObject);
        this.isOur = true;
        this.number = this.id;
        this._templateGdId = initParamObject._template.gdId;
        this._letterGdFile;
    }

    public makeFolderName(): string {
        var folderName: string = this.makeFolderName();
        return folderName += ': Wychodzące'
    }

    public appendAttachments(blobEnviObjects: any[]): GoogleAppsScript.Drive.Folder {
        super.appendAttachments(blobEnviObjects);

        let letterFolder: GoogleAppsScript.Drive.Folder = DriveApp.getFolderById(this.folderGdId);

        for (let i = 0; i < blobEnviObjects.length; i++) {
            let blob = Tools._blobEnviObjectToBlob(blobEnviObjects[i]);
            letterFolder.createFile(blob);
        }
        return letterFolder;
    }

    /*
     * Odpalana w contollerze
     */
    public createLetterGdElements(blobEnviObjects: any[]): GoogleAppsScript.Drive.Folder {
        super.createLetterGdElements(blobEnviObjects);
        this._letterGdFile = new OurLetterGdFile({_templateGdId: this._templateGdId, _letter: this})
        return this.createLetterFolder(blobEnviObjects);
    }
    /*
     * Tworzy folder i plik pisma ENVI z wybranego szablonu
     * blobEnviObjects - załączniki
     */
    protected createLetterFolder(blobEnviObjects: any[]): GoogleAppsScript.Drive.Folder {
        var letterFolder = super.createLetterFolder(blobEnviObjects);
        this._letterGdFile.createOnGd();
        //var ourLetterFile = Gd.createDuplicateFile(this._template.gdId, letterFolder.getId(), this.number + ' ' + this.creationDate);
        
        return letterFolder;
    }

    public addInDb(externalConn, isPartOfTransaction?) {
        super.addInDb(externalConn, isPartOfTransaction);
        this.number = this.id;
    }


    /*
     * _blobEnviObjects to załączniki do pisma
     */
    public editLetterGdElements(blobEnviObjects: any[]): GoogleAppsScript.Drive.Folder {
        this._fileOrFolderChanged = this.deleteFromGd();
        this.letterFilesCount = blobEnviObjects.length;
        this.refreshLetterFile(blobEnviObjects);

        return DriveApp.getFolderById(this.folderGdId);
    }

    public refreshLetterFile(blobEnviObjects: any[]) {

    }
}