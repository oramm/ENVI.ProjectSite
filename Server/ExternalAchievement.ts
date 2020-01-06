function ExternalAchievement(initParamObject) {
  if(initParamObject){
    this.id = initParamObject.id;
    this.roleName = initParamObject.roleName;
    this.description = initParamObject.description;
    this.worksScope = initParamObject.worksScope;
    this.worksValue = initParamObject.worksValue;
    this.projectValue = initParamObject.projectValue;
    
    initParamObject.startDate =ToolsDate.dateDMYtoYMD(initParamObject.startDate);
    this.startDate = Utilities.formatDate(new Date(initParamObject.startDate), "CET", "yyyy-MM-dd");
    
    initParamObject.endDate =ToolsDate.dateDMYtoYMD(initParamObject.endDate);
    this.endDate = Utilities.formatDate(new Date(initParamObject.endDate), "CET", "yyyy-MM-dd");
    this.employer = initParamObject.employer;
    this.ownerId = initParamObject._owner.id;
    this._owner = initParamObject._owner;
  }
}


ExternalAchievement.prototype = {
  constructor: ExternalAchievement,
  
  addInDb: function(conn, isPartOfTransaction) {
     return addInDb('AchievementsExternal', this, conn, isPartOfTransaction);
  },
  
  editInDb: function(externalConn, isPartOfTransaction) {
    editInDb('AchievementsExternal', this, externalConn, isPartOfTransaction);
  },
  
  deleteFromDb: function (){
    deleteFromDb ('AchievementsExternal', this);
  },
}