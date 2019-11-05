function getTaskTemplatesListPerContractType(initParamObject, externalConn) {
  var contractTypeConditon = (initParamObject && initParamObject.contractTypeId)? 'MilestoneTypes_ContractTypes.ContractTypeId=' + initParamObject.contractTypeId : '1';
  
  var sql = 'SELECT  TaskTemplates.Id, \n \t' +
                    'TaskTemplates.Name, \n \t' +
                    'TaskTemplates.Description, \n \t' +
                    'TaskTemplates.DeadlineRule, \n \t' +
                    'TaskTemplates.CaseTemplateId \n \t,' +
                    'TaskTemplates.Status, \n \t' +
                    'CaseTemplates.CaseTypeId \n' +
            'FROM TaskTemplates \n' + 
            'JOIN CaseTemplates ON CaseTemplates.Id=TaskTemplates.CaseTemplateId \n' +
            'JOIN CaseTypes ON CaseTypes.Id=CaseTemplates.CaseTypeId \n' +
            'JOIN MilestoneTypes ON CaseTypes.MilestoneTypeId=MilestoneTypes.Id \n' +
            'JOIN MilestoneTypes_ContractTypes ON MilestoneTypes.Id=MilestoneTypes_ContractTypes.MilestoneTypeId \n' +
            'WHERE ' + contractTypeConditon;
  return getTaskTemplates(sql, externalConn)
}

function getTaskTemplatesList(initParamObject, externalConn) {
  var taskTemplateConditon = (initParamObject && initParamObject.taskTemplateId)? 'TaskTemplates.TaskTemplateId=' + initParamObject.taskTemplateId : '1';
  var caseTemplateConditon = (initParamObject && initParamObject.caseTemplateId)? 'TaskTemplates.CaseTemplateId=' + initParamObject.caseTemplateId : '1';
  var caseTypeConditon = (initParamObject && initParamObject.caseTypeId)? 'CaseTemplates.CaseTypeId=' + initParamObject.caseTypeId : '1';
  
  var sql = 'SELECT  TaskTemplates.Id, \n \t' +
                    'TaskTemplates.Name, \n \t' +
                    'TaskTemplates.Description, \n \t' +
                    'TaskTemplates.DeadlineRule, \n \t' +
                    'TaskTemplates.CaseTemplateId, \n \t' +
                    'TaskTemplates.Status, \n \t' +
                    'CaseTemplates.CaseTypeId \n' +
            'FROM TaskTemplates \n' + 
            'JOIN CaseTemplates ON CaseTemplates.Id=TaskTemplates.CaseTemplateId \n' +
            'JOIN CaseTypes ON CaseTypes.Id=CaseTemplates.CaseTypeId \n' +
            'WHERE ' + taskTemplateConditon + ' AND ' + caseTemplateConditon  + ' AND ' + caseTypeConditon;
  return getTaskTemplates(sql, externalConn)
}


function getTaskTemplatesListPerCaseTemplate(caseTemplateId, externalConn){
  var taskTemplates = getTaskTemplatesList({caseTemplateId: caseTemplateId}, externalConn);
  return taskTemplates;
}

function getTaskTemplatesListPerCaseType(caseTypeId, externalConn){
  var taskTemplates = getTaskTemplatesList({caseTypeId: caseTypeId}, externalConn);
  return taskTemplates;
}

function test_getTaskTemplatesListPerContractType(){
  getTaskTemplatesListPerContractType({contractTypeId:1});
}

