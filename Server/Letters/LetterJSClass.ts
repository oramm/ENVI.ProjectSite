class Letter {
    public id?: any;
    public isOur: boolean;
    public number?: string | number;
    public description?: string;
    public creationDate?: string;
    public registrationDate?: string;
    public _documentOpenUrl?: string;
    public letterGdId?: string;
    _fileOrFolderOwnerEmail?: string;
    _gdFolderUrl?: string;
    folderGdId?: string;
    _lastUpdated?: any;
    _contract?: any;
    _project?: any;
    projectId?: any;
    _cases?: any;
    _entitiesMain?: any;
    _entitiesCc?: any;
    letterFilesCount?: number;
    _editor?: any;
    _fileOrFolderChanged?: boolean;
    _template?: any;
    editorId?: number;
    _canUserChangeFileOrFolder?: boolean;
    _folderName?: string;
    _documentEditUrl?: string;

    constructor(initParamObject: any) {
        if (initParamObject) {
            this.id = initParamObject.id;
            this.description = initParamObject.description;
            this.number = initParamObject.number;
            initParamObject.creationDate = dateDMYtoYMD(initParamObject.creationDate);
            this.creationDate = (initParamObject.creationDate) ? Utilities.formatDate(new Date(initParamObject.creationDate), "CET", "yyyy-MM-dd") : undefined;

            initParamObject.registrationDate = dateDMYtoYMD(initParamObject.registrationDate);
            this.registrationDate = (initParamObject.registrationDate) ? Utilities.formatDate(new Date(initParamObject.registrationDate), "CET", "yyyy-MM-dd") : undefined;

            if (initParamObject.letterGdId) {
                this._documentOpenUrl = Gd.createDocumentOpenUrl(initParamObject.letterGdId);
                this.letterGdId = initParamObject.letterGdId;
                this._fileOrFolderOwnerEmail = DriveApp.getFileById(this.letterGdId).getOwner().getEmail();
            }
            if (initParamObject.folderGdId) {
                this._gdFolderUrl = Gd.createGdFolderUrl(initParamObject.folderGdId);
                this.folderGdId = initParamObject.folderGdId;
                this._fileOrFolderOwnerEmail = DriveApp.getFolderById(this.folderGdId).getOwner().getEmail();
            }
            this._lastUpdated = initParamObject._lastUpdated;
            this._contract = initParamObject._contract;
            this._project = initParamObject._project;
            this.projectId = initParamObject._project.id;
            this._cases = initParamObject._cases;
            this._entitiesMain = (initParamObject._entitiesMain) ? initParamObject._entitiesMain : [];
            this._entitiesCc = (initParamObject._entitiesCc) ? initParamObject._entitiesCc : [];
            this.letterFilesCount = initParamObject.letterFilesCount;

            this._editor = initParamObject._editor;
            this._canUserChangeFileOrFolder = this.canUserChangeFileOrFolder();
            this._fileOrFolderChanged;
            this._template = initParamObject._template;
        }
    }


    setEditorId(): number {
        if (this._editor.id)
            return this._editor.id;
        else
            return Person.getPersonDbId(Session.getActiveUser().getEmail(), undefined);
    }

    /*
     * Używana przy selekcie
     */
    canUserChangeFileOrFolder(): boolean {
        if (this.folderGdId)
            return Gd.canUserDeleteFolder(this.folderGdId);
        else if (this.letterGdId)
            return Gd.canUserDeleteFile(this.letterGdId);
    }

    createLetterGdElements(blobEnviObjects: any[]): void {
        this.letterFilesCount = blobEnviObjects.length;
    }

    appendAttachments(blobEnviObjects: any[]): void {
        this.letterFilesCount += blobEnviObjects.length;
    }

    /*
     * Używać tylko gdy mamy pojedynczego bloba - pismo przychodzące
     */
    createLetterFile(blobEnviObjects: any[]): GoogleAppsScript.Drive.File {
        var rootFolder = DriveApp.getFolderById(this._project.lettersGdFolderId);
        var blob = Tools._blobEnviObjectToBlob(blobEnviObjects[0]);
        var letterFile = rootFolder.createFile(blob);
        letterFile.setShareableByEditors(true);
        this.addFileToCasesFolders(letterFile);
        this.letterGdId = letterFile.getId();
        this._documentOpenUrl = Gd.createDocumentOpenUrl(this.letterGdId);
        this.folderGdId = undefined;
        this._gdFolderUrl = undefined;
        this._canUserChangeFileOrFolder = this.canUserChangeFileOrFolder();
        return letterFile;
    }

    /*
     * Używać tylko gdy mamy pojedynczego bloba
     * dodaje plik pisma do folderów spraw powiązanych z pismem
     * file  -plik zrobiony z bloba
     */
    addFileToCasesFolders(file: GoogleAppsScript.Drive.File): void {
        for (var i = 0; i < this._cases.length; i++) {
            var caseFolder = DriveApp.getFolderById(this._cases[i].gdFolderId);
            caseFolder.addFile(file); //uwaga to nie jest kopia pliku. skasowanie go powoduje usunięcie z każdego folderu
        }
    }

    /*
     * Używać tylko gdy mamy wiele blobów
     */
    createLetterFolder(blobEnviObjects: Array<any>): GoogleAppsScript.Drive.Folder {
        if (!this.isOur && this.letterFilesCount < 2) throw new Error('Cannot create a folder for Letter with single file!');
        var rootFolder = DriveApp.getFolderById(this._project.lettersGdFolderId);
        var letterFolder = rootFolder.createFolder(this._folderName);
        letterFolder.setShareableByEditors(true);
        this.folderGdId = letterFolder.getId();
        this._gdFolderUrl = letterFolder.getUrl();
        this._fileOrFolderOwnerEmail = letterFolder.getOwner().getEmail();

        //letterFolder.setOwner(MY_GOOGLE_ACCOUNT_EMAIL);
        letterFolder.setShareableByEditors(true);
        for (var i = 0; i < blobEnviObjects.length; i++) {
            var blob = Tools._blobEnviObjectToBlob(blobEnviObjects[i]);
            var letterFile = letterFolder.createFile(blob);
        }
        this.addFolderToCasesFolders(letterFolder);

        this._documentOpenUrl = undefined;
        this.letterGdId = undefined;
        this._canUserChangeFileOrFolder = this.canUserChangeFileOrFolder();
        return letterFolder;
    }

    /*
     * Używać tylko gdy mamy wiele blobów
     * dodaje folder z plikami pisma do folderów spraw powiązanych z pismem
     * folder folder plików pisma
     */
    addFolderToCasesFolders(letterFolder: GoogleAppsScript.Drive.Folder) {
        for (var i = 0; i < this._cases.length; i++) {
            var caseFolder = DriveApp.getFolderById(this._cases[i].gdFolderId);
            caseFolder.addFolder(letterFolder); //uwaga to nie jest kopia folderu. skasowanie go powoduje usunięcie z każdego folderu
        }
    }
    /*
     * Używać tylko gdy mamy wiele blobów
     */
    makeFolderName(): string {
        return this.number + ' ' + this.creationDate;
    }

    addInDb(externalConn, isPartOfTransaction?: boolean) {
        addInDb('Letters', this, externalConn, isPartOfTransaction);
        this.addCaseAssociationsInDb(externalConn);
        this.addEntitiesAssociationsInDb(externalConn);
    }

    addCaseAssociationsInDb(externalConn) {
        var conn = (externalConn) ? externalConn : connectToSql();
        try {
            for (var i = 0; i < this._cases.length; i++) {
                var caseAssociation = new LetterCase({
                    _letter: {
                        id: this.id,
                    },
                    _case: {
                        id: this._cases[i].id
                    }
                });
                caseAssociation.addInDb(externalConn);
            }
        } catch (e) {
            Logger.log(e);
            throw e;
        } finally {
            if (!externalConn && conn.isValid(0)) conn.close();
        }
    }

    addEntitiesAssociationsInDb(externalConn) {
        var conn = (externalConn) ? externalConn : connectToSql();
        this._entitiesMain = this._entitiesMain.map(function (item) {
            item.letterRole = 'MAIN';
            return item
        });
        this._entitiesCc = this._entitiesCc.map(function (item) {
            item.letterRole = 'CC';
            return item
        });
        var entities = this._entitiesMain.concat(this._entitiesCc);
        try {
            for (var i = 0; i < entities.length; i++) {
                var entityAssociation = new LetterEntity({
                    letterRole: entities[i].letterRole,
                    _letter: this,
                    _entity: entities[i]
                });
                entityAssociation.addInDb(externalConn);
            }
        } catch (e) {
            Logger.log(e);
            throw e;
        } finally {
            if (!externalConn && conn.isValid(0)) conn.close();
        }
    }

    editInDb(externalConn?, isPartOfTransaction?: boolean) {
        this.deleteCaseAssociationsFromDb(externalConn);
        this.deleteEntityAssociationsFromDb(externalConn);
        editInDb('Letters', this, externalConn, isPartOfTransaction);
        this.addCaseAssociationsInDb(externalConn);
        this.addEntitiesAssociationsInDb(externalConn);
    }

    /*
     * pismo przychodzące albo nasze pismo po staremu
     */
    editLetterGdElements(blobEnviObjects: Array<any>): GoogleAppsScript.Drive.Folder | GoogleAppsScript.Drive.File {
        //użytkownik chce zmienić plik
        if (blobEnviObjects.length > 0) {
            var letterGdElement: GoogleAppsScript.Drive.Folder | GoogleAppsScript.Drive.File;
            this._fileOrFolderChanged = this.deleteFromGd();
            this.letterFilesCount = blobEnviObjects.length;
            if (blobEnviObjects.length > 1)
                letterGdElement = this.createLetterFolder(blobEnviObjects);
            else
                letterGdElement = this.createLetterFile(blobEnviObjects);

            this._documentOpenUrl = Gd.createDocumentOpenUrl(this.letterGdId);
        } else
            letterGdElement = (this.letterGdId) ? DriveApp.getFileById(this.letterGdId) : DriveApp.getFolderById(this.folderGdId);
        return letterGdElement;
    }


    deleteFromDb(externalConn?) {
        deleteFromDb('Letters', this, externalConn);
    }

    deleteFromGd() {
        if (this.letterGdId || this.folderGdId) {
            //usuwamy folder lub plik
            if (this.canUserChangeFileOrFolder()) {
                if (this.folderGdId)
                    DriveApp.getFolderById(this.folderGdId).setTrashed(true);
                else
                    DriveApp.getFileById(this.letterGdId).setTrashed(true);
                return true;
            }
            //zmieniamy nazwę folderu lub pliku ze wzgędu na brak uprawnień do usuwania 
            else {
                if (this.folderGdId) {
                    var folder = DriveApp.getFolderById(this.folderGdId)
                    folder.setName(folder.getName() + '- USUŃ');
                }
                else {
                    var file = DriveApp.getFileById(this.letterGdId)
                    file.setName(file.getName() + '- USUŃ');
                }
                return false;
            }
        }
    }

    deleteCaseAssociationsFromDb(externalConn) {
        var conn = (externalConn) ? externalConn : connectToSql();
        try {
            var stmt = conn.createStatement();
            stmt.executeUpdate('DELETE FROM Letters_Cases WHERE ' +
                'LetterId =' + prepareValueToSql(this.id));
        } catch (e) {
            Logger.log(e);
            throw e;
        } finally {
            if (!externalConn && conn.isValid(0)) conn.close();
        }
    }

    deleteEntityAssociationsFromDb(externalConn) {
        var conn = (externalConn) ? externalConn : connectToSql();
        try {
            var stmt = conn.createStatement();
            stmt.executeUpdate('DELETE FROM Letters_Entities WHERE ' +
                'LetterId =' + prepareValueToSql(this.id));
        } catch (e) {
            Logger.log(e);
            throw e;
        } finally {
            if (!externalConn && conn.isValid(0)) conn.close();
        }
    }
}

