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
      if(initParamObject.name) this.name = initParamObject.name;
      if(initParamObject.description) this.description = initParamObject.description;
      if(initParamObject.engineersComment) this.engineersComment = initParamObject.engineersComment;
      if(initParamObject.employersComment) this.employersComment = initParamObject.employersComment;
      this.status = initParamObject.status;
      this.creationDate = initParamObject.creationDate;
      initParamObject.creationDate =ToolsDate.dateDMYtoYMD(initParamObject.creationDate);
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
  editMaterialCard('')
}