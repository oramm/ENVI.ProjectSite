function DocumentTemplate(initParamObject) {
  if(initParamObject){
    this.id = initParamObject.id;
    this.name = initParamObject.name;
    this.description = initParamObject.description;
    this.caseTypeId = initParamObject.caseTypeId;
    this.gdId = initParamObject.gdId;
  }
}

DocumentTemplate.prototype = {
  constructor: DocumentTemplate,
  
  addInDb: function(conn, isPartOfTransaction) {
     return addInDb('DocumentTemplates', this, conn, isPartOfTransaction);
  },
  
  editInDb: function(externalConn, isPartOfTransaction) {
    editInDb('DocumentTemplates', this, externalConn, isPartOfTransaction);
  },
  
  deleteFromDb: function (){
    deleteFromDb ('DocumentTemplates', this);
  }
}