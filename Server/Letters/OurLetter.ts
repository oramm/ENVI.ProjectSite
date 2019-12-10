class OurLetter extends Letter {
    _templateGdId: string;

    constructor(initParamObject: any) {
        super(initParamObject);
        this.isOur = true;
        this.number = initParamObject.number;
        //_temlate jest potrzebny tylko przy tworzeniu pisma
        if (initParamObject._template) this._templateGdId = initParamObject._template.gdId;

    }

    public makeFolderName(): string {
        var folderName: string = super.makeFolderName();
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
        var letterFolder = this.createLetterFolder(blobEnviObjects);
        return letterFolder;
    }
    /*
     * Tworzy folder i plik pisma ENVI z wybranego szablonu
     * blobEnviObjects - załączniki
     */
    protected createLetterFolder(blobEnviObjects: any[]): GoogleAppsScript.Drive.Folder {
        var letterFolder = super.createLetterFolder(blobEnviObjects);
        var ourLetterGdFile = new OurLetterGdFile({ _templateGdId: this._templateGdId, _letter: this });
        ourLetterGdFile.create();

        return letterFolder;
    }

    public addInDb(externalConn, isPartOfTransaction?) {
        super.addInDb(externalConn, isPartOfTransaction);
        this.number = this.id;
    }

    /*
     * _blobEnviObjects to załączniki do pisma
     */
    public editLetterGdElements(blobEnviObjects: _blobEnviObject[]): GoogleAppsScript.Drive.Folder {
        this.letterFilesCount = blobEnviObjects.length + 1;
        var ourLetterGdFile = new OurLetterGdFile({ _templateGdId: undefined, _letter: this })
        ourLetterGdFile.edit(blobEnviObjects);

        return DriveApp.getFolderById(this.folderGdId);
    }
}