/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * 
 * * * * * * * * * * * * * * * * * * * IncomingLetter * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */
class IncomingLetter extends Letter {
    constructor(initParamObject: any) {
        super(initParamObject);
        this.isOur = false;
        this.number = initParamObject.number;

    }

    public makeFolderName() {
        var folderName: string = super.makeFolderName();
        return folderName += ': Przychodzące'
    }

    public appendAttachments(blobEnviObjects: any[]): GoogleAppsScript.Drive.Folder {
        super.appendAttachments(blobEnviObjects);
        let letterFolder: GoogleAppsScript.Drive.Folder;
        //był tylko jeden plik pisma bez załaczników
        if (this.letterFilesCount - blobEnviObjects.length == 1) {
            let letterFile = DriveApp.getFileById(this.letterGdId)
            letterFolder = this.createLetterFolder(blobEnviObjects);
            Gd.removeAllFileParents(letterFile);
            letterFolder.addFile(letterFile);
            this._documentOpenUrl = undefined;
            this.letterGdId = undefined;
        }
        //folder pisma istnieje
        else {
            let letterFolder = DriveApp.getFolderById(this.folderGdId);

            for (let i = 0; i < blobEnviObjects.length; i++) {
                let blob = Tools._blobEnviObjectToBlob(blobEnviObjects[i]);
                letterFolder.createFile(blob);
            }
        }
        return letterFolder;
    }

