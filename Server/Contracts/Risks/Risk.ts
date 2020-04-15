class Risk {
  id: number;
  name: string;
  cause: string;
  scheduleImpactDescription: string;
  costImpactDescription: string;
  probability: any;
  overallImpact: any;
  _rate: string;
  additionalActionsDescription: any;
  caseId: number;
  projectOurId: string;
  _lastUpdated: any;
  _smallRateLimit: number;
  _bigRateLimit: number;
  _contract: any;
  _parent: any;
  _case: any;
  _gdFolderUrl: string;

  constructor(initParamObject: any) {
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
      this.projectOurId = initParamObject.projectOurId;
      this._lastUpdated = initParamObject.lastUpdated;
      this._smallRateLimit = 4;
      this._bigRateLimit = 12
      this._contract = (initParamObject._contract) ? initParamObject._contract : {};
      this._parent = (initParamObject._parent) ? initParamObject._parent : {};

      if (initParamObject._case) {
        this._case = initParamObject._case;
        this.caseId = initParamObject._case.id;
        //ryzyko jest sprawą
        if (initParamObject._case.gdFolderId)
          this._gdFolderUrl = Gd.createGdFolderUrl(initParamObject._case.gdFolderId);
      }
    }
  }

  getRate() {
    var rateInt = this.probability * this.overallImpact;
    if (rateInt <= 4)
      return 'M';
    if (rateInt < 12)
      return 'S';
    else
      return 'D';
  }

  addInDb(conn) {
    addInDb('Risks', this, conn, true);
  }

  addInScrum(externalConn) {
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
  }

  editInDb(externalConn?, isPartOfTransaction?) {
    editInDb('Risks', this, externalConn, isPartOfTransaction);
  }

  deleteFromDb() {
    deleteFromDb('Risks', this);
  }
  //wymaga dokonczenia, jeśli ma być zadanie po utworzeniu to trzeba do bazy doać kolumnę InitTaskId i tym zarządzać
  deleteFromScrum() {
    throw new Error('metoda niezaimplementowana');
  }
}