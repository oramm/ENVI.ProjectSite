class ProcessStep {
  id?: number;
  name?: string;
  description?: string;
  _parent?: any;
  processId?: number;
  status?: string;
  _lastUpdated?: string;
  _documentOpenUrl?: string;
  _documentTemplate?: any
  documentTemplateId?: number;

  constructor(initParamObject) {
    if (initParamObject) {
      this.id = initParamObject.id;
      this.name = initParamObject.name;
      this.description = initParamObject.description;
      if (initParamObject._parent) {
        this._parent = initParamObject._parent;
        this.processId = initParamObject._parent.id;
      }
      if (initParamObject.status)
        this.status = initParamObject.status;

      this._lastUpdated = initParamObject._lastUpdated;
      if (initParamObject._documentTemplate) {
        this._documentTemplate = new DocumentTemplate(initParamObject._documentTemplate)
        this.documentTemplateId = this._documentTemplate.id;
        this._documentOpenUrl = Gd.createDocumentOpenUrl(initParamObject._documentTemplate.gdId);
      }
    }
  }
  addInDb(conn, isPartOfTransaction?: boolean) {
    return addInDb('ProcessesSteps', this, conn, isPartOfTransaction);
  }

  editInDb(externalConn, isPartOfTransaction) {
    editInDb('ProcessesSteps', this, externalConn, isPartOfTransaction);
  }

  deleteFromDb() {
    deleteFromDb('ProcessesSteps', this, undefined, undefined);
  }
}