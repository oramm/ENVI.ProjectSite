function getContractTypesList(status, externalConn) {
  var statusCondition = (status)? 'ContractTypes.Status="' + status +'"': '1';
  var sql = 'SELECT  ContractTypes.Id, \n \t' +
                    'ContractTypes.Name, \n \t' +
                    'ContractTypes.Description, \n \t' +
                    'ContractTypes.IsOur, \n \t' +
                    'ContractTypes.Status \n' +
            'FROM ContractTypes \n' + 
            'WHERE ' + statusCondition;
  return getContractTypes(sql, externalConn)
}

function getContractTypes(sql, externalConn){
  try {
    Logger.log(sql);
    var result = [];
    var conn = (externalConn)? externalConn : connectToSql();
    if(!conn.isValid(0)) throw new Error ('getContractTypes():: połączenie przerwane');
    
    var stmt = conn.createStatement();
    var dbResults = stmt.executeQuery(sql);
    
    while (dbResults.next()) {
      
      var item = new ContractType({id: dbResults.getInt('Id'),
                                   name: dbResults.getString('Name'),
                                   description: dbResults.getString('Description'),
                                   isOur: dbResults.getBoolean('IsOur'),
                                   status: dbResults.getString('Status'),
                                  });
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

function addNewContractType(itemFormClient) {
    itemFormClient = JSON.parse(itemFormClient);
    var item = new ContractType(itemFormClient);
    try{
      var conn = connectToSql();
      conn.setAutoCommit(false);
      item.addInDb(conn);
      conn.commit();
      
      Logger.log(' item Added ItemId: ' + item.id);
      
      return item;
    } catch (err) {
      if(conn.isValid(0)) conn.rollback();
      Logger.log(JSON.stringify(err));
      throw err;
    } finally {
      if(conn.isValid(0)) conn.close();
    } 
}

function test_addNewContractType(){
  addNewContractType('{"name":"IK","description":"Inżynier","id":"1_pending"}')
}


function editContractType(itemFormClient) {
  itemFormClient = JSON.parse(itemFormClient);
  var item = new ContractType(itemFormClient);
  
  try{ 
    var conn = connectToSql();
    item.editInDb(conn, true);
    conn.commit();
    Logger.log('item edited ItemId: ' + item.id);
    return item;
  } catch (err) {
    Logger.log(JSON.stringify(err));
    if(conn.isValid(0)) conn.rollback();
    throw err;
  } finally {
    if(conn.isValid(0)) conn.close();
  }
}

function deleteContractType(itemFormClient){
  itemFormClient = JSON.parse(itemFormClient);
  try{
    var item = new ContractType(itemFormClient);
    item.deleteFromDb();
  } catch(err){
      throw err;
  }
}

/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * 
 * * * * * * * * * * *  MilestoneTypes_ContractTypes * * * * * * * * * * * * * * * * * * * * 
 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * 
 */

function getMilestoneTypeContractTypeAssociationsList(){
  var sql = 'SELECT  MilestoneTypes_ContractTypes.MilestoneTypeId, \n \t' +
                    'MilestoneTypes_ContractTypes.ContractTypeId, \n \t' +
                    'MilestoneTypes_ContractTypes.FolderNumber, \n \t' +
                    'MilestoneTypes_ContractTypes.IsDefault, \n \t' +
                    'MilestoneTypes.Name AS "MilestoneTypeName", \n \t' +
                    'MilestoneTypes.Description AS "MilestoneTypeDescription", \n \t' +
                    'ContractTypes.Name AS "ContractTypeName", \n \t' +
                    'ContractTypes.Description AS ContractTypeDescription \n \t' +
                'FROM MilestoneTypes_ContractTypes \n' +
                'JOIN MilestoneTypes ON MilestoneTypes_ContractTypes.MilestoneTypeId = MilestoneTypes.Id \n' +
                'JOIN ContractTypes ON MilestoneTypes_ContractTypes.ContractTypeId = ContractTypes.Id \n' +
                'ORDER BY ContractTypes.Name, MilestoneTypes_ContractTypes.FolderNumber';

  return getMilestoneTypeContractTypeAssociations(sql);
}

function test_getMilestoneTypeContractTypeAssociationsPerProjectList(){
  getMilestoneTypeContractTypeAssociationsPerProjectList('kob.gws.01.wlasne');
}
function getMilestoneTypeContractTypeAssociationsPerProjectList(projectId){
  var sql = 'SELECT  MilestoneTypes_ContractTypes.MilestoneTypeId, \n \t' +
                    'MilestoneTypes_ContractTypes.ContractTypeId, \n \t' +
                    'MilestoneTypes_ContractTypes.FolderNumber, \n \t' +
                    'MilestoneTypes_ContractTypes.IsDefault, \n \t' +
                    'MilestoneTypes.Name AS "MilestoneTypeName", \n \t' +
                    'MilestoneTypes.Description AS MilestoneTypeDescription, \n \t' +
                    'ContractTypes.Name AS ContractTypeName, \n \t' +
                    'ContractTypes.Description AS ContractTypeDescription \n' +
                'FROM MilestoneTypes_ContractTypes \n' +
                'JOIN MilestoneTypes ON MilestoneTypes_ContractTypes.MilestoneTypeId = MilestoneTypes.Id \n' +
                'JOIN ContractTypes ON MilestoneTypes_ContractTypes.ContractTypeId = ContractTypes.Id \n' +
                'JOIN Contracts ON Contracts.TypeId = MilestoneTypes_ContractTypes.ContractTypeId \n' +
                'WHERE Contracts.ProjectOurId = "' + projectId + '" \n'+
                'GROUP BY MilestoneTypes_ContractTypes.MilestoneTypeId \n' + 
                'ORDER BY ContractTypes.Name, MilestoneTypes_ContractTypes.FolderNumber';

  return getMilestoneTypeContractTypeAssociations(sql)
}

function getMilestoneTypeContractTypeAssociations(sql,externalConn){
  Logger.log(sql);
  try{
    var result = [];
    var conn = (externalConn)? externalConn : connectToSql();
    var stmt = conn.createStatement();

    var dbResults = stmt.executeQuery(sql);
    
    while (dbResults.next()) {
      var item = new MilestoneTypeContractType({_milestoneType: {id: dbResults.getLong('MilestoneTypeId'),
                                                                 name: dbResults.getString('MilestoneTypeName'),
                                                                 description: dbResults.getString('MilestoneTypeDescription')
                                                                },
                                                _contractType: {id: dbResults.getLong('ContractTypeId'),
                                                                name: dbResults.getString('ContractTypeName'),
                                                                description: dbResults.getString('ContractTypeDescription'),
                                                               },
                                                isDefault: dbResults.getBoolean('IsDefault'),
                                                folderNumber: dbResults.getString('FolderNumber')
                                               });
      item._folderNumber_MilestoneTypeName = item.folderNumber + ' ' + item._milestoneType.name;
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



function addNewMilestoneTypeContractTypeAssociation(itemFormClient){
  itemFormClient = JSON.parse(itemFormClient);
  var item = new MilestoneTypeContractType(itemFormClient);

  item.addInDb();
  Logger.log('association added ItemId: ' + item._associationId);
  return item;
}

function test_addNewMilestoneTypeContractTypeAssociationInDb(){
  addNewMilestoneTypeContractTypeAssociation(
    '{"_role":{"name":"Kierownik Projektu, Inspektor br. budowlanej","description":"","id":32,"projectId":"SKW.GWS.01.POIS"},"_person":{"nameSurnameEmail":"Marta Listwan: mlistwan@ugk.pl","phone":"71 36 98 192","surname":"Listwan","name":"Marta","cellphone":"","comment":"","id":1,"position":"","email":"mlistwan@ugk.pl"},"id":132,"tmpId":"9_pending"}'
    );

}

function test_editMilestoneTypeContractTypeAssociation(){
  editMilestoneTypeContractTypeAssociation(
    '{"_contractType":{"name":"IK","description":"Inżynier","id":1},"folderNumber":"02","_milestoneType":{"isInScrumByDefault":false,"isUniquePerContract":true,"isDefault":false,"_contractTypeNameTmp":"_OLD","name":"Okres gwarancji","id":2},"id":"21","contractTypeId":1,"milestoneTypeId":2,"description":""}'
    );

}

function editMilestoneTypeContractTypeAssociation(itemFormClient) {
  itemFormClient = JSON.parse(itemFormClient);
  var item = new MilestoneTypeContractType(itemFormClient);
  
  try{ 
    var conn = connectToSql();
    conn.setAutoCommit(false);
    item.editInDb(conn, true);
    conn.commit();
    
    Logger.log('item edited ItemId: ' + item.id);
    return item;
  } catch (err) {
    Logger.log(JSON.stringify(err));
    if(conn.isValid(0)) conn.rollback();
    throw err;
  } finally {
    if(conn.isValid(0)) conn.close();
  }
}

function deleteMilestoneTypeContractTypeAssociation(item){
  var item = JSON.parse(item);
  var conn = connectToSql();
  try {
    var stmt = conn.createStatement();
    stmt.executeUpdate('DELETE FROM MilestoneTypes_ContractTypes WHERE ' +
                      'MilestoneTypeId =' + prepareValueToSql(item._milestoneType.id) +' AND ContractTypeId =' + prepareValueToSql(item._contractType.id));
  } catch (e) {
    Logger.log(e);
    throw e;
  } finally {
    conn.close();
  }
}