function getTaskTemplates(sql, externalConn){
  try {
    Logger.log(sql);
    var result = [];
    var conn = (externalConn)? externalConn : connectToSql();
    if(!conn.isValid(0)) throw new Error ('getTaskTemplates:: połączenie przerwane');
    
    var stmt = conn.createStatement();
    var dbResults = stmt.executeQuery(sql);
    
    while (dbResults.next()) {
      
      var item = new TaskTemplate({id: dbResults.getLong('Id'),
                                   name: dbResults.getString('Name'),
                                   description: dbResults.getString('Description'),
                                   deadlineRule: dbResults.getString('DeadlineRule'),
                                   status: dbResults.getString('Status'),
                                   _caseTemplate: {id: dbResults.getLong('CaseTemplateId'),
                                                   _caseType: {id: dbResults.getLong('CaseTypeId')
                                                              }
                                                  }
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

function test_addNewTaskTemplate(){
  addNewTaskTemplate('{"_gdFolderUrl":"https://drive.google.com/drive/folders/1xdE_9LZGw1Gbwy2ZptDwa25gtYzCwTyU","milestoneId":511,"description":"wetw rdt","_typeFolderNumber_TypeName_Number_Name":"04.02 ZNWU | S00 null","gdFolderId":"1xdE_9LZGw1Gbwy2ZptDwa25gtYzCwTyU","number":0,"_parent":{"contractId":367,"id":511,"gdFolderId":"19gn0o5V504b00RSy-1wzJUpKOb_uEwYv"},"_displayNumber":"S00","id":308,"_processesInstances":[{"_editor":{"id":0},"_task":{"id":185},"_case":{"id":308},"_lastUpdated":"2019-07-09 22:48:46.0","id":15,"_stepsInstances":[{"processInstanceId":15,"_processStep":{"name":"Podpisanie umowy o Roboty","description":"Archiwizacja umowy w wersji elektronicznej (skan) w SIRM","id":2},"_case":{"id":308},"_lastUpdated":"2019-07-09 22:48:47.0","processStepId":2,"id":6,"status":"Nie rozpoczęte"},{"processInstanceId":15,"_processStep":{"name":"Przekazanie Inżynierowi polisy ubezpieczenia robót","description":"","id":3},"_case":{"id":308},"_lastUpdated":"2019-07-09 22:48:47.0","processStepId":3,"id":7,"status":"Nie rozpoczęte"},{"processInstanceId":15,"_processStep":{"name":"Weryfikacja polisy ubezpieczeniowej Wykonawcy Robót wg Listy sprawdzającej","description":"Przekazać brokerowi","id":4},"_case":{"id":308},"_lastUpdated":"2019-07-09 22:48:47.0","processStepId":4,"id":8,"status":"Nie rozpoczęte"},{"processInstanceId":15,"_processStep":{"name":"Akceptacja polisy Wykonawcy Robót","description":"Przesłać do Zamawiającego pismo z akceptacją","id":5},"_case":{"id":308},"_lastUpdated":"2019-07-09 22:48:48.0","processStepId":5,"id":9,"status":"Nie rozpoczęte"}],"_process":{"name":"Rozpoczęcie robót","description":"procedura uruchamiana po zakończeniu projektowania w kontraktach na roboty.","id":1}}],"_type":{"isDefault":false,"isUniquePerMilestone":true,"folderNumber":"04.02","name":"ZNWU","id":12,"milestoneTypeId":7,"_processes":[]},"typeId":12,"name":""}')
}

function addNewTaskTemplate(itemFormClient) {
    itemFormClient = JSON.parse(itemFormClient);
    var item = new TaskTemplate(itemFormClient);
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

function test_editTaskTemplate(){
  editTaskTemplate('{"_gdFolderUrl":"https://drive.google.com/drive/folders/1xdE_9LZGw1Gbwy2ZptDwa25gtYzCwTyU","milestoneId":511,"description":"wetw rdt","_typeFolderNumber_TypeName_Number_Name":"04.02 ZNWU | S00 null","gdFolderId":"1xdE_9LZGw1Gbwy2ZptDwa25gtYzCwTyU","number":0,"_parent":{"contractId":367,"id":511,"gdFolderId":"19gn0o5V504b00RSy-1wzJUpKOb_uEwYv"},"_displayNumber":"S00","id":308,"_processesInstances":[{"_editor":{"id":0},"_task":{"id":185},"_case":{"id":308},"_lastUpdated":"2019-07-09 22:48:46.0","id":15,"_stepsInstances":[{"processInstanceId":15,"_processStep":{"name":"Podpisanie umowy o Roboty","description":"Archiwizacja umowy w wersji elektronicznej (skan) w SIRM","id":2},"_case":{"id":308},"_lastUpdated":"2019-07-09 22:48:47.0","processStepId":2,"id":6,"status":"Nie rozpoczęte"},{"processInstanceId":15,"_processStep":{"name":"Przekazanie Inżynierowi polisy ubezpieczenia robót","description":"","id":3},"_case":{"id":308},"_lastUpdated":"2019-07-09 22:48:47.0","processStepId":3,"id":7,"status":"Nie rozpoczęte"},{"processInstanceId":15,"_processStep":{"name":"Weryfikacja polisy ubezpieczeniowej Wykonawcy Robót wg Listy sprawdzającej","description":"Przekazać brokerowi","id":4},"_case":{"id":308},"_lastUpdated":"2019-07-09 22:48:47.0","processStepId":4,"id":8,"status":"Nie rozpoczęte"},{"processInstanceId":15,"_processStep":{"name":"Akceptacja polisy Wykonawcy Robót","description":"Przesłać do Zamawiającego pismo z akceptacją","id":5},"_case":{"id":308},"_lastUpdated":"2019-07-09 22:48:48.0","processStepId":5,"id":9,"status":"Nie rozpoczęte"}],"_process":{"name":"Rozpoczęcie robót","description":"procedura uruchamiana po zakończeniu projektowania w kontraktach na roboty.","id":1}}],"_type":{"isDefault":false,"isUniquePerMilestone":true,"folderNumber":"04.02","name":"ZNWU","id":12,"milestoneTypeId":7,"_processes":[]},"typeId":12,"name":""}')
}


function editTaskTemplate(itemFormClient) {
  itemFormClient = JSON.parse(itemFormClient);
  var item = new TaskTemplate(itemFormClient);
  
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

function deleteTaskTemplate(itemFormClient){
  itemFormClient = JSON.parse(itemFormClient);
  try{
    var item = new TaskTemplate(itemFormClient);
    item.deleteFromDb();
  } catch(err){
      throw err;
  }
}