function test_getMilestoneTypesList_NEW(){
  getMilestoneTypesList('kob.gws.01.wlasne');
}
/*
 * pobiera listę szystkich kamieni przypisanych do typów kontraktów
 */
function getMilestoneTypesList(projectId){
  var projectIdCondition = (projectId)? 'Contracts.ProjectOurId = "' + projectId + '"' : '1'
  
  var sql = 'SELECT  MilestoneTypes_ContractTypes.MilestoneTypeId, \n \t' +
                    'MilestoneTypes_ContractTypes.ContractTypeId, \n \t' +
                    'MilestoneTypes_ContractTypes.FolderNumber, \n \t' +
                    'MilestoneTypes.Name AS "MilestoneTypeName", \n \t' +
                    'MilestoneTypes.Description AS "MilestoneTypeDescription", \n \t' +
                    'MilestoneTypes_ContractTypes.IsDefault, \n \t' +
                    'MilestoneTypes.IsInScrumByDefault, \n \t' +
                    'MilestoneTypes.IsUniquePerContract, \n \t' +
                    'MilestoneTypes.LastUpdated, \n \t' +
                    'MilestoneTypes.EditorId, \n \t'+
                    'ContractTypes.Name AS "ContractTypeName", \n \t' +
                    'ContractTypes.Description AS "ContractTypeDescription" \n' +
                'FROM MilestoneTypes_ContractTypes \n' +
                'JOIN MilestoneTypes ON MilestoneTypes_ContractTypes.MilestoneTypeId = MilestoneTypes.Id \n' +
                'JOIN ContractTypes ON MilestoneTypes_ContractTypes.ContractTypeId = ContractTypes.Id \n' +
                'JOIN Contracts ON Contracts.TypeId = MilestoneTypes_ContractTypes.ContractTypeId \n' +
                'WHERE ' + projectIdCondition + ' \n'+
                //'GROUP BY MilestoneTypes_ContractTypes.MilestoneTypeId \n' + 
                'ORDER BY ContractTypes.Name, MilestoneTypes.Name';

  return getMilestoneTypes(sql, {isAll: false})
}
/*
 * pobiera listę szystkich kamieni, także tych nieprzypisanych do typów kontraktów - w panelu Admin
 */
function getAllMilestoneTypesList(){
  var sql = 'SELECT  MilestoneTypes.Id AS MilestoneTypeId, \n \t' +
                    'MilestoneTypes.Name AS MilestoneTypeName, \n \t' +
                    'MilestoneTypes.Description AS MilestoneTypeDescription, \n \t' +
                    'NULL AS IsDefault, \n \t' + //ten parametr nie jest dostępny w tym zapytaniu
                    'MilestoneTypes.IsInScrumByDefault, \n \t' +
                    'MilestoneTypes.IsUniquePerContract, \n \t' +
                    'MilestoneTypes.LastUpdated, \n \t' +
                    'MilestoneTypes.EditorId \n'+
                'FROM MilestoneTypes \n' +
                'ORDER BY MilestoneTypes.Name';
  
  return getMilestoneTypes(sql, {isAll: true})
}

function getMilestoneTypes(sql,initParamObject, externalConn){
  Logger.log(sql);
  try{
    var result = [];
    var conn = (externalConn)? externalConn : connectToSql();
    var stmt = conn.createStatement();

    var dbResults = stmt.executeQuery(sql);
    
    while (dbResults.next()) {
      var item = new MilestoneType({id: dbResults.getLong('MilestoneTypeId'),
                                    name: dbResults.getString('MilestoneTypeName'),
                                    description: dbResults.getString('MilestoneTypeDescription'),
                                    _isDefault: dbResults.getBoolean('IsDefault'),
                                    isInScrumByDefault: dbResults.getBoolean('IsInScrumByDefault'),
                                    isUniquePerContract: dbResults.getBoolean('IsUniquePerContract'),
                                    lastUpdated: dbResults.getString('LastUpdated'),
                                   });
      if(!initParamObject.isAll){
        item._contractType = {id: dbResults.getLong('ContractTypeId'),
                              name: dbResults.getString('ContractTypeName'),
                              description: dbResults.getString('ContractTypeDescription'),
                             };
        item._folderNumber = dbResults.getString('FolderNumber'); 
        item._folderNumber_MilestoneTypeName = item._folderNumber + ' ' + item.name;
      }
      result.push(item);
    }
    return result;
  } catch (e) {
    Logger.log(e);
    throw e;
  } finally {
    if(!externalConn && conn.isValid(0)) conn.close();
  }
}


function addNewMilestoneType(itemFromClient) {
  itemFromClient = JSON.parse(itemFromClient);
  var item = new MilestoneType(itemFromClient);
  item.addInDb();
  Logger.log(' item Added ItemId: ' + item.id);
  return item;
}

function test_editMilestoneType(){
  editMilestoneType('{"isInScrumByDefault":false,"isUniquePerContract":true,"_parent":{"name":"IK","id":1},"isDefault":false,"name":"Ocena merytoryczna II","id":27,"contractTypeId":1,"folderNumber":"","description":""}')
}

function editMilestoneType(itemFromClient) {
  itemFromClient = JSON.parse(itemFromClient);
  var item = new MilestoneType(itemFromClient);
  item.editInDb();
  Logger.log('item edited ItemId: ' + item.id);
  return item;
}

function deleteMilestoneType(itemFromClient){
  itemFromClient = JSON.parse(itemFromClient);
  var item = new MilestoneType();
  item.id = itemFromClient.id;
  Logger.log(JSON.stringify(item));
  item.deleteFromDb();
}