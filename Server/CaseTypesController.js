function getCaseTypesList(externalConn) {
  var sql = 'SELECT  CaseTypes.Id, \n \t' +
                    'CaseTypes.Name, \n \t' +
                    'CaseTypes.Description, \n \t' +
                    'CaseTypes.IsDefault, \n \t' +
                    'CaseTypes.IsUniquePerMilestone, \n \t' +
                    'CaseTypes.MilestoneTypeId, \n \t' +
                    'CaseTypes.FolderNumber, \n \t' +
                    'CaseTypes.LastUpdated, \n \t' +
                    'CaseTypes.EditorId \n' +
             'FROM CaseTypes';
  
  return getCaseTypes(sql, externalConn);  
}

function getCaseTypesListPerMilestone(milestoneId, externalConn) {
  
    var sql = 'SELECT  CaseTypes.Id, \n \t' +
                      'CaseTypes.Name, \n \t' +
                      'CaseTypes.Description, \n \t' +
                      'CaseTypes.IsDefault, \n \t' +
                      'CaseTypes.IsUniquePerMilestone, \n \t' +
                      'CaseTypes.MilestoneTypeId, \n \t' +
                      'CaseTypes.FolderNumber, \n \t' +
                      'CaseTypes.LastUpdated, \n \t' +
                      'CaseTypes.EditorId \n' +
               'FROM CaseTypes \n' +
               'WHERE CaseTypes.MilestoneTypeId=(SELECT TypeId FROM Milestones WHERE Id=' + milestoneId + ') OR CaseTypes.MilestoneTypeId=NULL';
  return getCaseTypes(sql, externalConn);  
}

function getCaseTypesListPerMilestoneType(milestoneTypeId, externalConn) {
  
    var sql = 'SELECT  CaseTypes.Id, \n \t' +
                      'CaseTypes.Name, \n \t' +
                      'CaseTypes.Description, \n \t' +
                      'CaseTypes.IsDefault, \n \t' +
                      'CaseTypes.IsUniquePerMilestone, \n \t' +
                      'CaseTypes.MilestoneTypeId, \n \t' +
                      'CaseTypes.FolderNumber, \n \t' +
                      'CaseTypes.LastUpdated, \n \t' +
                      'CaseTypes.EditorId \n' +
               'FROM CaseTypes \n' +
               'WHERE CaseTypes.MilestoneTypeId=' + milestoneTypeId;
  return getCaseTypes(sql, externalConn);  
}
    
function getCaseTypes(sql, externalConn){ 
  Logger.log(sql);
  try {
    var result = [];
    var conn = (externalConn)? externalConn : connectToSql(); 
    var stmt = conn.createStatement();
    var dbResults = stmt.executeQuery(sql);
    var processes = getProcessesList(conn);
    while (dbResults.next()) {
      
      var item = new CaseType({id: dbResults.getLong('Id'),
                               name: dbResults.getString('Name'),
                               description: dbResults.getString('Description'),
                               isDefault: dbResults.getBoolean('IsDefault'),
                               isUniquePerMilestone: dbResults.getBoolean('IsUniquePerMilestone'),
                               _milestoneType: {id: dbResults.getInt('MilestoneTypeId')},
                               folderNumber: dbResults.getString('FolderNumber'),
                               _processes: processes.filter(function(item){
                                 return item._caseType.id == dbResults.getLong('Id')})
                              });   
      result.push(item);
    }
    
    dbResults.close();
    return result;
  } catch (e) {
    Logger.log(e);
    throw e;
  } finally {
    conn.close();
  }
}
function test_getCaseTypesListPerMilestone(){
  getCaseTypesListPerMilestone(587)
}
function addNewCaseType(itemFromClient) {
  try{
    itemFromClient = JSON.parse(itemFromClient);
    var item = new CaseType(itemFromClient);
    var conn = connectToSql();
    item.addInDb();
    Logger.log(' item Added ItemId: ' + item.id);
    return item;
  } catch (err) {
    Logger.log(JSON.stringify(err));
    if(conn.isValid(0)) conn.rollback();
    throw err;
  } finally {
    if(conn.isValid(0)) conn.close();
  }
}

function test_addNewCaseType(){
  addNewCaseType('')
}

function editCaseType(itemFromClient) {
  try{  
    itemFromClient = JSON.parse(itemFromClient);
    var item = new CaseType(itemFromClient);
    var conn = connectToSql();
    
    item.editInDb();
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

function deleteCaseType(itemFromClient){
  itemFromClient = JSON.parse(itemFromClient);
  var item = new CaseType();
  item.id = itemFromClient.id;
  Logger.log(JSON.stringify(item));
  item.deleteFromDb();
}