    /*
     * Odpalana w contollerze
     */
    createLetterGdElements(blobEnviObjects: Array<any>): GoogleAppsScript.Drive.Folder | GoogleAppsScript.Drive.File {
        super.createLetterGdElements(blobEnviObjects);
        if (blobEnviObjects.length > 1)
            return this.createLetterFolder(blobEnviObjects);
        else
            return this.createLetterFile(blobEnviObjects);
    }
}

/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * 
 * * * * * * * * * * * * * * * * * * * OurOldTypeLetter * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */
class OurOldTypeLetter extends Letter {
    constructor(initParamObject: any) {
        super(initParamObject);
        this.isOur = true;
    }

    makeFolderName(): string {
        var folderName: string = super.makeFolderName();
        return folderName += ': Wychodzące'
    }

    public appendAttachments(blobEnviObjects: any[]): GoogleAppsScript.Drive.Folder {
        super.appendAttachments(blobEnviObjects);
        let letterFolder: GoogleAppsScript.Drive.Folder;
        //był tylko jeden plik pisma bez załaczników
        if (this.letterFilesCount - blobEnviObjects.length == 1) {
            let letterFile = DriveApp.getFileById(this.letterGdId)
            letterFolder = this.createLetterFolder(blobEnviObjects);
            Gd.removeAllFileParents(letterFile);
            letterFolder.addFile(letterFile);
            this._documentOpenUrl = undefined;
            this.letterGdId = undefined;
        }
        //folder pisma istnieje
        else {
            let letterFolder = DriveApp.getFolderById(this.folderGdId);

            for (let i = 0; i < blobEnviObjects.length; i++) {
                let blob = Tools._blobEnviObjectToBlob(blobEnviObjects[i]);
                letterFolder.createFile(blob);
            }
        }
        return letterFolder;
    }

