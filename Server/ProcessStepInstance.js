function ProcessStepInstance(initParamObject) {
  if(initParamObject){
    this.id = initParamObject.id;
    this.processInstanceId = initParamObject.processInstanceId;
    this.processStepId = initParamObject._processStep.id;
    this.status = (initParamObject.status)? initParamObject.status : 'Nie rozpoczęte' ;
    this._processStep = initParamObject._processStep;
    //this.caseId = initParamObject._case.id;
    this.editorId = initParamObject.editorId;
    
    initParamObject.deadline = dateDMYtoYMD(initParamObject.deadline);
    this.deadline = (initParamObject.deadline)? Utilities.formatDate(new Date(initParamObject.deadline), "CET", "yyyy-MM-dd") : undefined;
    
    this._lastUpdated = initParamObject._lastUpdated;
    this._processStep = initParamObject._processStep;
    this._case = initParamObject._case;
    if(initParamObject._processStep.documentTemplateId){	
      this._documentOpenUrl = Gd.createDocumentOpenUrl(initParamObject._processStep.documentTemplateId);
    }
  }
}

ProcessStepInstance.prototype = {
  constructor: ProcessStepInstance,
  
  addInDb: function(conn, isPartOfTransaction) {
     return addInDb('ProcessesStepsInstances', this, conn, isPartOfTransaction);
  },
  
  editInDb: function(externalConn, isPartOfTransaction) {
    editInDb('ProcessesStepsInstances', this, externalConn, isPartOfTransaction);
  },
  
  deleteFromDb: function (){
    deleteFromDb ('ProcessesStepsInstances', this);
  }
}