function TaskTemplateForProcess(initParamObject) {
  if(initParamObject){
    this.id = initParamObject.id;
    //this.templateComment = initParamObject.templateComment;
    this.name = initParamObject.name;
    this.description = initParamObject.description;
    this.deadlineRule = initParamObject.deadlineRule;
    //używane przy zadaniach przypisanych do procesu
    if(initParamObject._caseType){
      this._caseType = initParamObject._caseType;
      this.caseTypeId = initParamObject._caseTypeid;
    }
    //używane przy zadaniach przypisanych do procesu
    if(initParamObject._process){
      this._process = initParamObject._process;
      this.processId = initParamObject._process.id;
    }
  }
}

TaskTemplateForProcess.prototype = {
  constructor: TaskTemplateForProcess,
  
  addInDb: function(conn, isPartOfTransaction) {
     return addInDb('TaskTemplatesForProcesses', this, conn, isPartOfTransaction);
  },
  
  editInDb: function(externalConn, isPartOfTransaction) {
    editInDb('TaskTemplatesForProcesses', this, externalConn, isPartOfTransaction);
  },
  
  deleteFromDb: function (){
    deleteFromDb ('TaskTemplatesForProcesses', this);
  }
}