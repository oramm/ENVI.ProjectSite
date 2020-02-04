class ProcessStepInstance {
  id?: number;
  processInstanceId?: number;
  processStepId?: number;
  status?: string;
  _processStep?: any;
  editorId?: number;
  deadline?: string;
  _lastUpdated?: any;
  _case?: any;
  _documentOpenUrl?: string;
  _ourLetter?: any;
  ourLetterId?: number;
  _extRepoTmpDataObject?: any;

  constructor(initParamObject) {
    if (initParamObject) {
      this.id = initParamObject.id;
      this.processInstanceId = initParamObject.processInstanceId;
      if (initParamObject._processStep) {
        this._processStep = initParamObject._processStep;
        this.processStepId = initParamObject._processStep.id;
      }
      this.status = (initParamObject.status) ? initParamObject.status : 'Nie rozpoczęte';
      if (initParamObject._ourLetter && initParamObject._ourLetter.id) {
        this._ourLetter = initParamObject._ourLetter;
        this.ourLetterId = initParamObject._ourLetter.id;
        this._documentOpenUrl = Gd.createDocumentOpenUrl(initParamObject._ourLetter.documentGdId);
      }
      this.editorId = initParamObject.editorId;

      initParamObject.deadline = ToolsDate.dateDMYtoYMD(initParamObject.deadline);
      this.deadline = (initParamObject.deadline) ? Utilities.formatDate(new Date(initParamObject.deadline), "CET", "yyyy-MM-dd") : undefined;

      this._lastUpdated = initParamObject._lastUpdated;
      this._case = initParamObject._case;
    }
  }

  addInDb(conn: GoogleAppsScript.JDBC.JdbcConnection, isPartOfTransaction?: boolean) {
    return addInDb('ProcessesStepsInstances', this, conn, isPartOfTransaction);
  }

  editInDb(externalConn?, isPartOfTransaction?: boolean) {
    editInDb('ProcessesStepsInstances', this, externalConn, isPartOfTransaction);
  }

  deleteFromDb() {
    deleteFromDb('ProcessesStepsInstances', this);
  }
}