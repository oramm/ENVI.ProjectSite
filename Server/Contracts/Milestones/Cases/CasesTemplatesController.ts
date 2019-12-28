function getCaseTemplatesList(initParamObject,externalConn){
  if(!initParamObject) initParamObject = {};
  
  var isDefaultCondition= (initParamObject.isDefaultOnly)? 'CaseTypes.IsDefault=TRUE' : '1';
  var isInScrumDefaultCondition = (initParamObject.isInScrumByDefaultOnly)? 'CaseTypes.IsInScrumByDefault=TRUE' : '1';
  
  var sql = 'SELECT CaseTemplates.Id, \n \t' +
                   'CaseTemplates.Name, \n \t' +
                   'CaseTemplates.Description, \n \t' +
                   'CaseTypes.Id AS CaseTypeId, \n \t' +
                   'CaseTypes.Name AS CaseTypeName, \n \t' +
                   'CaseTypes.FolderNumber AS CaseTypeFolderNumber, \n \t' +
                   'CaseTypes.IsInScrumByDefault  AS CaseTypeIsInScrumByDefault, \n \t' +
                   'CaseTypes.IsUniquePerMilestone  AS CaseTypeIsUniquePerMilestone, \n \t' +
                   'CaseTypes.IsDefault AS CaseTypeIsDefault, \n \t' +
                   'MilestoneTypes.Id AS MilestoneTypeId, \n \t' +
                   'MilestoneTypes.Name AS MilestoneTypeName, \n \t' +
                   'MilestoneTypes.IsDefault AS MilestoneTypeIsDefault \n' +
            'FROM CaseTemplates \n' +
            'JOIN CaseTypes ON CaseTypes.Id=CaseTemplates.CaseTypeId \n' +
            'JOIN MilestoneTypes ON CaseTypes.MilestoneTypeId=MilestoneTypes.Id \n' +
            'WHERE ' + isDefaultCondition + ' AND ' + isInScrumDefaultCondition;
  return getCaseTemplates(sql, externalConn);
}

function getCaseTemplatesListPerMilestoneType(initParamObject,externalConn){
  if(!initParamObject) initParamObject = {};
  
  var isDefaultCondition= (initParamObject.isDefaultOnly)? 'CaseTypes.IsDefault=TRUE' : '1';
  var isInScrumDefaultCondition = (initParamObject.isInScrumByDefaultOnly)? 'CaseTypes.IsInScrumByDefault=TRUE' : '1';
  var milestoneTypeIdCondition = (initParamObject.milestoneTypeId)? 'MilestoneTypes.Id=' + initParamObject.milestoneTypeId : '1';
  
  var sql = 'SELECT CaseTemplates.Id, \n \t' +
                   'CaseTemplates.Name, \n \t' +
                   'CaseTemplates.Description, \n \t' +
                   'CaseTypes.Id AS CaseTypeId, \n \t' +
                   'CaseTypes.Name AS CaseTypeName, \n \t' +
                   'CaseTypes.FolderNumber AS CaseTypeFolderNumber, \n \t' +
                   'CaseTypes.IsInScrumByDefault  AS CaseTypeIsInScrumByDefault, \n \t' +
                   'CaseTypes.IsUniquePerMilestone  AS CaseTypeIsUniquePerMilestone, \n \t' +
                   'CaseTypes.IsDefault AS CaseTypeIsDefault, \n \t' +
                   'MilestoneTypes.Id AS MilestoneTypeId, \n \t' +
                   'MilestoneTypes.Name AS MilestoneTypeName, \n \t' +
                   'NULL AS MilestoneTypeIsDefault \n' + //parametr niedostępny
            'FROM CaseTemplates \n' +
            'JOIN CaseTypes ON CaseTypes.Id=CaseTemplates.CaseTypeId \n' +
            'JOIN MilestoneTypes ON CaseTypes.MilestoneTypeId=MilestoneTypes.Id \n' +
            'WHERE ' + isDefaultCondition + ' AND ' + isInScrumDefaultCondition + ' AND ' + milestoneTypeIdCondition;
  return getCaseTemplates(sql, externalConn);
}

