function getTaskTemplatesForProcessesList(parentDataObject, externalConn) {
  var processCondition = (parentDataObject && parentDataObject.processId)? 'TaskTemplatesForProcesses.ProcessId=' + parentDataObject.processId : '1';
  var taskTemplateConditon = (parentDataObject && parentDataObject.taskTemplateId)? 'TaskTemplatesForProcesses.TaskTemplateId=' + parentDataObject.taskTemplateId : '1';
  
  var sql = 'SELECT  TaskTemplatesForProcesses.Id, \n \t' +
                    'TaskTemplatesForProcesses.Name, \n \t' +
                    'TaskTemplatesForProcesses.Description, \n \t' +
                    'TaskTemplatesForProcesses.CaseTypeId, \n \t' +
                    'TaskTemplatesForProcesses.ProcessId, \n \t' +
                    'TaskTemplatesForProcesses.DeadlineRule \n' +
            'FROM TaskTemplatesForProcesses \n' + 
            'WHERE ' + processCondition + ' AND ' + taskTemplateConditon;
  return getTaskTemplatesForProcesses(sql, externalConn)
}

function getTaskTemplatesForProcessesListPerContractType(parentDataObject, externalConn) {
  var contractTypeConditon = (parentDataObject && parentDataObject.contractTypeId)? 'MilestoneTypes_ContractTypes.ContractTypeId=' + parentDataObject.contractTypeId : '1';
  
  var sql = 'SELECT  TaskTemplatesForProcesses.Id, \n \t' +
                    'TaskTemplatesForProcesses.Name, \n \t' +
                    'TaskTemplatesForProcesses.Description, \n \t' +
                    'TaskTemplatesForProcesses.CaseTypeId, \n \t' +
                    'TaskTemplatesForProcesses.ProcessId, \n \t' +
                    'TaskTemplatesForProcesses.DeadlineRule \n' +
            'FROM TaskTemplatesForProcesses \n' + 
            'JOIN CaseTypes ON CaseTypes.Id=TaskTemplatesForProcesses.CaseTypeId \n' +
            'JOIN MilestoneTypes ON CaseTypes.MilestoneTypeId=MilestoneTypes.Id \n' +
            'JOIN MilestoneTypes_ContractTypes ON MilestoneTypes.Id=MilestoneTypes_ContractTypes.MilestoneTypeId \n' +
            'WHERE ' + contractTypeConditon;
  return getTaskTemplatesForProcesses(sql, externalConn)
}

function getTaskTemplateByProcessId(processId, externalConn){
  var TaskTemplatesForProcesses = getTaskTemplatesForProcessesList({processId: processId}, externalConn);
  if(TaskTemplatesForProcesses.length>1) throw new Error("getTaskTemplateByProcessId():: Proces może mieć tylko jedno zadanie do scruma");
  return TaskTemplatesForProcesses[0];
}

function getTaskTemplatesForProcessesListPerCaseTemplate(caseTemplateId, externalConn){
  var TaskTemplatesForProcesses = getTaskTemplatesForProcessesList({caseTemplateId: caseTemplateId}, externalConn);
  return TaskTemplatesForProcesses;
}

