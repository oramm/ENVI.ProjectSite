function CaseType(initParamObject) {
  if(initParamObject){
    this.id = initParamObject.id;
    this.name = initParamObject.name;
    this.folderNumber = initParamObject.folderNumber;
    if (initParamObject.description) 
      this.description = initParamObject.description;
    
    this.isDefault = initParamObject.isDefault;
    this.isUniquePerMilestone = initParamObject.isUniquePerMilestone;
    this._milestoneType = initParamObject._milestoneType;
    this.milestoneTypeId = initParamObject._milestoneType.id;
    this._processes = (initParamObject._processes)? initParamObject._processes : [];
  }
}

CaseType.prototype = {
  constructor: Case,
  
  addInDb: function(conn, isPartOfTransaction) {
     return addInDb('CaseTypes', this, conn, isPartOfTransaction);
  },
  
  editInDb: function(externalConn, isPartOfTransaction) {
    editInDb('CaseTypes', this, externalConn, isPartOfTransaction);
  },
  
  deleteFromDb: function (){
    deleteFromDb ('CaseTypes', this);
  }
}