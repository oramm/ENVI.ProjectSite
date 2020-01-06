class MaterialCardVersion {
  id?: number;
  _lastUpdated?: any;
  _editor: any;
  editorId: number;
  status: string;
  parentId: number;
  
  constructor(initParamObject) {
    if (initParamObject) {
      this.id = initParamObject.id;
      this.editorId = initParamObject._editor.id;
      this.status = initParamObject.status;
      this.parentId = initParamObject.parentId;
      this._lastUpdated = initParamObject._lastUpdated;
      this._editor = initParamObject._editor;
    }
  }

  addInDb(conn) {
    addInDb('MaterialCardVersions', this, conn, true);
  }


  editInDb(externalConn, isPartOfTransaction) {
    editInDb('MaterialCardVersions', this, externalConn, isPartOfTransaction);
  }

  deleteFromDb() {
    deleteFromDb('MaterialCardVersions', this);
  }
}