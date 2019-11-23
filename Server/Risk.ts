function Risk(initParamObject) {
  if (initParamObject) {
    this.id = initParamObject.id;
    this.name = initParamObject.name;
    this.cause = initParamObject.cause;
    this.scheduleImpactDescription = initParamObject.scheduleImpactDescription;
    this.costImpactDescription = initParamObject.costImpactDescription;
    this.probability = initParamObject.probability;
    this.overallImpact = initParamObject.overallImpact;
    this._rate = this.getRate();
    this.additionalActionsDescription = initParamObject.additionalActionsDescription;
    this.caseId = initParamObject.caseId;
    this.projectId = initParamObject.projectId;
    this._lastUpdated = initParamObject.lastUpdated;
    this._smallRateLimit = 4;
    this._bigRateLimit = 12
    this._contract = (initParamObject._contract) ? initParamObject._contract : {};
    this._parent = (initParamObject._parent) ? initParamObject._parent : {};
    this._case = initParamObject._case;
    this.caseId = initParamObject._case.id;
    //ryzyko jest sprawą
    if (initParamObject._case.gdFolderId)
      this._gdFolderUrl = Gd.createGdFolderUrl(initParamObject._case.gdFolderId);
  }
}

Risk.prototype = {
  constructor: Risk,
  getRate: function () {
    var rateInt = this.probability * this.overallImpact;
    if (rateInt <= 4)
      return 'M';
    if (rateInt < 12)
      return 'S';
    else
      return 'D';
  },

  addInDb: function (conn) {
    addInDb('Risks', this, conn, true);
  },

  addInScrum: function (externalConn) {
    var conn = (externalConn) ? externalConn : connectToSql();
    //dodaj odpowiednie zadanie
    var initTask = new Task({
      caseId: this._case.id,
      description: "wg. procedury zarządzania ryzykiem",
      name: "Wykonaj procedurę",
      status: "Nie rozpoczęty",
      ownerId: (this._contract._manager) ? this._contract._manager.id : undefined
    });

    var deadline = new Date(Math.max(ToolsDate.getNextFridayDate().getTime(),
      ToolsDate.addDays(new Date(), 7).getTime()));
    initTask.deadline = Utilities.formatDate(deadline, "CET", "yyyy-MM-dd");
    //if (this._admin.id) this._task.ownerId = this._admin.id;

    initTask.addInDb(conn, true);
    initTask.addInScrum(conn, 'SKIP_MAKE_TIMES_SUMMARY');
  },

  editInDb: function (externalConn, isPartOfTransaction) {
    editInDb('Risks', this, externalConn, isPartOfTransaction);
  },

  deleteFromDb: function () {
    deleteFromDb('Risks', this);
  },
  //wymaga dokonczenia, jeśli ma być zadanie po utworzeniu to trzeba do bazy doać kolumnę InitTaskId i tym zarządzać
  deleteFromScrum: function () {
    throw new Error('metoda niezaimplementowana');
    /*var firstCaseRow = findFirstInRange(this.id, SCRUM_DATA_VALUES, SCRUM_COL_CASE_ID) + 1;
    var lastCaseRow = findLastInRange(this.id, SCRUM_DATA_VALUES, SCRUM_COL_CASE_ID) + 1;
    if (firstCaseRow){
      SCRUM_SHEET.deleteRow(row);
      if(row<13){
        //odtwórz #TimesSummary i #Times
        scrumMakeTimesSummary();
      }
    }
    */
  },
}