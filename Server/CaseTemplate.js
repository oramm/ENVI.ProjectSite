function CaseTemplate(initParamObject) {
  if(initParamObject){
    this.id = initParamObject.id;
    this.templateComment = initParamObject.templateComment;
    this.name = initParamObject.name;
    this.description = initParamObject.description;
    this._caseType = initParamObject._caseType;
    this.caseTypeId = initParamObject._caseType.id;
  }
}

CaseTemplate.prototype = {
  constructor: CaseTemplate,
  
  addInDb: function(conn, isPartOfTransaction) {
     return addInDb('CaseTemplates', this, conn, isPartOfTransaction);
  },
  
  editInDb: function(externalConn, isPartOfTransaction) {
    editInDb('CaseTemplates', this, externalConn, isPartOfTransaction);
  },
  
  deleteFromDb: function (){
    deleteFromDb ('CaseTemplates', this);
  }
}