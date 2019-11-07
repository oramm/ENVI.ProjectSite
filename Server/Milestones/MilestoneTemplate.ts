function MilestoneTemplate(initParamObject) {
  if(initParamObject){
    this.id = initParamObject.id;
    this.name = initParamObject.name;
    this.description = initParamObject.description;
    if (initParamObject.startDateRule)
      this.startDateRule  = initParamObject.startDateRule;
    if (initParamObject.endDateRule)
      this.endDateRule  = initParamObject.endDateRule;
    initParamObject.endDateRule
    this.lastUpdated = initParamObject.lastUpdated;
    this._contractTypeId = initParamObject._contractTypeId;
    this._folderNumber = initParamObject._folderNumber;
    
    this._milestoneType = initParamObject._milestoneType;
    this.milestoneTypeId = initParamObject._milestoneType.id
  }
}

MilestoneTemplate.prototype = {
  constructor: MilestoneTemplate,
  
  addInDb: function(conn, isPartOfTransaction) {
     return addInDb('MilestoneTemplates', this, conn, isPartOfTransaction);
  },
  
  editInDb: function(externalConn, isPartOfTransaction) {
    editInDb('MilestoneTemplates', this, externalConn, isPartOfTransaction);
  },
  
  deleteFromDb: function (){
    deleteFromDb ('MilestoneTemplates', this, undefined, undefined);
  }
}