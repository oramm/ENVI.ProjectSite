function getProcessesStepsInstancesListPerMilestone(milestoneId, externalConn) {
  var sql = 'SELECT  ProcessesStepsInstances.Id, \n \t' +
                    'ProcessesStepsInstances.ProcessInstanceId, \n \t' +
                    'ProcessInstances.CaseId, \n \t' +
                    'ProcessesStepsInstances.Status, \n \t' +
                    'ProcessesStepsInstances.Deadline, \n \t' +
                    'ProcessesStepsInstances.LastUpdated, \n \t' +
                    'ProcessesStepsInstances.EditorId \n \t,' +
                    'ProcessesSteps.Id, \n \t' +
                    'ProcessesSteps.Name, \n \t' +
                    'ProcessesSteps.Description, \n \t' + 
                    'ProcessesSteps.DocumentTemplateId \n' + 
             'FROM ProcessesStepsInstances \n' +
             'JOIN ProcessInstances ON ProcessesStepsInstances.ProcessInstanceId = ProcessInstances.Id \n' +
             'JOIN ProcessesSteps ON ProcessesStepsInstances.ProcessStepId = ProcessesSteps.Id \n' +
             'JOIN Processes ON ProcessInstances.ProcessId = Processes.Id \n' +
             'JOIN Cases ON Cases.Id = ProcessInstances.CaseId \n' +
             'JOIN Milestones ON Milestones.Id = Cases.MilestoneId \n' +
             'WHERE Milestones.Id = ' + milestoneId;
  return getProcessesStepsInstances(sql, {milestoneId: milestoneId}, externalConn);
}

function getProcessesStepsInstancesListPerContract(contractId, externalConn) {
  var sql = 'SELECT  ProcessesStepsInstances.Id, \n \t' +
                    'ProcessesStepsInstances.ProcessInstanceId, \n \t' +
                    'ProcessInstances.CaseId, \n \t' +
                    'ProcessesStepsInstances.Status, \n \t' +
                    'ProcessesStepsInstances.Deadline, \n \t' +
                    'ProcessesStepsInstances.LastUpdated, \n \t' +
                    'ProcessesStepsInstances.EditorId \n \t,' +
                    'ProcessesSteps.Id, \n \t' +
                    'ProcessesSteps.Name, \n \t' +
                    'ProcessesSteps.Description, \n \t' + 
                    'ProcessesSteps.DocumentTemplateId \n' + 
             'FROM ProcessesStepsInstances \n' +
             'JOIN ProcessInstances ON ProcessesStepsInstances.ProcessInstanceId = ProcessInstances.Id \n' +
             'JOIN ProcessesSteps ON ProcessesStepsInstances.ProcessStepId = ProcessesSteps.Id \n' +
             'JOIN Processes ON ProcessInstances.ProcessId = Processes.Id \n' +
             'JOIN Cases ON Cases.Id = ProcessInstances.CaseId \n' +
             'JOIN Milestones ON Milestones.Id = Cases.MilestoneId \n' +
             'JOIN Contracts ON Contracts.Id = Milestones.ContractId \n' +
             'WHERE Contracts.Id = ' + contractId;
  return getProcessesStepsInstances(sql, {contractId: contractId}, externalConn);
}

function getProcessesStepsInstances(sql, parentDataObject, externalConn){
  Logger.log(sql);
  try {
    var conn = (externalConn)? externalConn : connectToSql(); 
    var stmt = conn.createStatement();
    var result = [];
    var dbResults = stmt.executeQuery(sql);
    
    while (dbResults.next()) {
      var item = new ProcessStepInstance { id: dbResults.getLong(1),
                                           processInstanceId: dbResults.getLong(2),
                                           processStepId: dbResults.getLong(6),
                                           status: dbResults.getString(4),
                                           deadline: dbResults.getString(5),
                                           _lastUpdated: dbResults.getString(6),
                                           _processStep: { id: dbResults.getLong(8),
                                                           name: dbResults.getString(9),
                                                           description: dbResults.getString(10),
                                                           documentTemplateId: dbResults.getString(11)
                                                         },
                                           _case: { id: dbResults.getLong(3)
                                                  },
                                           _editor: { id: dbResults.getLong(7)
                                                  },
                                           
                                        }
        
      result.push(item);
    }
    
    dbResults.close();
    return result;
  } catch (e) {
    Logger.log(e);
    throw e;
  } finally {
    if (!externalConn) conn.close();
  }
  
}


function getProcessesStepsInstancesListPerMilestone_Test(){
    var x = getProcessesStepsInstancesListPerMilestone(511);
}

function addNewProcessStepInstance(itemFromClient) {
  try{
    itemFromClient = JSON.parse(itemFromClient);
    var item = new ProcessInstance(itemFromClient);
    var conn = connectToSql();
    conn.setAutoCommit(false);
    item.addInDb(conn);
    conn.commit();
    Logger.log(' item Added ItemId: ' + item.id);
    return item.id;
    } catch (err) {
      Logger.log(JSON.stringify(err));
      if(conn.isValid(0)) conn.rollback();
      throw err;
    } finally {
      if(conn.isValid(0)) conn.close();
    }
}


function test_addNewProcessInstance(){
  addNewProcessInstance(
'{"contractId":"114","date":"2019-02-12","name":"test sdfds","description":"sdfs<br />sdfsd","deadline":"2019-02-18","status":"Nowe","_owner":{"nameSurnameEmail":"Marta Listwan: mlistwan@ugk.pl","phone":"71 36 98 192","surname":"Listwan","name":"Marta","cellphone":"507 822 500","comment":"","id":1,"position":"Koordynator Projektu","email":"mlistwan@ugk.pl"},"id":"2_pending","tmpId":"2_pending"}')
}


function editProcessStepInstance(itemFromClient) {
    itemFromClient = JSON.parse(itemFromClient);
    var item = new ProcessStepInstance(itemFromClient);
    item.editInDb();
    Logger.log('item edited ItemId: ' + item.id);
}

function test_editProcessStepInstance(){
  editProcessStepInstance(
'{"processInstanceId":17,"_processStep":{"name":"Akceptacja polisy Wykonawcy Robót","description":"Przesłać do Zamawiającego pismo z akceptacją","id":5},"documentTemplateId":"0B691lwYNjRcoSGFTWmpualRjYXM","_case":{"id":316},"_lastUpdated":"2019-07-10 21:05:23.0","processStepId":5,"id":17,"_documentOpenUrl":"https://drive.google.com/open?id=0B691lwYNjRcoSGFTWmpualRjYXM","status":"Nie rozpoczęte","description":""}')
}

function deleteProcessInstance(itemFromClient){
  itemFromClient = JSON.parse(itemFromClient);
  var item = new ProcessInstance(itemFromClient);
  item.deleteFromDb();
}