    /*
     * Odpalana w contollerze
     */
    createLetterGdElements(blobEnviObjects): GoogleAppsScript.Drive.Folder | GoogleAppsScript.Drive.File {
        super.createLetterGdElements(blobEnviObjects);
        if (blobEnviObjects.length > 1)
            return this.createLetterFolder(blobEnviObjects);
        else
            return this.createLetterFile(blobEnviObjects);
    }
}

/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * 
 * * * * * * * * * * * * * * * * * * * OurLetter * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * 
 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */
class OurLetter extends Letter {
    constructor(initParamObject: any) {
        super(initParamObject);
        this.isOur = true;
        this.number = this.id;
    }
    makeFolderName(): string {
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
     * Tworzy folder i plik pisma ENVI z wybranego szablonu
     * blobEnviObjects - załączniki
     */
    createOurLetter(blobEnviObjects: Array<any>) {
        var letterFolder = this.createLetterFolder(blobEnviObjects);
        var ourLetterFile = Gd.createDuplicateFile(this._template.gdId, letterFolder.getId(), this.number + ' ' + this.creationDate);
        ourLetterFile.setShareableByEditors(true);
        this.letterGdId = ourLetterFile.getId();
        this._documentEditUrl = ourLetterFile.getUrl();
        return letterFolder;
    }

    addInDb(externalConn, isPartOfTransaction?) {
        super.addInDb(externalConn, isPartOfTransaction);
        this.number = this.id;
    }
    /*
     * Odpalana w contollerze
     */
    createLetterGdElements(blobEnviObjects): GoogleAppsScript.Drive.Folder {
        super.createLetterGdElements(blobEnviObjects);
        return this.createLetterFolder(blobEnviObjects);
    }
    /*
    * Tworzy folder i plik pisma ENVI z wybranego szablonu
    * blobEnviObjects - załączniki
    */
    createLetterFolder(blobEnviObjects) {
        var letterFolder = super.createLetterFolder(blobEnviObjects);
        var ourLetterFile = Gd.createDuplicateFile(this._template.gdId, letterFolder.getId(), this.number + ' ' + this.creationDate);
        ourLetterFile.setShareableByEditors(true);
        this.letterGdId = ourLetterFile.getId();
        this._documentEditUrl = ourLetterFile.getUrl();
        return letterFolder;
    }

    /*
     * _blobEnviObjects to załączniki do pisma
     */
    editLetterGdElements(blobEnviObjects: Array<any>): GoogleAppsScript.Drive.Folder {
        this._fileOrFolderChanged = this.deleteFromGd();
        this.letterFilesCount = blobEnviObjects.length;
        return this.createOurLetter(blobEnviObjects);
    }
}