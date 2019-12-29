/* 1. Wniosek materiałowy jest szczególnym typem sprawy
 * 2. Każdy wniosek jest przypisany do kamienia '04 Roboty Nadzór' i do unikalnej  sprawy typu '07.01 Wnioski Materiałowe'
 * 3. Cykl życia sprawy wniosku jest powiązany z cyklem życia powiązanych zadań (CRUD) - dodanie/edycja/usunięcie wniosku tworzy/zmienia/kasuje powiązane zadania
 */

class MaterialCard {
  id?: any;
  name?: string;
  description?: string;
  engineersComment?: string;
  employersComment?: string;
  status?: string;
  creationDate?: any;
  deadline?: any;
  _lastUpdated?: any;
  _editor?: any;
  _owner?: any;
  ownerId?: any;
  contractId?: any;
  _contract?: any;
  gdFolderId?: string;
  _gdFolderUrl?: string;
  _versions?: MaterialCardVersion[];
  constructor(initParamObject) {
    if (initParamObject) {
      this.id = initParamObject.id;
      this.name = initParamObject.name;
      this.description = initParamObject.description;
      this.engineersComment = initParamObject.engineersComment;
      this.employersComment = initParamObject.employersComment;
      this.status = initParamObject.status;
      this.creationDate = initParamObject.creationDate;
      initParamObject.creationDate = dateDMYtoYMD(initParamObject.creationDate);
      this.creationDate = (initParamObject.creationDate) ? Utilities.formatDate(new Date(initParamObject.creationDate), "CET", "yyyy-MM-dd") : undefined;

      this.deadline = initParamObject.deadline;
      this._lastUpdated = initParamObject._lastUpdated;
      this._editor = initParamObject._editor;
      this._owner = initParamObject._owner;
      if (initParamObject._owner)
        this.ownerId = initParamObject._owner.id;
      this._contract = initParamObject._contract;
      if (initParamObject._contract)
        this.contractId = initParamObject.contractId;

      this.gdFolderId = initParamObject.gdFolderId;
      this._gdFolderUrl = Gd.createGdFolderUrl(this.gdFolderId);
      this._versions = (initParamObject._versions) ? initParamObject._versions : [];
    }
  }

  setGdFolderName(): string {
    return this.id + ' ' + this.name;
  }

  addInDb(conn) {
    addInDb('MaterialCards', this, conn, true);
    this.addNewVersion(conn);
  }

  private addNewVersion(conn) {
    var version = new MaterialCardVersion({
      parentId: this.id,
      _editor: this._editor,
      status: this.status
    });
    try {
      version.addInDb(conn);
      this._versions.push(version);
    } catch (err) {
      Logger.log(JSON.stringify(err));
      throw err;
    }
  }

  createGdFolder() {
    var rootFolder = DriveApp.getFolderById(this._contract.materialCardsGdFolderId);
    return Gd.setFolder(rootFolder, this.setGdFolderName());
  }

  editInDb(externalConn, isPartOfTransaction) {
    editInDb('MaterialCards', this, externalConn, isPartOfTransaction);
    this.addNewVersion(externalConn);
  }

  editGdFolderName() {
    var folder = DriveApp.getFolderById(this.gdFolderId);
    folder.setName(this.setGdFolderName());
  }

  deleteFromDb() {
    deleteFromDb('MaterialCards', this);
  }

  deleteGdFolder() {
    var folder = DriveApp.getFolderById(this.gdFolderId);
    if (Gd.canUserDeleteFolder(this.gdFolderId)) {
      folder.setTrashed(true);
      return true;
    }
    else {
      var rootFolder = DriveApp.getFolderById(this._contract.materialCardsGdFolderId);
      rootFolder.removeFolder(folder);
      return false;
    }
  }
}



function test_editMaterialCard() {
  editMaterialCard('{"_owner":{"nameSurnameEmail":"Ewa  Brachowska e.brachowska@hydrotech.info.pl","surname":"Brachowska","name":"Ewa ","id":271,"email":"e.brachowska@hydrotech.info.pl"},"_gdFolderUrl":"https://drive.google.com/drive/folders/1sw3E0LK3o7Oh62llVR0DFm8eNIytnDKk","_lastUpdated":"2019-12-27 16:08:14.0","description":"sssss","gdFolderId":"1sw3E0LK3o7Oh62llVR0DFm8eNIytnDKk","ownerId":271,"id":130,"_versions":[{"_editor":{"surname":"Gazda","name":"Marek","id":125,"email":"marek@envi.com.pl"},"editorId":125,"lastUpdated":"2019-12-27 16:26:28.0","id":354,"parentId":130,"status":"Robocze"}],"_contract":{"number":"K1","_parent":{"ourId":"NOW.GWS.01.POIS","name":"Budowa kanalizacji sanitarnej w Wykrotach wraz z przyłączami","gdFolderId":"1dL5vgvnD_a0EyI8jEwjt8cKXIsOkmADR"},"name":"Budowa kanalizacji sanitarnej w Wykrotach wraz z przyłączami","_type":{"name":"Żółty","description":"3","id":3,"isOur":false},"id":395,"gdFolderId":"1mqvF0fhML8nEhhfzEYGBfIqyg8vOl3eq"},"creationDate":"2019-12-27","_editor":{"surname":"Gazda","name":"Marek","id":125,"email":"marek@envi.com.pl"},"name":"zmiana","contractId":395,"status":"Robocze"}')
}