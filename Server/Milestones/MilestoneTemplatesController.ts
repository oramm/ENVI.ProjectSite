function getMilestoneTemplatesList(initParamObject, externalConn) {
  var isDefaultCondition = (initParamObject && initParamObject.isDefaultOnly)? 'MilestoneTypes_ContractTypes.IsDefault=TRUE' : '1';
  var condition = (initParamObject && initParamObject.contractTypeId)? 'MilestoneTypes_ContractTypes.ContractTypeId=' + initParamObject.contractTypeId : '1';
  
  var sql = 'SELECT  MilestoneTemplates.Id, \n \t' +
                    'MilestoneTemplates.Name, \n \t' +
                    'MilestoneTemplates.Description, \n \t' +
                    'MilestoneTemplates.StartDateRule, \n \t' +
                    'MilestoneTemplates.EndDateRule, \n \t' +
                    'MilestoneTemplates.LastUpdated, \n \t' +
                    'MilestoneTypes_ContractTypes.FolderNumber, \n \t' +
                    'MilestoneTypes.Id AS MilestoneTypeId, \n \t' +
                    'MilestoneTypes.IsUniquePerContract, \n \t' +
                    'MilestoneTypes.Name AS MilestoneTypeName \n' +
            'FROM MilestoneTemplates \n' + 
            'JOIN MilestoneTypes ON MilestoneTypes.Id=MilestoneTemplates.MilestoneTypeId \n' +
            'JOIN MilestoneTypes_ContractTypes ON MilestoneTypes.Id=MilestoneTypes_ContractTypes.MilestoneTypeId \n' +
            'WHERE ' + isDefaultCondition + ' AND ' + condition + '\n' +
            'GROUP BY MilestoneTemplates.Id \n' +
            'ORDER BY MilestoneTemplates.Name';
  return getMilestoneTemplates(sql, externalConn)
}

function getMilestoneTemplatesPerContractTypeId(initParamObject, externalConn){
  var milestoneTemplates = getMilestoneTemplatesList(initParamObject, externalConn);
  return milestoneTemplates;
}


function test_getMilestoneTemplatesPerContractTypeId(){
  var milestoneTemplates = getMilestoneTemplatesList({contractTypeId:1}, undefined);
  return milestoneTemplates;
}

function getMilestoneTemplates(sql, externalConn){
  try {
    Logger.log(sql);
    var result = [];
    var conn = (externalConn)? externalConn : connectToSql();
    if(!conn.isValid(0)) throw new Error ('getMilestoneTemplates:: połączenie przerwane');
    
    var stmt = conn.createStatement();
    var dbResults = stmt.executeQuery(sql);
    
    while (dbResults.next()) {
      
      var item = new MilestoneTemplate({id: dbResults.getInt('Id'),
                                        name: dbResults.getString('Name'),
                                        description: dbResults.getString('Description'),
                                        startDateRule: dbResults.getString('StartDateRule'),
                                        endDateRule: dbResults.getString('EndDateRule'),
                                        lastUpdated: dbResults.getString('LastUpdated'),
                                        _milestoneType: {id: dbResults.getInt('MilestoneTypeId'),
                                                         name:dbResults.getString('MilestoneTypeName'),
                                                         _folderNumber: dbResults.getString('FolderNumber'),
                                                         isUniquePerContract: dbResults.getBoolean('IsUniquePerContract'),
                                                        },
                                        
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

function addNewMilestoneTemplate(itemFormClient) {
    itemFormClient = JSON.parse(itemFormClient);
    var item = new MilestoneTemplate(itemFormClient);
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

function test_addNewMilestoneTemplate(){
  addNewMilestoneTemplate('{"_milestoneType":{"isInScrumByDefault":false,"isUniquePerContract":true,"_contractType":{"name":"IK","description":"Inżynier","id":1},"isDefault":false,"_folderNumber":"02","name":"Okres gwarancji","id":2,"_folderNumber_MilestoneTypeName":"02 Okres gwarancji"},"name":"","description":"","status":""}')
}


function editMilestoneTemplate(itemFormClient) {
  itemFormClient = JSON.parse(itemFormClient);
  var item = new MilestoneTemplate(itemFormClient);
  
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

function deleteMilestoneTemplate(itemFormClient){
  itemFormClient = JSON.parse(itemFormClient);
  try{
    var item = new MilestoneTemplate(itemFormClient);
    item.deleteFromDb();
  } catch(err){
      throw err;
  }
}