function getCaseTemplatesListPerContractType(initParamObject,externalConn){
  if(!initParamObject) initParamObject = {};
  var isDefaultCondition= (initParamObject.isDefaultOnly)? 'CaseTypes.IsDefault=TRUE' : '1';
  var isInScrumDefaultCondition = (initParamObject.isInScrumByDefaultOnly)? 'CaseTypes.IsInScrumByDefault=TRUE' : '1';
  var contractTypeIdCondition = 'MilestoneTypes_ContractTypes.ContractTypeId=' + initParamObject.contractTypeId;

  var sql = 'SELECT CaseTemplates.Id, \n \t' +
                   'CaseTemplates.Name, \n \t' +
                   'CaseTemplates.Description, \n \t' +
                   'CaseTypes.Id AS CaseTypeId, \n \t' +
                   'CaseTypes.Name AS CaseTypeName, \n \t' +
                   'CaseTypes.FolderNumber AS CaseTypeFolderNumber, \n \t' +
                   'CaseTypes.IsInScrumByDefault  AS CaseTypeIsInScrumByDefault, \n \t' +
                   'CaseTypes.IsUniquePerMilestone  AS CaseTypeIsUniquePerMilestone, \n \t' +
                   'CaseTypes.IsDefault AS CaseTypeIsDefault, \n \t' +
                   'MilestoneTypes.Id AS MilestoneTypeId, \n \t' +
                   'MilestoneTypes.Name AS MilestoneTypeName, \n \t' +
                   'MilestoneTypes_ContractTypes.IsDefault AS MilestoneTypeIsDefault \n' +
            'FROM CaseTemplates \n' +
            'JOIN CaseTypes ON CaseTypes.Id=CaseTemplates.CaseTypeId \n' +
            'JOIN MilestoneTypes ON CaseTypes.MilestoneTypeId=MilestoneTypes.Id \n' +
            'JOIN MilestoneTypes_ContractTypes ON MilestoneTypes.Id=MilestoneTypes_ContractTypes.MilestoneTypeId \n' +
            'WHERE ' + isDefaultCondition + ' AND ' + isInScrumDefaultCondition + ' AND ' + contractTypeIdCondition;
  return getCaseTemplates(sql, externalConn);
}

function getCaseTemplates(sql, externalConn){
  Logger.log(sql);
  var result = [];
  var conn = (externalConn)? externalConn : connectToSql(); 
  var stmt = conn.createStatement();
  try {
    var dbResults = stmt.executeQuery(sql);

    //var _TaskTemplates = getTaskTemplatesList(undefined, conn);  
    while (dbResults.next()) {
      var item = new CaseTemplate({id: dbResults.getLong('Id'),
                                   name: dbResults.getString('Name'),
                                   description: dbResults.getString('Description'),
                                   _caseType: new CaseType ({id: dbResults.getLong('CaseTypeId'),
                                                             name: dbResults.getString('CaseTypeName'),
                                                             folderNumber: dbResults.getString('CaseTypeFolderNumber'),
                                                             isDefault: dbResults.getBoolean('CaseTypeIsDefault'),
                                                             isInScrumByDefault: dbResults.getBoolean('CaseTypeIsInScrumByDefault'),
                                                             isUniquePerMilestone: dbResults.getBoolean('CaseTypeIsUniquePerMilestone'),
                                                             _milestoneType: new MilestoneType ({id: dbResults.getLong('MilestoneTypeId'),
                                                                                                 name: dbResults.getString('MilestoneTypeName'),
                                                                                                 _isDefault: dbResults.getBoolean('MilestoneTypeIsDefault')
                                                                                                })
                                                            }),
                                   
                                  });
      
      //item._TaskTemplates = _TaskTemplates.filter(function(currentItem){return currentItem.caseTemplateId==dbResults.getLong(1)});
      result.push(item);
    }
    dbResults.close();
    stmt.close();
    return result;
  } catch (e) {
    Logger.log(JSON.stringify(e));
    throw e;
  } finally {
    if(!externalConn && conn.isValid(0)) conn.close();
  }  
}

function test_getCaseTemplatesList(){
  getCaseTemplatesList(undefined, undefined)
}

function addNewCaseTemplate(itemFormClient) {
    itemFormClient = JSON.parse(itemFormClient);
    var item = new CaseTemplate(itemFormClient);
    try{
      var conn = connectToSql();
      conn.setAutoCommit(false);
      item.addInDb(conn);
      conn.commit();
      
      Logger.log(' item Added ItemId: ' + item.id);
      
      return item;
    } catch (err) {
      if(conn.isValid(0)) conn.rollback();
      throw err;
    } finally {
      if(conn.isValid(0)) conn.close();
    } 
}


function test_addNewCaseTemplate(){
  addNewCaseTemplate('')
}

function test_editCaseTemplate(){
  editCaseTemplate('')
}


function editCaseTemplate(itemFormClient) {
  itemFormClient = JSON.parse(itemFormClient);
  var item = new CaseTemplate(itemFormClient);
  
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

function deleteCaseTemplate(itemFormClient){
  itemFormClient = JSON.parse(itemFormClient);
  try{
    var item = new CaseTemplate(itemFormClient);
    item.deleteFromDb();
  } catch(err){
      throw err;
  }
}