function getTaskTemplatesForProcesses(sql, externalConn){
  try {
    Logger.log(sql);
    var result = [];
    var conn = (externalConn)? externalConn : connectToSql();
    if(!conn.isValid(0)) throw new Error ('getTaskTemplatesForProcesses:: połączenie przerwane');
    
    var stmt = conn.createStatement();
    var dbResults = stmt.executeQuery(sql);
    
    while (dbResults.next()) {
      
      var item = new TaskTemplateForProcess({id: dbResults.getLong('Id'),
                                   name: dbResults.getString('Name'),
                                   description: dbResults.getString('Description'),
                                   deadlineRule: dbResults.getString('DeadlineRule'),
                                   _caseType: {id: dbResults.getLong('CaseTypeId')
                                              },
                                   _process: {id: dbResults.getLong('ProcessId')
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

function test_addNewTaskTemplateForProcess(){
  addNewTaskTemplate('{"_gdFolderUrl":"https://drive.google.com/drive/folders/1xdE_9LZGw1Gbwy2ZptDwa25gtYzCwTyU","milestoneId":511,"description":"wetw rdt","_typeFolderNumber_TypeName_Number_Name":"04.02 ZNWU | S00 null","gdFolderId":"1xdE_9LZGw1Gbwy2ZptDwa25gtYzCwTyU","number":0,"_parent":{"contractId":367,"id":511,"gdFolderId":"19gn0o5V504b00RSy-1wzJUpKOb_uEwYv"},"_displayNumber":"S00","id":308,"_processesInstances":[{"_editor":{"id":0},"_task":{"id":185},"_case":{"id":308},"_lastUpdated":"2019-07-09 22:48:46.0","id":15,"_stepsInstances":[{"processInstanceId":15,"_processStep":{"name":"Podpisanie umowy o Roboty","description":"Archiwizacja umowy w wersji elektronicznej (skan) w SIRM","id":2},"_case":{"id":308},"_lastUpdated":"2019-07-09 22:48:47.0","processStepId":2,"id":6,"status":"Nie rozpoczęte"},{"processInstanceId":15,"_processStep":{"name":"Przekazanie Inżynierowi polisy ubezpieczenia robót","description":"","id":3},"_case":{"id":308},"_lastUpdated":"2019-07-09 22:48:47.0","processStepId":3,"id":7,"status":"Nie rozpoczęte"},{"processInstanceId":15,"_processStep":{"name":"Weryfikacja polisy ubezpieczeniowej Wykonawcy Robót wg Listy sprawdzającej","description":"Przekazać brokerowi","id":4},"_case":{"id":308},"_lastUpdated":"2019-07-09 22:48:47.0","processStepId":4,"id":8,"status":"Nie rozpoczęte"},{"processInstanceId":15,"_processStep":{"name":"Akceptacja polisy Wykonawcy Robót","description":"Przesłać do Zamawiającego pismo z akceptacją","id":5},"_case":{"id":308},"_lastUpdated":"2019-07-09 22:48:48.0","processStepId":5,"id":9,"status":"Nie rozpoczęte"}],"_process":{"name":"Rozpoczęcie robót","description":"procedura uruchamiana po zakończeniu projektowania w kontraktach na roboty.","id":1}}],"_type":{"isDefault":false,"isUniquePerMilestone":true,"folderNumber":"04.02","name":"ZNWU","id":12,"milestoneTypeId":7,"_processes":[]},"typeId":12,"name":""}')
}

function addNewTaskTemplateForProcess(itemFormClient) {
    itemFormClient = JSON.parse(itemFormClient);
    var item = new TaskTemplateForProcess(itemFormClient);
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

function test_editTaskTemplateForProcess(){
  editTaskTemplate('{"_gdFolderUrl":"https://drive.google.com/drive/folders/1xdE_9LZGw1Gbwy2ZptDwa25gtYzCwTyU","milestoneId":511,"description":"wetw rdt","_typeFolderNumber_TypeName_Number_Name":"04.02 ZNWU | S00 null","gdFolderId":"1xdE_9LZGw1Gbwy2ZptDwa25gtYzCwTyU","number":0,"_parent":{"contractId":367,"id":511,"gdFolderId":"19gn0o5V504b00RSy-1wzJUpKOb_uEwYv"},"_displayNumber":"S00","id":308,"_processesInstances":[{"_editor":{"id":0},"_task":{"id":185},"_case":{"id":308},"_lastUpdated":"2019-07-09 22:48:46.0","id":15,"_stepsInstances":[{"processInstanceId":15,"_processStep":{"name":"Podpisanie umowy o Roboty","description":"Archiwizacja umowy w wersji elektronicznej (skan) w SIRM","id":2},"_case":{"id":308},"_lastUpdated":"2019-07-09 22:48:47.0","processStepId":2,"id":6,"status":"Nie rozpoczęte"},{"processInstanceId":15,"_processStep":{"name":"Przekazanie Inżynierowi polisy ubezpieczenia robót","description":"","id":3},"_case":{"id":308},"_lastUpdated":"2019-07-09 22:48:47.0","processStepId":3,"id":7,"status":"Nie rozpoczęte"},{"processInstanceId":15,"_processStep":{"name":"Weryfikacja polisy ubezpieczeniowej Wykonawcy Robót wg Listy sprawdzającej","description":"Przekazać brokerowi","id":4},"_case":{"id":308},"_lastUpdated":"2019-07-09 22:48:47.0","processStepId":4,"id":8,"status":"Nie rozpoczęte"},{"processInstanceId":15,"_processStep":{"name":"Akceptacja polisy Wykonawcy Robót","description":"Przesłać do Zamawiającego pismo z akceptacją","id":5},"_case":{"id":308},"_lastUpdated":"2019-07-09 22:48:48.0","processStepId":5,"id":9,"status":"Nie rozpoczęte"}],"_process":{"name":"Rozpoczęcie robót","description":"procedura uruchamiana po zakończeniu projektowania w kontraktach na roboty.","id":1}}],"_type":{"isDefault":false,"isUniquePerMilestone":true,"folderNumber":"04.02","name":"ZNWU","id":12,"milestoneTypeId":7,"_processes":[]},"typeId":12,"name":""}')
}


function editTaskTemplateForProcess(itemFormClient) {
  itemFormClient = JSON.parse(itemFormClient);
  var item = new TaskTemplateForProcess(itemFormClient);
  
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

function deleteTaskTemplateForProcess(itemFormClient){
  itemFormClient = JSON.parse(itemFormClient);
  try{
    var item = new TaskTemplateForProcess(itemFormClient);
    item.deleteFromDb();
  } catch(err){
      throw err;
  }
}