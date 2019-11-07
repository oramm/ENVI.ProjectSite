function ProcessStep(initParamObject) {
  if(initParamObject){
    this.id = initParamObject.id;
    this.name = initParamObject.name;
    this.description = initParamObject.description;
    this._parent = initParamObject._parent;
    this.processId = initParamObject._parent.id;
    
    if (initParamObject.status)
      this.status = initParamObject.status;
    
    this._lastUpdated = initParamObject._lastUpdated;
    if(initParamObject.documentTemplateId){	
      this._documentOpenUrl = Gd.createDocumentOpenUrl(initParamObject.documentTemplateId);
      this.documentTemplateId = initParamObject.documentTemplateId
    }
  }
}

ProcessStep.prototype = {
  constructor: ProcessStep,
  
  addInDb: function(conn, isPartOfTransaction) {
     return addInDb('ProcessesSteps', this, conn, isPartOfTransaction);
  },
  
  editInDb: function(externalConn, isPartOfTransaction) {
    editInDb('ProcessesSteps', this, externalConn, isPartOfTransaction);
  },
  
  deleteFromDb: function (){
    deleteFromDb ('ProcessesSteps', this, undefined, undefined);
  }
}