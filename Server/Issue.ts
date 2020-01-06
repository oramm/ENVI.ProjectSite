function Issue(initParamObject) {
  if (initParamObject) {
    this.id = initParamObject.id;
    this.name = initParamObject.name;
    this._parent = initParamObject._parent;
    this.contractId = initParamObject._parent.id;
    if (initParamObject.description)
      this.description = initParamObject.description;
    if (initParamObject.date) {
      initParamObject.date = ToolsDate.dateDMYtoYMD(initParamObject.date);
      this.date = Utilities.formatDate(new Date(initParamObject.date), "CET", "yyyy-MM-dd");
    }
    initParamObject.deadline = ToolsDate.dateDMYtoYMD(initParamObject.deadline);
    this.deadline = (initParamObject.deadline) ? Utilities.formatDate(new Date(initParamObject.deadline), "CET", "yyyy-MM-dd") : undefined;
    if (initParamObject.solvedDate) {
      initParamObject.solvedDate = ToolsDate.dateDMYtoYMD(initParamObject.solvedDate);
      this.solvedDate = (initParamObject.solvedDate) ? Utilities.formatDate(new Date(initParamObject.solvedDate), "CET", "yyyy-MM-dd") : undefined;
    }
    if (initParamObject.contractorsDescription)
      this.contractorsDescription = initParamObject.contractorsDescription;
    this.status = initParamObject.status;
    this.originalId = initParamObject.originalId;
    if (initParamObject.gdFolderId) {
      this.gdFolderId = initParamObject.gdFolderId;
      this._gdFolderUrl = Gd.createGdFolderUrl(initParamObject.gdFolderId);
    }
    this._lastUpdated = initParamObject._lastUpdated;

  }
}

Issue.prototype = {
  constructor: Issue,

  addInDb: function (conn, isPartOfTransaction) {
    return addInDb('Issues', this, conn, isPartOfTransaction);
  },

  editInDb: function (externalConn, isPartOfTransaction) {
    editInDb('Issues', this, externalConn, isPartOfTransaction);
  },

  deleteFromDb: function () {
    deleteFromDb('Issues', this);
  }
}