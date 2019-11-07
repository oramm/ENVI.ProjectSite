/*
UPDATE Contracts 
JOIN OurContractsData ON Contracts.Id=OurContractsData.Id
SET `TypeId` = 5
WHERE OurContractsData.OurId LIKE '%SIWZ%'
*/

function ContractType(initParamObject) {
  if(initParamObject){
    this.id = initParamObject.id;
    this.name = initParamObject.name;
    this.description = initParamObject.description;
    this.isOur = initParamObject.isOur;
    if(initParamObject.status)
      this.status = initParamObject.status;
  }
}

ContractType.prototype = {
  constructor: ContractType,
  
  addInDb: function(conn, isPartOfTransaction) {
     return addInDb('ContractTypes', this, conn, isPartOfTransaction); 
  },
  
  editInDb: function(externalConn, isPartOfTransaction) {
    editInDb('ContractTypes', this, externalConn, isPartOfTransaction);
  },
  
  deleteFromDb: function (){
    deleteFromDb ('ContractTypes', this, undefined, undefined);
  }
}

/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * 
 * * * * * * * * * * *  MilestoneTypes_ContractTypes * * * * * * * * * * * * * * * * * * * * 
 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * 
 */
function MilestoneTypeContractType(initParamObject) {
  if(initParamObject){
    this.milestoneTypeId = initParamObject._milestoneType.id;
    this.contractTypeId = initParamObject._contractType.id;
    this.folderNumber = '' + initParamObject.folderNumber;
    this.isDefault = initParamObject.isDefault;
    //id jest usuwane w addInDb(), więc przy asocjacjach musi byś ręcznie odtworeone w controllerze
    this.id = '' + this.milestoneTypeId + this.contractTypeId;
    Logger.log('this is: ' + this.id)
    this._milestoneType = initParamObject._milestoneType;
    this._contractType = initParamObject._contractType;
  }
}


MilestoneTypeContractType.prototype = {
  constructor: MilestoneTypeContractType,
  
  addInDb: function(conn) {
    return addInDb('MilestoneTypes_ContractTypes', this, undefined, undefined);
  },
  
  editInDb: function(externalConn, isPartOfTransaction) {
    var conn = (externalConn)? externalConn : connectToSql();
    try {
      var stmt = conn.createStatement();
      var sql = 'UPDATE MilestoneTypes_ContractTypes \n' +
                'SET FolderNumber=' + prepareValueToSql(this.folderNumber) + ', \n' +
                    'IsDefault=' + prepareValueToSql(this.isDefault) + '\n' +
                'WHERE MilestoneTypeId =' + prepareValueToSql(this._milestoneType.id) +' AND ContractTypeId =' + prepareValueToSql(this._contractType.id);
      
      Logger.log(sql);
      stmt.executeUpdate(sql);
    } catch (e) {
      Logger.log(e);
      throw e;
    } finally {
      if(!externalConn && conn.isValid(0)) conn.close();
    }
  },
}
