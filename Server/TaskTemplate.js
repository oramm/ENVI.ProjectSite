function TaskTemplate(initParamObject) {
  if(initParamObject){
    this.id = initParamObject.id;
    //this.templateComment = initParamObject.templateComment;
    this.name = initParamObject.name;
    this.description = initParamObject.description;
    this.deadlineRule = initParamObject.deadlineRule;
    this.status = initParamObject.status;
    //używane przy zadaniach defaultowych
    if(initParamObject._caseTemplate){
      this._caseTemplate = initParamObject._caseTemplate;
      this.caseTemplateId = initParamObject._caseTemplate.id;
    }
  }
}

TaskTemplate.prototype = {
  constructor: TaskTemplate,
  
  addInDb: function(conn, isPartOfTransaction) {
     return addInDb('TaskTemplates', this, conn, isPartOfTransaction);
  },
  
  editInDb: function(externalConn, isPartOfTransaction) {
    editInDb('TaskTemplates', this, externalConn, isPartOfTransaction);
  },
  
  deleteFromDb: function (){
    deleteFromDb ('TaskTemplates', this);
  }
}