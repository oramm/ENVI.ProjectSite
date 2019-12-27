/* 1. Wniosek materiałowy jest szczególnym typem sprawy
 * 2. Każdy wniosek jest przypisany do kamienia '04 Roboty Nadzór' i do unikalnej  sprawy typu '07.01 Wnioski Materiałowe'
 * 3. Cykl życia sprawy wniosku jest powiązany z cyklem życia powiązanych zadań (CRUD) - dodanie/edycja/usunięcie wniosku tworzy/zmienia/kasuje powiązane zadania
 */

class MaterialCard {
  id?: any;
  name?: string;
  description?: string;
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
  _versions?: MaterialCardVersion[] = [];
  constructor(initParamObject) {
    if (initParamObject) {
      this.id = initParamObject.id;
      this.name = initParamObject.name;
      this.description = initParamObject.description;
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
      this._versions = initParamObject._versions;
    }
  }

  getCaseData(externalConn) {
    var conn = (externalConn) ? externalConn : connectToSql();
    var stmt = conn.createStatement();
    var query = 'SELECT \n \t' +
      'Cases.Id, \n \t' +
      'Cases.Number, \n \t' +
      'Cases.Name, \n \t' +
      'Cases.Description, \n \t' +
      'Cases.GdFolderId, \n \t' +
      'Milestones.ContractId, \n \t' +
      'CaseTypes.Id AS TypeId, \n \t' +
      'CaseTypes.Name AS TypeName, \n \t' +
      'CaseTypes.FolderNumber AS TypeFolderNumber \n' +
      'FROM Cases \n' +
      'JOIN CaseTypes ON CaseTypes.Id=Cases.TypeId \n' +
      'JOIN Milestones ON Milestones.Id=Cases.MilestoneId \n' +
      'JOIN Contracts  ON Milestones.ContractId = Contracts.Id \n' +
      'WHERE Cases.Id = '// + this._caseId;
    Logger.log(query)
    var dbResults = stmt.executeQuery(query);
    dbResults.last();
    var item = new Case({
      id: dbResults.getLong('Id'),
      number: dbResults.getInt('Number'),
      gdFolderId: dbResults.getString('GdFolderId'),
      _type: {
        id: dbResults.getLong('TypeId'),
        name: dbResults.getString('TypeName'),
        folderNumber: dbResults.getString('TypeFolderNumber')
      },
    });
    item.contractId = dbResults.getLong('ContractId');
    return item;
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

  //prostszy wariant niż dla spraw - ma opcji zmiany typu sprawy
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