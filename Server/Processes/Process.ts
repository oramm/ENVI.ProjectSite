function Process(initParamObject) {
  if(initParamObject){
    this.id = initParamObject.id;
    this.name = initParamObject.name;
    this.description = initParamObject.description;
    
    this._caseType = initParamObject._caseType
    this.caseTypeId = initParamObject._caseType.id
    
    if (initParamObject.status)
      this.status = 'ACTIVE';
    
    this._lastUpdated = initParamObject._lastUpdated;
  }
}

Process.prototype = {
  constructor: Process,
  
  addInDb: function(conn, isPartOfTransaction) {
     return addInDb('Processes', this, conn, isPartOfTransaction);
  },
  
  editInDb: function(externalConn, isPartOfTransaction) {
    editInDb('Processes', this, externalConn, isPartOfTransaction);
  },
  
  deleteFromDb: function (){
    deleteFromDb ('Processes', this, undefined, undefined);
  }
}