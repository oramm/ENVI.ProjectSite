function MilestoneType(initParamObject) {
  if(initParamObject){
    this.id = initParamObject.id;
    this.name = initParamObject.name;
    if (initParamObject.description) 
      this.description = initParamObject.description;
    this._isDefault = initParamObject._isDefault;
    this.isInScrumByDefault = initParamObject.isInScrumByDefault;
    this.isUniquePerContract = initParamObject.isUniquePerContract;
    //potrzebny przy dodawaniu i edycji milestonów do kontraktu - łatwiej wybrać typ znając nr folderu, przy zarządzaniu typami ignorować ten atrybut
    this._folderNumber = initParamObject._folderNumber;
    this._contractType = initParamObject._contractType;
  }
}

MilestoneType.prototype = {
  constructor: MilestoneType,
  
  addInDb: function(conn, isPartOfTransaction) {
     return addInDb('MilestoneTypes', this, conn, isPartOfTransaction);
  },
  
  editInDb: function(externalConn, isPartOfTransaction) {
    return editInDb('MilestoneTypes', this, externalConn, isPartOfTransaction);
  },
  
  deleteFromDb: function (){
    deleteFromDb ('MilestoneTypes', this, undefined, undefined);
  }
}